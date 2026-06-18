'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import TherapeuticNetwork from './TherapeuticNetwork';

// ── 타입 ────────────────────────────────────────────────────────────
interface DimIntervention {
  techniques?: string[];
  target_processes?: string[];
  expected_change?: string;
  rationale?: string;
}
interface TherapeuticNetworkData {
  description?: string;
  weakened_edges?: { from: string; from_concept: string; to: string; to_concept: string; type: string; reason?: string }[];
  new_edges?: { from: string; from_concept: string; to: string; to_concept: string; type: string; reason?: string }[];
  strengthened_nodes?: { cell: string; concept: string; change_type: string; change?: string }[];
  overall_prognosis?: string;
}
interface EemmInterventions {
  attention?: DimIntervention;
  cognition?: DimIntervention;
  self?: DimIntervention;
  emotion?: DimIntervention;
  behavior?: DimIntervention;
  motivation?: DimIntervention;
  bio_physiological?: DimIntervention;
  context?: DimIntervention;
  socio_cultural?: DimIntervention;
  _therapeutic_network?: TherapeuticNetworkData;
}
interface Intervention {
  recommended_theory: string;
  expected_duration: string;
  session_structure: string;
  short_term_goals: string[];
  long_term_goals: string[];
  key_techniques: string[];
  considerations: string;
  eemm_interventions: EemmInterventions;
}

// ── GRID_LAYOUT (module3와 동일 구조) ───────────────────────────────
const GRID_LAYOUT = [
  {
    layerKey: 'psychological', layer: '심리 과정', layerDesc: '내적 처리 시스템', layerColor: '#818cf8',
    cells: [
      { key: 'attention',  label: '주의',     color: '#60a5fa' },
      { key: 'cognition',  label: '인지',     color: '#a78bfa' },
      { key: 'self',       label: '자기',     color: '#22d3ee' },
    ],
  },
  {
    layerKey: 'behavioral', layer: '행동 조절', layerDesc: '반응 및 조절 체계', layerColor: '#fbbf24',
    cells: [
      { key: 'emotion',    label: '정서',     color: '#f472b6' },
      { key: 'behavior',   label: '행동',     color: '#fbbf24' },
      { key: 'motivation', label: '동기',     color: '#34d399' },
    ],
  },
  {
    layerKey: 'contextual', layer: '환경 맥락', layerDesc: '생태학적 맥락 요인', layerColor: '#f87171',
    cells: [
      { key: 'bio_physiological', label: '생물생리', color: '#f87171' },
      { key: 'context',           label: '맥락',     color: '#c084fc' },
      { key: 'socio_cultural',    label: '사회문화', color: '#fb923c' },
    ],
  },
] as const;

type TabKey = 'overview' | 'grid' | 'network';

