import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';
import { callJSON, EXTRACT_SYSTEM, PSYCH_REPORT_SYSTEM } from '@/lib/openai';

function buildTestsRaw(tests: Record<string, unknown>[]): string {
  if (!tests?.length) return '(심리검사 결과 없음)';

  return tests.map(t => {
    const parts: string[] = [
      `\n【${t.test_name}】 (${t.test_date} | 분류: ${t.category ?? ''}/${t.sub_type ?? ''})`,
    ];

    if (t.scores && Object.keys(t.scores as object).length > 0) {
      parts.push(`점수 데이터:\n${JSON.stringify(t.scores, null, 2)}`);
    }

    if ((t.interpretation as string)?.trim()) {
      parts.push(`상담사 해석 메모: ${t.interpretation}`);
    }

    if ((t.raw_data as string)?.trim()) {
      try {
        const parsed = JSON.parse(t.raw_data as string);
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          const lines = Object.entries(parsed)
            .filter(([, v]) => String(v).trim())
            .map(([k, v]) => `  ${k}번. → "${v}"`)
            .join('\n');
          if (lines) parts.push(`직접 반응 데이터 (전체):\n${lines}`);
        }
      } catch {
        const raw = t.raw_data as string;
        if (raw.length < 3000) parts.push(`원자료: ${raw}`);
      }
    }

    return parts.join('\n');
  }).join('\n\n' + '─'.repeat(50) + '\n\n');
}

function buildSessionsText(sessions: Record<string, unknown>[]): string {
  if (!sessions?.length) return '(상담기록 없음)';
  return sessions.slice(-8).map(s =>
    `회기${s.session_num}(${s.session_date}): ` +
    `${(s.session_notes as string)?.slice(0, 300) ?? ''} ` +
    `관찰=${(s.soap_o as string || s.observations as string)?.slice(0, 200) ?? ''} ` +
    `평가=${(s.soap_a as string || s.counselor_notes as string)?.slice(0, 150) ?? ''}`
  ).join('\n');
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role))
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });

  const { case_id } = await req.json();
  const [{ data: c }, { data: sessions }, { data: tests }] = await Promise.all([
    supabase.from('mindlink_cases').select('*').eq('id', case_id).single(),
    supabase.from('mindlink_sessions').select('*').eq('case_id', case_id).order('session_num'),
    supabase.from('mindlink_tests').select('*').eq('case_id', case_id),
  ]);
  if (!c) return NextResponse.json({ error: '사례를 찾을 수 없습니다.' }, { status: 404 });

  const testsRaw = buildTestsRaw((tests ?? []) as Record<string, unknown>[]);
  const sessionsText = buildSessionsText((sessions ?? []) as Record<string, unknown>[]);

  // ─── 1단계: 임상 발견사항 추출 ───────────────────────────
  let findings: Record<string, unknown> = {};
  try {
    findings = await callJSON<Record<string, unknown>>(
      EXTRACT_SYSTEM,
      `아래 심리검사 원자료와 상담기록에서 임상적으로 유의한 발견을 추출하십시오.\n\n` +
      `[심리검사 원자료]\n${testsRaw}\n\n` +
      `[상담기록]\n${sessionsText}`,
      2500,
    );
  } catch {
    // 추출 실패 시 원자료 직접 사용
  }

  // ─── 2단계: 보고서 작성 (추출된 발견사항만 인용) ──────────
  const reportPrompt =
    `[내담자 기본 정보]\n` +
    `나이: ${(c as Record<string,unknown>).age}세, 성별: ${(c as Record<string,unknown>).gender}\n` +
    `주호소: ${(c as Record<string,unknown>).presenting_problems ?? '(기록 없음)'}\n` +
    `배경: ${(c as Record<string,unknown>).background ?? '(기록 없음)'}\n\n` +
    `[1단계 추출된 임상 발견사항]\n` +
    `아래 내용에 있는 수치와 반응만 인용하여 보고서를 작성하십시오.\n` +
    `이 목록에 없는 수치는 절대 작성하지 마십시오.\n` +
    JSON.stringify(findings, null, 2) + '\n\n' +
    `[최근 상담기록]\n${sessionsText}\n\n` +
    `위 발견사항을 바탕으로 전문적인 심리평가 보고서를 JSON 형식으로 작성하십시오.`;

  try {
    const result = await callJSON<Record<string, string>>(PSYCH_REPORT_SYSTEM, reportPrompt, 4500);
    const { error } = await supabase.from('mindlink_psych_reports').upsert({
      case_id, ...result, updated_at: new Date().toISOString(),
    }, { onConflict: 'case_id' });
    if (error) return NextResponse.json({ error: '저장 실패' }, { status: 500 });
    await supabase.from('mindlink_cases').update({ updated_at: new Date().toISOString() }).eq('id', case_id);
    return NextResponse.json({ report: result });
  } catch (e) {
    return NextResponse.json({ error: `AI 오류: ${(e as Error).message}` }, { status: 500 });
  }
}
