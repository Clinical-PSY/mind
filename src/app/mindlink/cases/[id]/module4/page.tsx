'use client';
import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import TherapeuticNetwork, { type OriginalEdge, type TherapeuticNetworkData } from './TherapeuticNetwork';
import { computeStaleness, type CaseBundle } from '@/lib/staleness';
import { notifyUpdate, listenForUpdates } from '@/lib/case-sync';
import StalenessBanner from '@/components/mindlink/StalenessBanner';

// ── 타입 ────────────────────────────────────────────────────────────
interface DimIntervention {
  techniques?: string[];
  target_processes?: string[];
  expected_change?: string;
  rationale?: string;
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

// ── 9차원 메타 ───────────────────────────────────────────────────────
const ALL_DIMS = [
  { key: 'attention',         label: '주의',     color: '#60a5fa' },
  { key: 'cognition',         label: '인지',     color: '#a78bfa' },
  { key: 'self',              label: '자기',     color: '#22d3ee' },
  { key: 'emotion',           label: '정서',     color: '#f472b6' },
  { key: 'behavior',          label: '행동',     color: '#fbbf24' },
  { key: 'motivation',        label: '동기',     color: '#34d399' },
  { key: 'bio_physiological', label: '생물생리', color: '#f87171' },
  { key: 'context',           label: '맥락',     color: '#c084fc' },
  { key: 'socio_cultural',    label: '사회문화', color: '#fb923c' },
] as const;

// ── GRID_LAYOUT ──────────────────────────────────────────────────────
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
  const [bundle, setBundle] = useState<CaseBundle>({});
  const [eemmGrid, setEemmGrid] = useState<Record<string, { key_concepts?: string[]; maladaptive_pattern?: string }>>({});
  const [originalEdges, setOriginalEdges] = useState<OriginalEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TabKey>('overview');
  const [selectedDim, setSelectedDim] = useState<string | null>(null);
  const generateRef = useRef<HTMLButtonElement>(null);

