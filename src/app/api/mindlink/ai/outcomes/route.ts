import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';
import { callJSON, OUTCOMES_SYSTEM } from '@/lib/openai';

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role))
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });

  const { case_id } = await req.json();
  const [{ data: c }, { data: sessions }, { data: concept }, { data: interv }, { data: tests }] = await Promise.all([
    supabase.from('mindlink_cases').select('*').eq('id', case_id).single(),
    supabase.from('mindlink_sessions').select('*').eq('case_id', case_id).order('session_num'),
    supabase.from('mindlink_conceptualizations').select('summary,risk_factors,protective_factors').eq('case_id', case_id).single(),
    supabase.from('mindlink_interventions').select('recommended_theory,short_term_goals,eemm_interventions').eq('case_id', case_id).single(),
    supabase.from('mindlink_tests').select('test_name,interpretation').eq('case_id', case_id),
  ]);
  if (!c) return NextResponse.json({ error: '사례를 찾을 수 없습니다.' }, { status: 404 });

  const sessionsAll = sessions?.map(s =>
    `  회기${s.session_num}(${s.session_date}): 기분${s.mood_before ?? '?'}→${s.mood_after ?? '?'} | ${s.observations?.slice(0, 150)}`
  ).join('\n') ?? '(없음)';

  const testsAll = tests?.map(t => `  [${t.test_name}] ${t.interpretation?.slice(0, 150)}`).join('\n') ?? '(없음)';

  const prompt = `[기본 정보]
${c.age}세 ${c.gender} | 주호소: ${c.presenting_problems}

[사례개념화 요약]
${concept?.summary?.slice(0, 400) ?? '(미작성)'}

[개입 계획]
추천 이론: ${interv?.recommended_theory?.slice(0, 200) ?? '(없음)'}
단기 목표: ${JSON.stringify(interv?.short_term_goals ?? [])}

[전체 상담기록 (${sessions?.length ?? 0}회기)]
${sessionsAll}

[심리검사 원자료]
${testsAll}

현재 치료 진척도와 다음 회기 개입 방향을 분석하십시오.`;

  try {
    const result = await callJSON<Record<string, unknown>>(OUTCOMES_SYSTEM, prompt, 2500);
    const { error } = await supabase.from('mindlink_outcomes').upsert({
      case_id, ...result, generated_at: new Date().toISOString(),
    }, { onConflict: 'case_id' });
    if (error) return NextResponse.json({ error: '저장 실패' }, { status: 500 });
    return NextResponse.json({ outcomes: result });
  } catch (e) {
    return NextResponse.json({ error: `AI 오류: ${(e as Error).message}` }, { status: 500 });
  }
}
