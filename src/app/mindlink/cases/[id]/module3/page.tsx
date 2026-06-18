'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import EEMMNetwork from './EEMMNetwork';

interface GridCell {
  key_concepts: string[];
  maladaptive_pattern: string;
  clinical_indicators: string;
}

interface Edge {
  from: string;
  to: string;
  type: 'causes' | 'maintains' | 'correlates' | 'protects';
  label: string;
}

interface Concept {
  // 7-section structured fields
  referral_background?: string;
  test_results_summary?: string;
  strengths?: string[];
  vulnerabilities?: string[];
  problem_structure?: string;
  counseling_goals?: string;
  counseling_strategy?: string;
  // EEMM grid (9 cells + embedded extras)
  eemm_grid?: Record<string, GridCell & {
    network_edges?: Edge[];
  }>;
  // Network
  network_edges?: Edge[];
  // Summary
  summary?: string;
  dsm_considerations?: string;
  risk_factors?: string[];
  protective_factors?: string[];
}

const STRUCTURED_SECTIONS = [
  { key: 'referral_background',  label: '상담경위 및 관찰 특성', icon: '📋' },
  { key: 'test_results_summary', label: '심리검사 결과 개요',     icon: '📊' },
  { key: 'problem_structure',    label: '유발·유지요인 및 대처',  icon: '🔗' },
  { key: 'counseling_goals',     label: '상담 목표',              icon: '🎯' },
  { key: 'counseling_strategy',  label: '상담 전략 및 이론',      icon: '🧭' },
  { key: 'summary',              label: '종합 사례개념화',         icon: '📝' },
  { key: 'dsm_considerations',   label: 'DSM-5 진단 고려사항',    icon: '🔍' },
] as const;

