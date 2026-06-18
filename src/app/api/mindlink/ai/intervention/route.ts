import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-utils';
import { callJSON, INTERVENTION_SYSTEM } from '@/lib/openai';

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || !['admin', 'subscriber'].includes(user.role))
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });

  const { case_id } = await req.json();
  const [{ data: c }, { data: concept }, { data: report }, { data: sessions }, { data: tests }] = await Promise.all([
    supabase.from('mindlink_cases').select('*').eq('id', case_id).single(),
    supabase.from('mindlink_conceptualizations').select('*').eq('case_id', case_id).single(),
    supabase.from('mindlink_psych_reports').select('*').eq('case_id', case_id).single(),
    supabase.from('mindlink_sessions').select('*').eq('case_id', case_id).order('session_num'),
    supabase.from('mindlink_tests').select('*').eq('case_id', case_id),
  ]);
  if (!c) return NextResponse.json({ error: '사례를 찾을 수 없습니다.' }, { status: 404 });
  if (!concept) return NextResponse.json({ error: '사례개념화를 먼저 수행하십시오.' }, { status: 400 });

  const eemmGrid = concept.eemm_grid ? JSON.stringify(concept.eemm_grid, null, 2) : '(없음)';
  const networkEdges = concept.network_edges ? JSON.stringify(concept.network_edges, null, 2) : '(없음)';
  const testsSum = tests?.map(t => `  [${t.test_name}] ${t.interpretation?.slice(0, 150)}`).join('\n') ?? '(없음)';
  const sessionsSum = sessions?.slice(-3).map(s => `  회기${s.session_num}: ${s.observations?.slice(0, 120)}`).join('\n') ?? '(없음)';

  const prompt = `[내담자 기본 정보]
${c.age}세 ${c.gender} | 주호소: ${c.presenting_problems}

[EEMM 사례개념화 요약]
${concept.summary?.slice(0, 500)}
DSM 고려: ${concept.dsm_considerations?.slice(0, 200)}

[EEMM 9차원 격자 (key_concepts 포함)]
${eemmGrid.slice(0, 2000)}

[현재 심리 네트워크 연결 (weakened_edges/new_edges 예측 시 이 개념명 사용)]
${networkEdges.slice(0, 1000)}

[심리검사 보고서]
인지: ${report?.cognitive_function?.slice(0, 200) ?? '(없음)'}
정서/성격: ${report?.emotional_personality?.slice(0, 200) ?? '(없음)'}
예상진단: ${report?.expected_diagnosis?.slice(0, 150) ?? '(없음)'}

[심리검사 원자료]
${testsSum}

[최근 상담기록]
${sessionsSum}

EEMM 9차원 전체에 걸친 개입 전략 및 치료적 네트워크 변화를 예측하십시오.
_therapeutic_network의 from_concept/to_concept은 반드시 EEMM 격자에 있는 실제 key_concepts 명칭을 사용하십시오.`;

  try {
    const result = await callJSON<Record<string, unknown>>(INTERVENTION_SYSTEM, prompt, 4800);
    // store _therapeutic_network inside eemm_interventions to avoid schema change
    const eemmInterventionsWithNetwork = {
      ...(result.eemm_interventions as Record<string, unknown> ?? {}),
      _therapeutic_network: result._therapeutic_network,
    };
    const { error } = await supabase.from('mindlink_interventions').upsert({
      case_id,
      recommended_theory: result.recommended_theory,
      short_term_goals: result.short_term_goals,
      long_term_goals: result.long_term_goals,
      session_structure: result.session_structure,
      key_techniques: result.key_techniques,
      expected_duration: result.expected_duration,
      considerations: result.considerations,
      eemm_interventions: eemmInterventionsWithNetwork,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'case_id' });
    if (error) return NextResponse.json({ error: '저장 실패' }, { status: 500 });
    await supabase.from('mindlink_cases').update({ updated_at: new Date().toISOString() }).eq('id', case_id);
    // return normalized shape (same as DB row) so the client sees _therapeutic_network inside eemm_interventions
    return NextResponse.json({
      intervention: {
        ...result,
        eemm_interventions: eemmInterventionsWithNetwork,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: `AI 오류: ${(e as Error).message}` }, { status: 500 });
  }
}