export default function Module4({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [interv, setInterv] = useState<Intervention | null>(null);
  const [eemmGrid, setEemmGrid] = useState<Record<string, { key_concepts?: string[]; maladaptive_pattern?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TabKey>('overview');

  useEffect(() => {
    (async () => {
      const res = await fetchWithAuth(`/api/mindlink/cases/${id}`);
      if (res.ok) {
        const d = await res.json();
        if (d.intervention) setInterv(d.intervention);
        if (d.conceptualization?.eemm_grid) setEemmGrid(d.conceptualization.eemm_grid);
      }
      setLoading(false);
    })();
  }, [id]);

  async function generate() {
    setGenerating(true); setError('');
    const res = await fetchWithAuth('/api/mindlink/ai/intervention', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: id }),
    });
    if (res.ok) { const d = await res.json(); setInterv(d.intervention); }
    else { const d = await res.json(); setError(d.error ?? 'AI 오류'); }
    setGenerating(false);
  }

  const therapeuticNet = interv?.eemm_interventions?._therapeutic_network;

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'overview', label: '전략 개요' },
    { key: 'grid',     label: '차원별 개입' },
    { key: 'network',  label: '치료적 네트워크' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* breadcrumb */}
      <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
        <Link href="/mindlink" className="hover:text-white/70 transition-colors">사례 관리</Link>
        <span>›</span>
        <Link href={`/mindlink/cases/${id}`} className="hover:text-white/70 transition-colors">사례</Link>
        <span>›</span>
        <span className="text-white/70">개입 전략 설계</span>
      </div>

      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">개입 전략 설계</h1>
          <p className="text-white/40 text-xs mt-1">EEMM 9차원 개입 + 치료적 네트워크 예측 — 사례개념화 완료 후 생성 가능</p>
        </div>
        <button onClick={generate} disabled={generating}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
          {generating
            ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>생성 중...</span></>
            : <span>{interv ? '재생성' : 'AI 계획 생성'}</span>}
        </button>
      </div>

      {error && <div className="rounded-xl p-4 mb-4 border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>}

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: '#1e293b' }} />)}</div>
      ) : !interv ? (
        <div className="text-center py-20 text-white/30">
          <p className="text-5xl mb-4">🎯</p>
          <p className="text-sm">개입 계획이 없습니다</p>
          <p className="text-xs mt-1">모듈 3 (EEMM 개념화)을 먼저 완료하세요</p>
        </div>
      ) : (
        <>
          {/* tab bar */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                style={tab === t.key
                  ? { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }
                  : { color: 'rgba(255,255,255,0.35)', border: '1px solid transparent' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TAB 1: 전략 개요 ── */}
          {tab === 'overview' && (
            <div className="space-y-5">
              {/* theory + duration + structure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interv.recommended_theory && (
                  <div className="rounded-xl p-5 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <h3 className="text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">추천 치료 이론</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{interv.recommended_theory}</p>
                  </div>
                )}
                <div className="rounded-xl p-5 border border-white/10 space-y-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {interv.expected_duration && (
                    <div>
                      <h3 className="text-white/50 text-xs font-medium mb-1 uppercase tracking-wider">예상 치료 기간</h3>
                      <p className="text-white/80 text-sm">{interv.expected_duration}</p>
                    </div>
                  )}
                  {interv.session_structure && (
                    <div>
                      <h3 className="text-white/50 text-xs font-medium mb-1 uppercase tracking-wider">회기 구조</h3>
                      <p className="text-white/60 text-xs leading-relaxed">{interv.session_structure}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* goals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interv.short_term_goals?.length > 0 && (
                  <div className="rounded-xl p-5 border border-yellow-500/20" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <h3 className="text-yellow-400 text-xs font-medium mb-3 uppercase tracking-wider">단기 목표 (3개월)</h3>
                    <ul className="space-y-2">
                      {interv.short_term_goals.map((g, i) => (
                        <li key={i} className="flex gap-2 text-sm text-white/70">
                          <span className="text-yellow-400/60 shrink-0 font-mono text-xs mt-0.5">{i+1}.</span>{g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {interv.long_term_goals?.length > 0 && (
                  <div className="rounded-xl p-5 border border-blue-500/20" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <h3 className="text-blue-400 text-xs font-medium mb-3 uppercase tracking-wider">장기 목표 (6~12개월)</h3>
                    <ul className="space-y-2">
                      {interv.long_term_goals.map((g, i) => (
                        <li key={i} className="flex gap-2 text-sm text-white/70">
                          <span className="text-blue-400/60 shrink-0 font-mono text-xs mt-0.5">{i+1}.</span>{g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* key techniques */}
              {interv.key_techniques?.length > 0 && (
                <div className="rounded-xl p-5 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <h3 className="text-white/50 text-xs font-medium mb-3 uppercase tracking-wider">핵심 치료 기법</h3>
                  <div className="flex flex-wrap gap-2">
                    {interv.key_techniques.map((t, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full text-xs border border-indigo-400/30 text-indigo-300"
                        style={{ background: 'rgba(99,102,241,0.08)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {interv.considerations && (
                <div className="rounded-xl p-5 border border-orange-500/20" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <h3 className="text-orange-400 text-xs font-medium mb-2 uppercase tracking-wider">임상적 고려사항</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{interv.considerations}</p>
                </div>
              )}

              <div className="text-right text-white/20 text-xs">AI Generated — 임상가의 검토 및 수정 필요</div>
            </div>
          )}

          {/* ── TAB 2: 차원별 개입 격자 ── */}
          {tab === 'grid' && (
            <div className="space-y-6">
              {GRID_LAYOUT.map(layer => (
                <div key={layer.layerKey}>
                  {/* layer header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-0.5 h-5 rounded-full" style={{ background: layer.layerColor }} />
                    <div>
                      <span className="text-sm font-semibold" style={{ color: layer.layerColor }}>{layer.layer}</span>
                      <span className="text-white/30 text-xs ml-2">{layer.layerDesc}</span>
                    </div>
                  </div>

                  {/* 3-column grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {layer.cells.map(cell => {
                      const dim = interv.eemm_interventions?.[cell.key as keyof EemmInterventions] as DimIntervention | undefined;
                      const hasData = dim && (dim.techniques?.length || dim.expected_change || dim.rationale);

                      return (
                        <div key={cell.key} className="rounded-xl p-4 border flex flex-col gap-2"
                          style={{
                            background: hasData ? `${cell.color}08` : 'rgba(255,255,255,0.02)',
                            borderColor: hasData ? `${cell.color}30` : 'rgba(255,255,255,0.07)',
                            minHeight: 180,
                          }}>
                          {/* cell header */}
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cell.color }} />
                            <span className="text-xs font-bold" style={{ color: cell.color }}>{cell.label}</span>
                          </div>

                          {!hasData ? (
                            <p className="text-white/20 text-xs">개입 없음</p>
                          ) : (
                            <>
                              {/* techniques */}
                              {dim?.techniques && dim.techniques.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {dim.techniques.map((t, i) => (
                                    <span key={i} className="px-1.5 py-0.5 rounded text-xs"
                                      style={{ background: `${cell.color}20`, color: cell.color }}>
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* target processes */}
                              {dim?.target_processes && dim.target_processes.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {dim.target_processes.map((p, i) => (
                                    <span key={i} className="px-1.5 py-0.5 rounded text-xs border border-white/10 text-white/40">{p}</span>
                                  ))}
                                </div>
                              )}

                              {/* expected change */}
                              {dim?.expected_change && (
                                <div className="mt-auto pt-2 border-t border-white/5">
                                  <p className="text-white/40 text-xs leading-relaxed">{dim.expected_change}</p>
                                </div>
                              )}

                              {/* rationale */}
                              {dim?.rationale && (
                                <p className="text-white/25 text-xs italic leading-relaxed">{dim.rationale}</p>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="text-right text-white/20 text-xs">AI Generated — 임상가의 검토 및 수정 필요</div>
            </div>
          )}

          {/* ── TAB 3: 치료적 네트워크 ── */}
          {tab === 'network' && (
            <div className="space-y-5">
              {!therapeuticNet ? (
                <div className="text-center py-16 text-white/30">
                  <p className="text-4xl mb-3">🕸</p>
                  <p className="text-sm">치료적 네트워크 데이터가 없습니다</p>
                  <p className="text-xs mt-1">개입 전략을 재생성하면 포함됩니다</p>
                </div>
              ) : (
                <>
                  {/* description */}
                  {therapeuticNet.description && (
                    <div className="rounded-xl p-4 border border-indigo-500/20" style={{ background: 'rgba(99,102,241,0.06)' }}>
                      <p className="text-indigo-200/80 text-sm leading-relaxed">{therapeuticNet.description}</p>
                    </div>
                  )}

                  {/* network visualization */}
                  <TherapeuticNetwork eemmGrid={eemmGrid} therapeuticNetwork={therapeuticNet} />

                  {/* change details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* weakened edges */}
                    {therapeuticNet.weakened_edges && therapeuticNet.weakened_edges.length > 0 && (
                      <div className="rounded-xl p-4 border border-red-500/20" style={{ background: 'rgba(239,68,68,0.05)' }}>
                        <h3 className="text-red-400 text-xs font-semibold mb-3 uppercase tracking-wider">약화될 연결</h3>
                        <div className="space-y-2">
                          {therapeuticNet.weakened_edges.map((e, i) => (
                            <div key={i} className="text-xs text-white/60 leading-relaxed">
                              <span className="text-white/80">{e.from_concept}</span>
                              <span className="text-white/30 mx-1">→</span>
                              <span className="text-white/80">{e.to_concept}</span>
                              {e.reason && <p className="text-white/30 mt-0.5">{e.reason}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* new edges */}
                    {therapeuticNet.new_edges && therapeuticNet.new_edges.length > 0 && (
                      <div className="rounded-xl p-4 border border-green-500/20" style={{ background: 'rgba(74,222,128,0.05)' }}>
                        <h3 className="text-green-400 text-xs font-semibold mb-3 uppercase tracking-wider">새로 형성될 연결</h3>
                        <div className="space-y-2">
                          {therapeuticNet.new_edges.map((e, i) => (
                            <div key={i} className="text-xs text-white/60 leading-relaxed">
                              <span className="text-white/80">{e.from_concept}</span>
                              <span className="text-green-400/60 mx-1">→</span>
                              <span className="text-white/80">{e.to_concept}</span>
                              {e.reason && <p className="text-white/30 mt-0.5">{e.reason}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* strengthened nodes */}
                    {therapeuticNet.strengthened_nodes && therapeuticNet.strengthened_nodes.length > 0 && (
                      <div className="rounded-xl p-4 border border-emerald-500/20" style={{ background: 'rgba(52,211,153,0.05)' }}>
                        <h3 className="text-emerald-400 text-xs font-semibold mb-3 uppercase tracking-wider">강화될 요인</h3>
                        <div className="space-y-2">
                          {therapeuticNet.strengthened_nodes.map((n, i) => (
                            <div key={i} className="text-xs text-white/60 leading-relaxed">
                              <span className="text-emerald-300/80">{n.concept}</span>
                              <span className="ml-1.5 px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(52,211,153,0.15)', color: '#6ee7b7' }}>
                                {n.change_type === 'emerge' ? '신규' : '강화'}
                              </span>
                              {n.change && <p className="text-white/30 mt-0.5">{n.change}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* prognosis */}
                  {therapeuticNet.overall_prognosis && (
                    <div className="rounded-xl p-5 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <h3 className="text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">전반적 예후</h3>
                      <p className="text-white/80 text-sm leading-relaxed">{therapeuticNet.overall_prognosis}</p>
                    </div>
                  )}

                  <div className="text-right text-white/20 text-xs">AI Generated — 임상가의 검토 및 수정 필요</div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
