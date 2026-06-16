'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface Concept {
  problem_structure: string; cognitive_emotional_behavioral: string;
  environmental_contextual: string; risk_factors: string[]; protective_factors: string[];
  eemm_grid: Record<string, { current_state: string; processes: string[]; functional_impact: string }>;
  summary: string; dsm_considerations: string;
}

const EEMM_DIMS: { key: string; label: string; color: string }[] = [
  { key: 'attention_consciousness', label: '주의/의식', color: '#3b82f6' },
  { key: 'cognition', label: '인지', color: '#8b5cf6' },
  { key: 'emotion', label: '정서/정동', color: '#ec4899' },
  { key: 'behavior', label: '행동/동기', color: '#f59e0b' },
  { key: 'self', label: '자기/자아', color: '#06b6d4' },
  { key: 'motivation', label: '동기/가치', color: '#10b981' },
];

export default function Module3({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetchWithAuth(`/api/mindlink/cases/${id}`);
      if (res.ok) { const d = await res.json(); if (d.conceptualization) setConcept(d.conceptualization); }
      setLoading(false);
    })();
  }, [id]);

  async function generate() {
    setGenerating(true); setError('');
    const res = await fetchWithAuth('/api/mindlink/ai/conceptualize', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: id }),
    });
    if (res.ok) { const d = await res.json(); setConcept(d.conceptualization); }
    else { const d = await res.json(); setError(d.error ?? 'AI 오류'); }
    setGenerating(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
        <Link href="/mindlink" className="hover:text-white">대시보드</Link>
        <span>›</span>
        <Link href={`/mindlink/cases/${id}`} className="hover:text-white">사례</Link>
        <span>›</span>
        <span className="text-white/70">EEMM 사례개념화</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">🧠 EEMM 사례개념화</h1>
          <p className="text-white/40 text-xs mt-1">Hayes & Hofmann (2018) 과정 기반 치료 — 6차원 분석</p>
        </div>
        <button onClick={generate} disabled={generating}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)' }}>
          {generating ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>생성 중...</span></> : <span>{concept ? '재생성' : 'AI 개념화 생성'}</span>}
        </button>
      </div>

      {error && <div className="rounded-xl p-4 mb-4 border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: '#1e293b' }} />)}</div>
      ) : !concept ? (
        <div className="text-center py-20 text-white/30">
          <p className="text-4xl mb-3">🧠</p>
          <p className="text-sm">사례개념화가 없습니다</p>
          <p className="text-xs mt-1">초기 상담기록 (1~3회기) 입력 후 AI 개념화를 생성하세요</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary & DSM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {concept.summary && (
              <div className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
                <h3 className="text-white/50 text-xs font-medium mb-2">📝 사례개념화 요약</h3>
                <p className="text-white/80 text-sm leading-relaxed">{concept.summary}</p>
              </div>
            )}
            {concept.dsm_considerations && (
              <div className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
                <h3 className="text-white/50 text-xs font-medium mb-2">🔍 DSM 진단 고려사항</h3>
                <p className="text-white/80 text-sm leading-relaxed">{concept.dsm_considerations}</p>
              </div>
            )}
          </div>

          {/* EEMM Grid */}
          {concept.eemm_grid && (
            <div>
              <h2 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">EEMM 6차원 격자</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {EEMM_DIMS.map(dim => {
                  const d = concept.eemm_grid?.[dim.key];
                  return (
                    <div key={dim.key} className="rounded-xl p-4 border" style={{ background: '#1e293b', borderColor: dim.color + '30' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: dim.color }} />
                        <span className="text-xs font-semibold" style={{ color: dim.color }}>{dim.label}</span>
                      </div>
                      {d ? (
                        <>
                          <p className="text-white/70 text-xs leading-relaxed mb-2">{d.current_state}</p>
                          {d.processes?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {d.processes.map((p, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded text-xs" style={{ background: dim.color + '20', color: dim.color }}>{p}</span>
                              ))}
                            </div>
                          )}
                          {d.functional_impact && <p className="text-white/40 text-xs">{d.functional_impact}</p>}
                        </>
                      ) : <p className="text-white/20 text-xs">데이터 없음</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Risk / Protective */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {concept.risk_factors && (
              <div className="rounded-xl p-5 border border-red-500/20" style={{ background: '#1e293b' }}>
                <h3 className="text-red-400 text-xs font-medium mb-2">⚠️ 위험 요인</h3>
                <ul className="space-y-1">
                  {(Array.isArray(concept.risk_factors) ? concept.risk_factors : [concept.risk_factors]).map((r, i) => (
                    <li key={i} className="text-white/70 text-sm flex gap-2"><span className="text-red-400/60 shrink-0">•</span>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {concept.protective_factors && (
              <div className="rounded-xl p-5 border border-green-500/20" style={{ background: '#1e293b' }}>
                <h3 className="text-green-400 text-xs font-medium mb-2">🛡️ 보호 요인</h3>
                <ul className="space-y-1">
                  {(Array.isArray(concept.protective_factors) ? concept.protective_factors : [concept.protective_factors]).map((p, i) => (
                    <li key={i} className="text-white/70 text-sm flex gap-2"><span className="text-green-400/60 shrink-0">•</span>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="text-right text-white/20 text-xs">AI Generated — 임상가의 검토 및 수정 필요</div>
        </div>
      )}
    </div>
  );
}