  async function loadData() {
    const res = await fetchWithAuth(`/api/mindlink/cases/${id}`);
    if (!res.ok) return;
    const d = await res.json();
    if (d.intervention) setInterv(d.intervention);
    if (d.conceptualization?.eemm_grid) setEemmGrid(d.conceptualization.eemm_grid);
    if (d.conceptualization?.network_edges) setOriginalEdges(d.conceptualization.network_edges);
    setBundle({ sessions: d.sessions, tests: d.tests, psych_report: d.psych_report,
      conceptualization: d.conceptualization, intervention: d.intervention, outcomes: d.outcomes });
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    const cleanup = listenForUpdates(id, loadData);
    const timer = setInterval(loadData, 60_000);
    return () => { cleanup(); clearInterval(timer); };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function generate() {
    setGenerating(true); setError('');
    const res = await fetchWithAuth('/api/mindlink/ai/intervention', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: id }),
    });
    if (res.ok) {
      const d = await res.json(); setInterv(d.intervention);
      notifyUpdate(id);
      await loadData();
    } else { const d = await res.json(); setError(d.error ?? 'AI 오류'); }
    setGenerating(false);
  }

  const staleness = computeStaleness(bundle);

  const therapeuticNet = interv?.eemm_interventions?._therapeutic_network;

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'overview', label: '전략 개요' },
    { key: 'grid',     label: '차원별 개입' },
    { key: 'network',  label: '치료적 네트워크' },
  ];

  // 차원별 변화 개수
  function dimChangeCount(dimKey: string) {
    if (!therapeuticNet) return 0;
    const w = (therapeuticNet.weakened_edges ?? []).filter(e => e.dimension === dimKey).length;
    const n = (therapeuticNet.new_edges ?? []).filter(e => e.dimension === dimKey).length;
    const s = (therapeuticNet.strengthened_nodes ?? []).filter(e => e.dimension === dimKey).length;
    return w + n + s;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
        <button ref={generateRef} onClick={generate} disabled={generating}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
          {generating
            ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>생성 중...</span></>
            : <span>{interv ? '재생성' : 'AI 계획 생성'}</span>}
        </button>
      </div>

      {staleness.m4 && (
        <StalenessBanner
          sources={staleness.m4Sources}
          onRegenerate={() => { generateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); generate(); }}
        />
      )}

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
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-0.5 h-5 rounded-full" style={{ background: layer.layerColor }} />
                    <div>
                      <span className="text-sm font-semibold" style={{ color: layer.layerColor }}>{layer.layer}</span>
                      <span className="text-white/30 text-xs ml-2">{layer.layerDesc}</span>
                    </div>
                  </div>
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
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cell.color }} />
                            <span className="text-xs font-bold" style={{ color: cell.color }}>{cell.label}</span>
                          </div>
                          {!hasData ? (
                            <p className="text-white/20 text-xs">개입 없음</p>
                          ) : (
                            <>
                              {dim?.techniques && dim.techniques.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {dim.techniques.map((t, i) => (
                                    <span key={i} className="px-1.5 py-0.5 rounded text-xs"
                                      style={{ background: `${cell.color}20`, color: cell.color }}>{t}</span>
                                  ))}
                                </div>
                              )}
                              {dim?.target_processes && dim.target_processes.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {dim.target_processes.map((p, i) => (
                                    <span key={i} className="px-1.5 py-0.5 rounded text-xs border border-white/10 text-white/40">{p}</span>
                                  ))}
                                </div>
                              )}
                              {dim?.expected_change && (
                                <div className="mt-auto pt-2 border-t border-white/5">
                                  <p className="text-white/40 text-xs leading-relaxed">{dim.expected_change}</p>
                                </div>
                              )}
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
            <div>
              {!therapeuticNet ? (
                <div className="text-center py-16 text-white/30">
                  <p className="text-4xl mb-3">🕸</p>
                  <p className="text-sm">치료적 네트워크 데이터가 없습니다</p>
                  <p className="text-xs mt-1">개입 전략을 재생성하면 포함됩니다</p>
                </div>
              ) : (
                <div className="flex gap-4">
                  {/* ── 좌측: 차원 선택 패널 ── */}
                  <div className="w-44 shrink-0 space-y-1.5">
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-3">차원 선택</p>
                    {ALL_DIMS.map(dim => {
                      const count = dimChangeCount(dim.key);
                      const isSelected = selectedDim === dim.key;
                      const dimInterv = interv.eemm_interventions?.[dim.key as keyof EemmInterventions] as DimIntervention | undefined;
                      const firstTech = dimInterv?.techniques?.[0];
                      return (
                        <button key={dim.key}
                          onClick={() => setSelectedDim(isSelected ? null : dim.key)}
                          className="w-full text-left px-3 py-2.5 rounded-lg transition-all border"
                          style={isSelected ? {
                            background: `${dim.color}18`,
                            borderColor: `${dim.color}50`,
                          } : {
                            background: 'rgba(255,255,255,0.02)',
                            borderColor: 'rgba(255,255,255,0.06)',
                          }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dim.color, opacity: isSelected ? 1 : 0.6 }} />
                              <span className="text-xs font-semibold"
                                style={{ color: isSelected ? dim.color : 'rgba(255,255,255,0.5)' }}>
                                {dim.label}
                              </span>
                            </div>
                            {count > 0 && (
                              <span className="text-xs rounded-full px-1.5 py-0.5 font-mono"
                                style={{ background: isSelected ? `${dim.color}30` : 'rgba(255,255,255,0.06)', color: isSelected ? dim.color : 'rgba(255,255,255,0.3)' }}>
                                {count}
                              </span>
                            )}
                          </div>
                          {firstTech && (
                            <p className="text-xs mt-1 truncate" style={{ color: isSelected ? `${dim.color}99` : 'rgba(255,255,255,0.2)' }}>
                              {firstTech}
                            </p>
                          )}
                        </button>
                      );
                    })}
                    <button onClick={() => setSelectedDim(null)}
                      className="w-full text-center text-xs mt-2 py-1.5 rounded-lg transition-all"
                      style={{ color: 'rgba(255,255,255,0.2)', background: selectedDim ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
                      전체 보기
                    </button>
                  </div>

                  {/* ── 우측: 네트워크 + 설명 ── */}
                  <div className="flex-1 min-w-0 space-y-4">
                    {/* 선택된 차원 설명 */}
                    {selectedDim && (() => {
                      const dim = ALL_DIMS.find(d => d.key === selectedDim);
                      const dimInterv = interv.eemm_interventions?.[selectedDim as keyof EemmInterventions] as DimIntervention | undefined;
                      const weakened = (therapeuticNet.weakened_edges ?? []).filter(e => e.dimension === selectedDim);
                      const newE = (therapeuticNet.new_edges ?? []).filter(e => e.dimension === selectedDim);
                      const strengthened = (therapeuticNet.strengthened_nodes ?? []).filter(n => n.dimension === selectedDim);
                      return dim ? (
                        <div className="rounded-xl p-4 border" style={{ background: `${dim.color}0a`, borderColor: `${dim.color}30` }}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: dim.color }} />
                            <span className="text-sm font-bold" style={{ color: dim.color }}>{dim.label} 개입</span>
                          </div>
                          {dimInterv?.techniques && dimInterv.techniques.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {dimInterv.techniques.map((t, i) => (
                                <span key={i} className="px-2 py-0.5 rounded text-xs"
                                  style={{ background: `${dim.color}20`, color: dim.color }}>{t}</span>
                              ))}
                            </div>
                          )}
                          {dimInterv?.expected_change && (
                            <p className="text-white/60 text-xs leading-relaxed mb-2">{dimInterv.expected_change}</p>
                          )}
                          {/* 변화 요약 */}
                          <div className="flex flex-wrap gap-3 text-xs mt-2 pt-2 border-t border-white/5">
                            {weakened.length > 0 && (
                              <span className="text-red-400/70">약화 {weakened.length}개</span>
                            )}
                            {newE.length > 0 && (
                              <span className="text-green-400/70">신규 연결 {newE.length}개</span>
                            )}
                            {strengthened.length > 0 && (
                              <span className="text-emerald-400/70">강화 {strengthened.length}개</span>
                            )}
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* 범례 */}
                    <div className="flex flex-wrap gap-4 text-xs text-white/40 px-1">
                      <span className="flex items-center gap-1.5">
                        <div className="w-5 h-4 rounded border border-dashed border-green-400 bg-green-400/10 flex items-center justify-center text-green-400 font-bold" style={{ fontSize: 7 }}>Tx</div>
                        치료 개입 노드
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#c084fc" strokeWidth="2" /></svg>
                        대상(개입→기존)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#f87171" strokeWidth="2" /></svg>
                        기존 부적응 연결
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 3" /></svg>
                        약화↓
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#4ade80" strokeWidth="2.5" /></svg>
                        새 보호↑
                      </span>
                    </div>

                    {/* SVG 네트워크 */}
                    <TherapeuticNetwork
                      eemmGrid={eemmGrid}
                      originalEdges={originalEdges}
                      therapeuticNetwork={therapeuticNet}
                      selectedDimension={selectedDim}
                    />

                    {/* 선택 차원의 변화 상세 목록 */}
                    {selectedDim && (() => {
                      const weakened = (therapeuticNet.weakened_edges ?? []).filter(e => e.dimension === selectedDim);
                      const newE = (therapeuticNet.new_edges ?? []).filter(e => e.dimension === selectedDim);
                      const strengthened = (therapeuticNet.strengthened_nodes ?? []).filter(n => n.dimension === selectedDim);
                      if (!weakened.length && !newE.length && !strengthened.length) return null;
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {weakened.length > 0 && (
                            <div className="rounded-xl p-3 border border-red-500/20" style={{ background: 'rgba(239,68,68,0.05)' }}>
                              <h4 className="text-red-400 text-xs font-semibold mb-2">약화될 연결</h4>
                              <div className="space-y-1.5">
                                {weakened.map((e, i) => (
                                  <div key={i} className="text-xs">
                                    <span className="text-white/70">{e.from_concept}</span>
                                    <span className="text-white/30 mx-1">→</span>
                                    <span className="text-white/70">{e.to_concept}</span>
                                    {e.reason && <p className="text-white/30 mt-0.5 text-xs">{e.reason}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {newE.length > 0 && (
                            <div className="rounded-xl p-3 border border-green-500/20" style={{ background: 'rgba(74,222,128,0.05)' }}>
                              <h4 className="text-green-400 text-xs font-semibold mb-2">새로 형성될 연결</h4>
                              <div className="space-y-1.5">
                                {newE.map((e, i) => (
                                  <div key={i} className="text-xs">
                                    <span className="text-white/70">{e.from_concept}</span>
                                    <span className="text-green-400/60 mx-1">→</span>
                                    <span className="text-white/70">{e.to_concept}</span>
                                    {e.reason && <p className="text-white/30 mt-0.5 text-xs">{e.reason}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {strengthened.length > 0 && (
                            <div className="rounded-xl p-3 border border-emerald-500/20" style={{ background: 'rgba(52,211,153,0.05)' }}>
                              <h4 className="text-emerald-400 text-xs font-semibold mb-2">강화될 요인</h4>
                              <div className="space-y-1.5">
                                {strengthened.map((n, i) => (
                                  <div key={i} className="text-xs">
                                    <span className="text-emerald-300/80">{n.concept}</span>
                                    <span className="ml-1.5 px-1 rounded text-xs" style={{ background: 'rgba(52,211,153,0.15)', color: '#6ee7b7' }}>
                                      {n.change_type === 'emerge' ? '신규' : '강화'}
                                    </span>
                                    {n.change && <p className="text-white/30 mt-0.5 text-xs">{n.change}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* 전반적 예후 */}
                    {therapeuticNet.overall_prognosis && (
                      <div className="rounded-xl p-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <h3 className="text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">전반적 예후</h3>
                        <p className="text-white/70 text-sm leading-relaxed">{therapeuticNet.overall_prognosis}</p>
                      </div>
                    )}

                    <div className="text-right text-white/20 text-xs">AI Generated — 임상가의 검토 및 수정 필요</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
