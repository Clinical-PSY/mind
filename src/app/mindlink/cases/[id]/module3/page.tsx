'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import EEMMNetwork from './EEMMNetwork';

// ── 타입 ────────────────────────────────────────────────────────────
interface GridCell {
  key_concepts:       string[];
  maladaptive_pattern: string;
  clinical_indicators: string;
}
interface Edge {
  from: string; from_concept?: string;
  to:   string; to_concept?:   string;
  type: 'causes' | 'maintains' | 'correlates' | 'protects';
  label?: string;
  bidirectional?: boolean;
}
interface Concept {
  referral_background?: string;  test_results_summary?: string;
  strengths?:           string[]; vulnerabilities?:     string[];
  problem_structure?:   string;   counseling_goals?:    string;
  counseling_strategy?: string;   summary?:             string;
  dsm_considerations?:  string;   risk_factors?:        string[];
  protective_factors?:  string[];
  eemm_grid?:  Record<string, GridCell>;
  network_edges?: Edge[];
}

// ── 7섹션 라벨 ──────────────────────────────────────────────────────
const SECTIONS = [
  { key: 'referral_background',  label: '상담경위 및 관찰 특성', icon: '📋' },
  { key: 'test_results_summary', label: '심리검사 결과 개요',     icon: '📊' },
  { key: 'problem_structure',    label: '유발·유지요인 및 대처',  icon: '🔗' },
  { key: 'counseling_goals',     label: '상담 목표',              icon: '🎯' },
  { key: 'counseling_strategy',  label: '상담 전략 및 이론',      icon: '🧭' },
  { key: 'summary',              label: '종합 사례개념화',         icon: '📝' },
  { key: 'dsm_considerations',   label: 'DSM-5 진단 고려사항',    icon: '🔍' },
] as const;

// ── 9차원 격자 레이아웃 ─────────────────────────────────────────────
const GRID_LAYOUT = [
  {
    layerKey:   'psychological',
    layer:      '심리 과정',
    layerDesc:  '내적 처리 시스템',
    layerColor: '#818cf8',
    cells: [
      { key: 'attention', label: '주의',  color: '#60a5fa' },
      { key: 'cognition', label: '인지',  color: '#a78bfa' },
      { key: 'self',      label: '자기',  color: '#22d3ee' },
    ],
  },
  {
    layerKey:   'behavioral',
    layer:      '행동 조절',
    layerDesc:  '반응 및 조절 체계',
    layerColor: '#fbbf24',
    cells: [
      { key: 'emotion',    label: '정서', color: '#f472b6' },
      { key: 'behavior',   label: '행동', color: '#fbbf24' },
      { key: 'motivation', label: '동기', color: '#34d399' },
    ],
  },
  {
    layerKey:   'contextual',
    layer:      '환경 맥락',
    layerDesc:  '생태학적 맥락 요인',
    layerColor: '#f87171',
    cells: [
      { key: 'bio_physiological', label: '생물생리', color: '#f87171' },
      { key: 'context',           label: '맥락',     color: '#c084fc' },
      { key: 'socio_cultural',    label: '사회문화', color: '#fb923c' },
    ],
  },
] as const;

const EDGE_META = {
  causes:     { color: '#f87171', label: '유발' },
  maintains:  { color: '#fbbf24', label: '유지' },
  correlates: { color: '#94a3b8', label: '상관' },
  protects:   { color: '#4ade80', label: '보호' },
} as const;

