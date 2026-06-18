import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';
import { callJSON, CONCEPTUALIZE_SYSTEM } from '@/lib/openai';

function buildSessionsText(sessions: Record<string, unknown>[]): string {
  if (!sessions?.length) return '(상담기록 없음)';
  return sessions.slice(0, 5).map(s =>
    `회기${s.session_num}(${s.session_date}): ` +
    `${(s.session_notes as string)?.slice(0, 400) ?? ''} ` +
    `관찰=${(s.soap_o as string || s.observations as string)?.slice(0, 250) ?? ''} ` +
    `평가=${(s.soap_a as string || s.counselor_notes as string)?.slice(0, 200) ?? ''}`
  ).join('\n\n');
}

function buildTestsText(tests: Record<string, unknown>[]): string {
  if (!tests?.length) return '(심리검사 없음)';
  return tests.map(t => {
    const parts = [`[${t.test_name}] (${t.test_date})`];
    if (t.scores && Object.keys(t.scores as object).length > 0)
      parts.push(`점수: ${JSON.stringify(t.scores)}`);
    if ((t.interpretation as string)?.trim())
      parts.push(`해석: ${(t.interpretation as string).slice(0, 300)}`);
    if ((t.raw_data as string)?.trim()) {
      try {
        const responses = JSON.parse(t.raw_data as string);
        const notable = Object.entries(responses)
          .filter(([, v]) => String(v).trim())
          .slice(0, 10)
          .map(([k, v]) => `${k}번→"${v}"`)
          .join(' / ');
        if (notable) parts.push(`주요 반응: ${notable}`);
      } catch { /**/ }
    }
    return parts.join(' | ');
  }).join('\n');
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role))
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });

  const { case_id } = await req.json();
  const [{ data: c }, { data: sessions }, { data: tests }, { data: report }] = await Promise.all([
    supabase.from('mindlink_cases').select('*').eq('id', case_id).single(),
    supabase.from('mindlink_sessions').select('*').eq('case_id', case_id).order('session_num'),
    supabase.from('mindlink_tests').select('*').eq('case_id', case_id),
    supabase.from('mindlink_psych_reports').select('*').eq('case_id', case_id).single(),
  ]);
  if (!c) return NextResponse.json({ error: '사례를 찾을 수 없습니다.' }, { status: 404 });

  const sessionsText = buildSessionsText((sessions ?? []) as Record<string, unknown>[]);
  const testsText = buildTestsText((tests ?? []) as Record<string, unknown>[]);
  const reportSummary = report
    ? `\n[심리검사 보고서 요약]\n${(report as Record<string, string>).summary?.slice(0, 500) ?? ''}`
    : '';
  const caseData = c as Record<string, unknown>;

  const prompt =
    `[내담자 기본정보]\n` +
    `나이: ${caseData.age}세, 성별: ${caseData.gender}\n` +
    `주호소: ${caseData.presenting_problems ?? '(기록 없음)'}\n` +
    `배경: ${caseData.background ?? '(기록 없음)'}\n` +
    `의뢰경위: ${caseData.referral_source ?? '(기록 없음)'}\n\n` +
    `[상담기록 (초기 1~5회기)]\n${sessionsText}\n\n` +
    `[심리검사 결과]\n${testsText}` +
    reportSummary + '\n\n' +
    `위 자료를 바탕으로 EEMM 9차원 네트워크 기반 사례개념화를 작성하십시오.\n` +
    `반드시 이 내담자의 구체적 자료에서 도출된 내용만 기술하고, 일반적 서술은 작성하지 마십시오.`;

  try {
    const result = await callJSON<Record<string, unknown>>(CONCEPTUALIZE_SYSTEM, prompt, 4000);
    const { error } = await supabase.from('mindlink_conceptualizations').upsert({
      case_id,
      problem_structure: result.problem_structure,
      cognitive_emotional_behavioral: result.problem_structure,
      environmental_contextual: result.counseling_strategy,
      risk_factors: result.risk_factors,
      protective_factors: result.protective_factors,
      eemm_grid: {
        ...(result.eemm_grid as object),
        network_edges: result.network_edges,
        referral_background: result.referral_background,
        test_results_summary: result.test_results_summary,
        strengths: result.strengths,
        vulnerabilities: result.vulnerabilities,
        counseling_goals: result.counseling_goals,
        counseling_strategy: result.counseling_strategy,
      },
      summary: result.summary,
      dsm_considerations: result.dsm_considerations,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'case_id' });
    if (error) return NextResponse.json({ error: '저장 실패', detail: error.message }, { status: 500 });
    await supabase.from('mindlink_cases').update({ updated_at: new Date().toISOString() }).eq('id', case_id);
    return NextResponse.json({ conceptualization: result });
  } catch (e) {
    return NextResponse.json({ error: `AI 오류: ${(e as Error).message}` }, { status: 500 });
  }
}