export default function Module3({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'structured' | 'grid' | 'network'>('structured');

  useEffect(() => {
    (async () => {
      const res = await fetchWithAuth(`/api/mindlink/cases/${id}`);
      if (res.ok) {
        const d = await res.json();
        if (d.conceptualization) {
          const raw = d.conceptualization;
          // Restore embedded extras from eemm_grid
          const eg = raw.eemm_grid ?? {};
          setConcept({
            ...raw,
            referral_background: raw.referral_background ?? eg.referral_background,
            test_results_summary: raw.test_results_summary ?? eg.test_results_summary,
            strengths: raw.strengths ?? eg.strengths,
            vulnerabilities: raw.vulnerabilities ?? eg.vulnerabilities,
            counseling_goals: raw.counseling_goals ?? eg.counseling_goals,
            counseling_strategy: raw.counseling_strategy ?? eg.counseling_strategy,
            network_edges: raw.network_edges ?? eg.network_edges,
          });
        }
      }
      setLoading(false);
    })();
  }, [id]);

  async function generate() {
    setGenerating(true); setError('');
    const res = await fetchWithAuth('/api/mindlink/ai/conceptualize', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: id }),
    });
    if (res.ok) {
      const d = await res.json();
      setConcept(d.conceptualization);
    } else {
      const d = await res.json();
      setError(d.error ?? 'AI 오류');
    }
    setGenerating(false);
  }

  const tabs = [
    { key: 'structured', label: '📋 사례개념화' },
    { key: 'grid',       label: '🔲 9차원 격자' },
    { key: 'network',    label: '🕸️ 심리 네트워크' },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
        <Link href="/mindlink" className="hover:text-white/70 transition-colors">사례 관리</Link>
        <span>›</span>
        <Link href={`/mindlink/cases/${id}`} className="hover:text-white">사례</Link>
        <span>›</span>
        <span className="text-white/70">EEMM 사례개념화</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">🧠 EEMM 사례개념화</h1>
          <p className="text-white/40 text-xs mt-1">Hayes & Hofmann (2018) 확장진화메타모델 — 9차원 심리 네트워크</p>
        </div>
        <button onClick={generate} disabled={generating}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)' }}>
          {generating
            ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>생성 중...</span></>
            : <span>{concept ? '재생성' : 'AI 개념화 생성'}</span>}
        </button>
      </div>

      {error && (
        <div className="rounded-xl p-4 mb-4 border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: '#1e293b' }} />)}
        </div>
      ) : !concept ? (
        <div className="text-center py-20 text-white/30">
          <p className="text-4xl mb-3">🧠</p>
          <p className="text-sm">사례개념화가 없습니다</p>
          <p className="text-xs mt-1">초기 상담기록 (1~3회기) 입력 후 AI 개념화를 생성하세요</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#0f172a', width: 'fit-content' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={activeTab === t.key
                  ? { background: '#6366f1', color: '#fff' }
                  : { color: 'rgba(255,255,255,0.4)' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab: 사례개념화 ── */}
          {activeTab === 'structured' && (
            <div className="space-y-4">
              {/* Strengths / Vulnerabilities */}
              {(concept.strengths?.length || concept.vulnerabilities?.length) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {concept.strengths?.length ? (
                    <div className="rounded-xl p-5 border border-green-500/20" style={{ background: '#1e293b' }}>
                      <h3 className="text-green-400 text-xs font-semibold mb-3">✅ 강점 / 자원</h3>
                      <ul className="space-y-1.5">
                        {concept.strengths.map((s, i) => (
                          <li key={i} className="flex gap-2 text-sm text-white/75">
                            <span className="text-green-400/60 shrink-0 mt-0.5">•</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {concept.vulnerabilities?.length ? (
                    <div className="rounded-xl p-5 border border-amber-500/20" style={{ background: '#1e293b' }}>
                      <h3 className="text-amber-400 text-xs font-semibold mb-3">⚠️ 취약점</h3>
                      <ul className="space-y-1.5">
                        {concept.vulnerabilities.map((v, i) => (
                          <li key={i} className="flex gap-2 text-sm text-white/75">
                            <span className="text-amber-400/60 shrink-0 mt-0.5">•</span>{v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}

              {/* 7 structured sections */}
              {STRUCTURED_SECTIONS.map(({ key, label, icon }) => {
                const val = concept[key as keyof Concept];
                if (!val || (typeof val === 'string' && !val.trim())) return null;
                return (
                  <div key={key} className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
                    <h3 className="text-white/50 text-xs font-semibold mb-2">{icon} {label}</h3>
                    <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{val as string}</p>
                  </div>
                );
              })}

              {/* Risk / Protective */}
              {(concept.risk_factors?.length || concept.protective_factors?.length) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {concept.risk_factors?.length ? (
                    <div className="rounded-xl p-5 border border-red-500/20" style={{ background: '#1e293b' }}>
                      <h3 className="text-red-400 text-xs font-semibold mb-3">🚨 위험 요인</h3>
                      <ul className="space-y-1.5">
                        {concept.risk_factors.map((r, i) => (
                          <li key={i} className="flex gap-2 text-sm text-white/75">
                            <span className="text-red-400/60 shrink-0 mt-0.5">•</span>{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {concept.protective_factors?.length ? (
                    <div className="rounded-xl p-5 border border-green-500/20" style={{ background: '#1e293b' }}>
                      <h3 className="text-green-400 text-xs font-semibold mb-3">🛡️ 보호 요인</h3>
                      <ul className="space-y-1.5">
                        {concept.protective_factors.map((p, i) => (
                          <li key={i} className="flex gap-2 text-sm text-white/75">
                            <span className="text-green-400/60 shrink-0 mt-0.5">•</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: 9차원 격자 ── */}
          {activeTab === 'grid' && concept.eemm_grid && (
            <div>
              <p className="text-white/30 text-xs mb-4">
                확장진화메타모델 9차원 — 주의/인지/자기 · 정서/행동/동기 · 생물생리/맥락/사회문화
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'attention',         label: '주의',     color: '#3b82f6' },
                  { key: 'cognition',         label: '인지',     color: '#8b5cf6' },
                  { key: 'self',              label: '자기',     color: '#06b6d4' },
                  { key: 'emotion',           label: '정서',     color: '#ec4899' },
                  { key: 'behavior',          label: '행동',     color: '#f59e0b' },
                  { key: 'motivation',        label: '동기',     color: '#10b981' },
                  { key: 'bio_physiological', label: '생물생리', color: '#ef4444' },
                  { key: 'context',           label: '맥락',     color: '#a78bfa' },
                  { key: 'socio_cultural',    label: '사회문화', color: '#fb923c' },
                ].map(dim => {
                  const cell = concept.eemm_grid?.[dim.key] as GridCell | undefined;
                  return (
                    <div key={dim.key} className="rounded-xl p-4 border" style={{ background: '#1e293b', borderColor: dim.color + '30' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: dim.color }} />
                        <span className="text-xs font-semibold" style={{ color: dim.color }}>{dim.label}</span>
                      </div>
                      {cell ? (
                        <>
                          {cell.key_concepts?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {cell.key_concepts.map((c, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded text-xs"
                                  style={{ background: dim.color + '20', color: dim.color }}>{c}</span>
                              ))}
                            </div>
                          )}
                          {cell.maladaptive_pattern && (
                            <p className="text-white/70 text-xs leading-relaxed mb-1">{cell.maladaptive_pattern}</p>
                          )}
                          {cell.clinical_indicators && (
                            <p className="text-white/40 text-xs leading-relaxed">{cell.clinical_indicators}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-white/20 text-xs">데이터 없음</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Tab: 심리 네트워크 ── */}
          {activeTab === 'network' && (
            <div>
              <p className="text-white/30 text-xs mb-4">
                격자 간 인과·유지·상관·보호 관계 — 화살표 방향이 영향 방향을 나타냄
              </p>
              {concept.eemm_grid ? (
                <EEMMNetwork
                  grid={concept.eemm_grid as Record<string, GridCell>}
                  edges={concept.network_edges ?? []}
                />
              ) : (
                <p className="text-white/30 text-sm text-center py-12">사례개념화를 먼저 생성하세요</p>
              )}
              {/* Edge list */}
              {concept.network_edges?.length ? (
                <div className="mt-6 space-y-2">
                  <h3 className="text-white/40 text-xs font-semibold mb-3">연결 관계 목록</h3>
                  {concept.network_edges.map((e, i) => {
                    const typeColors = { causes: '#ef4444', maintains: '#f59e0b', correlates: '#94a3b8', protects: '#22c55e' };
                    const typeLabels = { causes: '유발', maintains: '유지', correlates: '상관', protects: '보호' };
                    const color = typeColors[e.type] ?? '#94a3b8';
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                        style={{ background: '#1e293b' }}>
                        <span className="text-white/50">{e.from}</span>
                        <span style={{ color }}>→</span>
                        <span className="text-white/50">{e.to}</span>
                        <span className="px-1.5 py-0.5 rounded text-xs ml-1" style={{ background: color + '20', color }}>
                          {typeLabels[e.type]}
                        </span>
                        <span className="text-white/60 ml-1">{e.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}

          <div className="text-right text-white/20 text-xs">AI Generated — 임상가의 검토 및 수정 필요</div>
        </div>
      )}
    </div>
  );
}
