import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';
import { callJSON, CONCEPTUALIZE_SYSTEM } from '@/lib/openai';

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

  const initialSessions = sessions?.slice(0, 3).map(s =>
    `  회기${s.session_num}(${s.session_date}): 관찰=${s.observations?.slice(0, 250)} / 메모=${s.counselor_notes?.slice(0, 150)}`
  ).join('\n') ?? '(기록 없음)';

  const testsText = tests?.map(t =>
    `  [${t.test_name}] 날짜:${t.test_date} | 점수:${JSON.stringify(t.scores)} | 해석:${t.interpretation?.slice(0, 250)}`
  ).join('\n') ?? '(검사 없음)';

  const reportSummary = report ? `\n[심리검사 보고서]\n${report.summary?.slice(0, 400)}` : '';

  const prompt = `[내담자 정보]
나이: ${c.age}세, 성별: ${c.gender}
주호소: ${c.presenting_problems}
배경 정보: ${c.background}
의뢰 경위: ${c.referral_source}

[초기 상담기록 (1~3회기)]
${initialSessions}

[심리검사 결과]
${testsText}
${reportSummary}

EEMM 6가지 과정 차원을 포함한 사례개념화를 작성하십시오.`;

  try {
    const result = await callJSON<Record<string, unknown>>(CONCEPTUALIZE_SYSTEM, prompt, 3500);
    const { error } = await supabase.from('mindlink_conceptualizations').upsert({
      case_id,
      problem_structure: result.problem_structure,
      cognitive_emotional_behavioral: result.cognitive_emotional_behavioral,
      environmental_contextual: result.environmental_contextual,
      risk_factors: result.risk_factors,
      protective_factors: result.protective_factors,
      eemm_grid: result.eemm_grid,
      summary: result.summary,
      dsm_considerations: result.dsm_considerations,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'case_id' });
    if (error) return NextResponse.json({ error: '저장 실패' }, { status: 500 });
    await supabase.from('mindlink_cases').update({ updated_at: new Date().toISOString() }).eq('id', case_id);
    return NextResponse.json({ conceptualization: result });
  } catch (e) {
    return NextResponse.json({ error: `AI 오류: ${(e as Error).message}` }, { status: 500 });
  }
}