// ── 메인 컴포넌트 ───────────────────────────────────────────────────
export default function Module3({ params }: { params: Promise<{ id: string }> }) {
  const { id }     = use(params);
  const [concept,    setConcept]    = useState<Concept | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error,      setError]      = useState('');
  const [activeTab,  setActiveTab]  = useState<'structured' | 'grid' | 'network'>('structured');

  useEffect(() => {
    (async () => {
      const res = await fetchWithAuth(`/api/mindlink/cases/${id}`);
      if (res.ok) {
        const d = await res.json();
        if (d.conceptualization) {
          const raw = d.conceptualization;
          const eg  = raw.eemm_grid ?? {};
          setConcept({
            ...raw,
            referral_background:  raw.referral_background  ?? eg.referral_background,
            test_results_summary: raw.test_results_summary ?? eg.test_results_summary,
            strengths:            raw.strengths            ?? eg.strengths,
            vulnerabilities:      raw.vulnerabilities      ?? eg.vulnerabilities,
            counseling_goals:     raw.counseling_goals     ?? eg.counseling_goals,
            counseling_strategy:  raw.counseling_strategy  ?? eg.counseling_strategy,
            network_edges:        raw.network_edges        ?? eg.network_edges,
          });
        }
      }
      setLoading(false);
    })();
  }, [id]);

  async function generate() {
    setGenerating(true); setError('');
    const res = await fetchWithAuth('/api/mindlink/ai/conceptualize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: id }),
    });
    if (res.ok) { const d = await res.json(); setConcept(d.conceptualization); }
    else        { const d = await res.json(); setError(d.error ?? 'AI 오류'); }
    setGenerating(false);
  }

  const TABS = [
    { key: 'structured', label: '사례개념화' },
    { key: 'grid',       label: '9차원 격자' },
    { key: 'network',    label: '심리 네트워크' },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
        <Link href="/mindlink"             className="hover:text-white/70 transition-colors">사례 관리</Link>
        <span>›</span>
        <Link href={`/mindlink/cases/${id}`} className="hover:text-white/70 transition-colors">사례</Link>
        <span>›</span>
        <span style={{ color: 'rgba(255,255,255,0.65)' }}>EEMM 사례개념화</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">EEMM 사례개념화</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Hayes &amp; Hofmann (2018) 확장진화메타모델 — 9차원 심리 네트워크
          </p>
        </div>
        <button onClick={generate} disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)' }}>
          {generating
            ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>생성 중...</span></>
            : <span>{concept ? '재생성' : 'AI 개념화 생성'}</span>}
        </button>
      </div>

      {error && (
        <div className="rounded-xl p-4 mb-4 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : !concept ? (
        <div className="text-center py-24" style={{ color: 'rgba(255,255,255,0.22)' }}>
          <p className="text-5xl mb-4">🧠</p>
          <p className="text-sm font-medium">사례개념화가 없습니다</p>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.15)' }}>
            초기 상담기록 (1~3회기) 입력 후 AI 개념화를 생성하세요
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── 탭 스위처 ── */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', width: 'fit-content', border: '1px solid rgba(255,255,255,0.07)' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={activeTab === t.key
                  ? { background: '#6366f1', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.4)' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ══════════════════════════════════════════════════════
              탭 1: 사례개념화 (7섹션)
              ══════════════════════════════════════════════════════ */}
          {activeTab === 'structured' && (
            <div className="space-y-4">

              {/* 강점 / 취약점 */}
              {(concept.strengths?.length || concept.vulnerabilities?.length) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {concept.strengths?.length ? (
                    <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <h3 className="text-xs font-semibold mb-3" style={{ color: '#4ade80' }}>✅ 강점 / 자원</h3>
                      <ul className="space-y-1.5">
                        {concept.strengths.map((s, i) => (
                          <li key={i} className="flex gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
                            <span style={{ color: 'rgba(74,222,128,0.5)' }} className="shrink-0 mt-0.5">•</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {concept.vulnerabilities?.length ? (
                    <div className="rounded-2xl p-5" style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)' }}>
                      <h3 className="text-xs font-semibold mb-3" style={{ color: '#fb923c' }}>⚠️ 취약점</h3>
                      <ul className="space-y-1.5">
                        {concept.vulnerabilities.map((v, i) => (
                          <li key={i} className="flex gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
                            <span style={{ color: 'rgba(251,146,60,0.5)' }} className="shrink-0 mt-0.5">•</span>{v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}

              {/* 7 섹션 */}
              {SECTIONS.map(({ key, label, icon }) => {
                const val = concept[key as keyof Concept];
                if (!val || (typeof val === 'string' && !val.trim())) return null;
                return (
                  <div key={key} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <h3 className="text-xs font-semibold mb-2.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {icon} {label}
                    </h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.78)' }}>
                      {val as string}
                    </p>
                  </div>
                );
              })}

              {/* 위험 / 보호 요인 */}
              {(concept.risk_factors?.length || concept.protective_factors?.length) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {concept.risk_factors?.length ? (
                    <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <h3 className="text-xs font-semibold mb-3" style={{ color: '#f87171' }}>🚨 위험 요인</h3>
                      <ul className="space-y-1.5">
                        {concept.risk_factors.map((r, i) => (
                          <li key={i} className="flex gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
                            <span style={{ color: 'rgba(248,113,113,0.5)' }} className="shrink-0 mt-0.5">•</span>{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {concept.protective_factors?.length ? (
                    <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <h3 className="text-xs font-semibold mb-3" style={{ color: '#4ade80' }}>🛡️ 보호 요인</h3>
                      <ul className="space-y-1.5">
                        {concept.protective_factors.map((p, i) => (
                          <li key={i} className="flex gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
                            <span style={{ color: 'rgba(74,222,128,0.5)' }} className="shrink-0 mt-0.5">•</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              탭 2: 9차원 격자
              ══════════════════════════════════════════════════════ */}
          {activeTab === 'grid' && concept.eemm_grid && (
            <div className="space-y-5">
              {GRID_LAYOUT.map((layer, li) => (
                <div key={layer.layerKey}>

                  {/* 레이어 헤더 */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-1 h-5 rounded-full" style={{ background: layer.layerColor }} />
                    <span className="text-xs font-bold tracking-wide" style={{ color: layer.layerColor }}>
                      {layer.layer}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
                      {layer.layerDesc}
                    </span>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${layer.layerColor}35, transparent)` }} />
                  </div>

                  {/* 3개 셀 */}
                  <div className="grid grid-cols-3 gap-3">
                    {layer.cells.map(dim => {
                      const cell = concept.eemm_grid?.[dim.key] as GridCell | undefined;
                      return (
                        <div key={dim.key} className="rounded-2xl overflow-hidden flex flex-col"
                          style={{ border: `1px solid ${dim.color}28` }}>

                          {/* 셀 헤더 */}
                          <div className="flex items-center gap-2.5 px-4 py-3"
                            style={{
                              background: `${dim.color}12`,
                              borderBottom: `1px solid ${dim.color}22`,
                            }}>
                            <div className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ background: dim.color, boxShadow: `0 0 8px ${dim.color}90` }} />
                            <span className="text-sm font-bold" style={{ color: dim.color }}>
                              {dim.label}
                            </span>
                          </div>

                          {/* 셀 본문 */}
                          <div className="flex-1 p-4" style={{ background: `${dim.color}05` }}>
                            {cell ? (
                              <div className="space-y-3">

                                {/* 핵심 개념 chips */}
                                {cell.key_concepts?.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {cell.key_concepts.map((c, ci) => (
                                      <span key={ci}
                                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                                        style={{
                                          background: dim.color + '1e',
                                          color:      dim.color,
                                          border:     `1px solid ${dim.color}35`,
                                        }}>
                                        {c}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* 부적응 패턴 */}
                                {cell.maladaptive_pattern && (
                                  <div className="pl-3 text-xs leading-relaxed"
                                    style={{
                                      borderLeft: `2px solid ${dim.color}45`,
                                      color: 'rgba(255,255,255,0.72)',
                                    }}>
                                    {cell.maladaptive_pattern}
                                  </div>
                                )}

                                {/* 임상 지표 */}
                                {cell.clinical_indicators && (
                                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                    {cell.clinical_indicators}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>데이터 없음</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 레이어 구분 */}
                  {li < GRID_LAYOUT.length - 1 && (
                    <div className="mt-5 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              탭 3: 심리 네트워크
              ══════════════════════════════════════════════════════ */}
          {activeTab === 'network' && (
            <div className="space-y-5">
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
                격자 내 개념 간 인과·유지·상관·보호 관계 — 화살표 방향이 영향 방향을 나타냄
              </p>

              {concept.eemm_grid ? (
                <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <EEMMNetwork
                    grid={concept.eemm_grid as Record<string, GridCell>}
                    edges={concept.network_edges ?? []}
                  />
                </div>
              ) : (
                <p className="text-sm text-center py-16" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  사례개념화를 먼저 생성하세요
                </p>
              )}

              {/* 엣지 목록 */}
              {concept.network_edges?.length ? (
                <div>
                  <p className="text-xs font-semibold mb-3 uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.25)' }}>연결 관계 목록</p>
                  <div className="space-y-1.5">
                    {concept.network_edges.map((e, i) => {
                      const meta = EDGE_META[e.type] ?? EDGE_META.correlates;
                      return (
                        <div key={i}
                          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ color: 'rgba(255,255,255,0.55)' }}>
                            {e.from_concept || e.from}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                            style={{ background: meta.color + '20', color: meta.color }}>
                            {e.bidirectional ? '↔' : '→'} {meta.label}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.55)' }}>
                            {e.to_concept || e.to}
                          </span>
                          {e.label && (
                            <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              {e.label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <p className="text-right text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
            AI Generated — 임상가의 검토 및 수정 필요
          </p>
        </div>
      )}
    </div>
  );
}
