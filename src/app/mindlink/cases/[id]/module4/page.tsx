'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface Intervention {
  recommended_theory: string; short_term_goals: string[]; long_term_goals: string[];
  session_structure: string; key_techniques: string[]; expected_duration: string;
  considerations: string;
  eemm_interventions: Record<string, { target_processes: string[]; techniques: string[]; rationale: string }>;
}

const EEMM_DIMS: { key: string; label: string; color: string }[] = [
  { key: 'attention_consciousness', label: '주의/의식', color: '#3b82f6' },
  { key: 'cognition', label: '인지', color: '#8b5cf6' },
  { key: 'emotion', label: '정서/정동', color: '#ec4899' },
  { key: 'behavior', label: '행동/동기', color: '#f59e0b' },
  { key: 'self', label: '자기/자아', color: '#06b6d4' },
  { key: 'motivation', label: '동기/가치', color: '#10b981' },
];

export default function Module4({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [interv, setInterv] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetchWithAuth(`/api/mindlink/cases/${id}`);
      if (res.ok) { const d = await res.json(); if (d.intervention) setInterv(d.intervention); }
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
        <Link href="/mindlink" className="hover:text-white/70 transition-colors">사례 관리</Link>
        <span>›</span>
        <Link href={`/mindlink/cases/${id}`} className="hover:text-white">사례</Link>
        <span>›</span>
        <span className="text-white/70">개입 전략 설계</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">🎯 개입 전략 설계</h1>
          <p className="text-white/40 text-xs mt-1">EEMM 차원별 치료 계획 — 사례개념화 완료 후 생성 가능</p>
        </div>
        <button onClick={generate} disabled={generating}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
          {generating ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>생성 중...</span></> : <span>{interv ? '재생성' : 'AI 계획 생성'}</span>}
        </button>
      </div>

      {error && <div className="rounded-xl p-4 mb-4 border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>}

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: '#1e293b' }} />)}</div>
      ) : !interv ? (
        <div className="text-center py-20 text-white/30">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-sm">개입 계획이 없습니다</p>
          <p className="text-xs mt-1">모듈 3 (EEMM 개념화)을 먼저 완료하세요</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Theory & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interv.recommended_theory && (
              <div className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
                <h3 className="text-white/50 text-xs font-medium mb-2">📚 추천 치료 이론</h3>
                <p className="text-white/80 text-sm leading-relaxed">{interv.recommended_theory}</p>
              </div>
            )}
            <div className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
              {interv.expected_duration && (
                <><h3 className="text-white/50 text-xs font-medium mb-1">⏱ 예상 치료 기간</h3>
                <p className="text-white/80 text-sm mb-3">{interv.expected_duration}</p></>
              )}
              {interv.session_structure && (
                <><h3 className="text-white/50 text-xs font-medium mb-1">📐 회기 구조</h3>
                <p className="text-white/70 text-xs">{interv.session_structure}</p></>
              )}
            </div>
          </div>

          {/* Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interv.short_term_goals?.length > 0 && (
              <div className="rounded-xl p-5 border border-yellow-500/20" style={{ background: '#1e293b' }}>
                <h3 className="text-yellow-400 text-xs font-medium mb-2">🎯 단기 목표</h3>
                <ul className="space-y-1.5">
                  {interv.short_term_goals.map((g, i) => (
                    <li key={i} className="text-white/70 text-sm flex gap-2"><span className="text-yellow-400/50 shrink-0 font-mono">{i+1}.</span>{g}</li>
                  ))}
                </ul>
              </div>
            )}
            {interv.long_term_goals?.length > 0 && (
              <div className="rounded-xl p-5 border border-blue-500/20" style={{ background: '#1e293b' }}>
                <h3 className="text-blue-400 text-xs font-medium mb-2">🔭 장기 목표</h3>
                <ul className="space-y-1.5">
                  {interv.long_term_goals.map((g, i) => (
                    <li key={i} className="text-white/70 text-sm flex gap-2"><span className="text-blue-400/50 shrink-0 font-mono">{i+1}.</span>{g}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Key Techniques */}
          {interv.key_techniques?.length > 0 && (
            <div className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
              <h3 className="text-white/50 text-xs font-medium mb-3">🛠 핵심 기법</h3>
              <div className="flex flex-wrap gap-2">
                {interv.key_techniques.map((t, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs border border-indigo-400/30 text-indigo-300">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* EEMM interventions */}
          {interv.eemm_interventions && (
            <div>
              <h2 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">EEMM 차원별 개입</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EEMM_DIMS.map(dim => {
                  const e = interv.eemm_interventions?.[dim.key];
                  if (!e) return null;
                  return (
                    <div key={dim.key} className="rounded-xl p-4 border" style={{ background: '#1e293b', borderColor: dim.color + '30' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: dim.color }} />
                        <span className="text-xs font-semibold" style={{ color: dim.color }}>{dim.label}</span>
                      </div>
                      {e.techniques?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {e.techniques.map((t, i) => <span key={i} className="px-1.5 py-0.5 rounded text-xs" style={{ background: dim.color + '20', color: dim.color }}>{t}</span>)}
                        </div>
                      )}
                      {e.rationale && <p className="text-white/50 text-xs leading-relaxed">{e.rationale}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {interv.considerations && (
            <div className="rounded-xl p-5 border border-orange-500/20" style={{ background: '#1e293b' }}>
              <h3 className="text-orange-400 text-xs font-medium mb-2">⚠️ 임상적 고려사항</h3>
              <p className="text-white/70 text-sm leading-relaxed">{interv.considerations}</p>
            </div>
          )}
          <div className="text-right text-white/20 text-xs">AI Generated — 임상가의 검토 및 수정 필요</div>
        </div>
      )}
    </div>
  );
}
