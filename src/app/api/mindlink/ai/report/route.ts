import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';
import { callJSON, PSYCH_REPORT_SYSTEM } from '@/lib/openai';

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

  const testsText = tests?.length
    ? tests.map(t => `[${t.test_name}] 날짜:${t.test_date} | 점수:${JSON.stringify(t.scores)} | 해석:${t.interpretation}`).join('\n')
    : '(심리검사 결과 없음 — 임상관찰 기반으로 추론)';

  const sessionsText = sessions?.slice(-5).map(s =>
    `회기${s.session_num}(${s.session_date}): 관찰=${s.observations?.slice(0, 200)} / 메모=${s.counselor_notes?.slice(0, 100)}`
  ).join('\n') ?? '(기록 없음)';

  const prompt = `[내담자 정보]
나이: ${c.age}세, 성별: ${c.gender}, 주호소: ${c.presenting_problems}
배경: ${c.background}

[심리검사 결과]
${testsText}

[최근 상담기록]
${sessionsText}

위 자료를 바탕으로 전문적인 심리검사 보고서를 작성하십시오.`;

  try {
    const result = await callJSON<Record<string, string>>(PSYCH_REPORT_SYSTEM, prompt, 3000);
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
