'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface Outcomes {
  overall_progress: string; goal_achievement: Record<string, string>;
  symptom_change: string; functional_improvement: string;
  remaining_challenges: string[]; treatment_response: string;
  termination_readiness: string; next_session_focus: string[];
  clinical_recommendations: string;
}

export default function Module6({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [outcomes, setOutcomes] = useState<Outcomes | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetchWithAuth(`/api/mindlink/cases/${id}`);
      if (res.ok) { const d = await res.json(); if (d.outcomes) setOutcomes(d.outcomes); }
      setLoading(false);
    })();
  }, [id]);

  async function generate() {
    setGenerating(true); setError('');
    const res = await fetchWithAuth('/api/mindlink/ai/outcomes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: id }),
    });
    if (res.ok) { const d = await res.json(); setOutcomes(d.outcomes); }
    else { const d = await res.json(); setError(d.error ?? 'AI 오류'); }
    setGenerating(false);
  }

  const terminationColor = (readiness: string) => {
    const l = readiness?.toLowerCase() ?? '';
    if (l.includes('높') || l.includes('준비') || l.includes('적절')) return '#22c55e';
    if (l.includes('보통') || l.includes('중간') || l.includes('점진')) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
        <Link href="/mindlink" className="hover:text-white">대시보드</Link>
        <span>›</span>
        <Link href={`/mindlink/cases/${id}`} className="hover:text-white">사례</Link>
        <span>›</span>
        <span className="text-white/70">성과 분석</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">📈 성과 분석</h1>
          <p className="text-white/40 text-xs mt-1">누적 치료 진척도 및 종결 준비도 평가</p>
        </div>
        <button onClick={generate} disabled={generating}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
          {generating ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>생성 중...</span></> : <span>{outcomes ? '재분석' : 'AI 성과 분석'}</span>}
        </button>
      </div>

      {error && <div className="rounded-xl p-4 mb-4 border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>}

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: '#1e293b' }} />)}</div>
      ) : !outcomes ? (
        <div className="text-center py-20 text-white/30">
          <p className="text-4xl mb-3">📈</p>
          <p className="text-sm">성과 분석이 없습니다</p>
          <p className="text-xs mt-1">상담 기록이 충분히 쌓인 후 분석을 생성하세요</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Termination Readiness highlight */}
          {outcomes.termination_readiness && (
            <div className="rounded-xl p-5 border" style={{ background: '#1e293b', borderColor: terminationColor(outcomes.termination_readiness) + '40' }}>
              <h3 className="text-xs font-medium mb-2" style={{ color: terminationColor(outcomes.termination_readiness) }}>🏁 종결 준비도</h3>
              <p className="text-white/80 text-sm leading-relaxed">{outcomes.termination_readiness}</p>
            </div>
          )}

          {/* Progress & symptom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outcomes.overall_progress && (
              <div className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
                <h3 className="text-white/50 text-xs font-medium mb-2">📊 전반적 진척도</h3>
                <p className="text-white/80 text-sm leading-relaxed">{outcomes.overall_progress}</p>
              </div>
            )}
            {outcomes.symptom_change && (
              <div className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
                <h3 className="text-white/50 text-xs font-medium mb-2">🔄 증상 변화</h3>
                <p className="text-white/80 text-sm leading-relaxed">{outcomes.symptom_change}</p>
              </div>
            )}
          </div>

          {outcomes.functional_improvement && (
            <div className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
              <h3 className="text-white/50 text-xs font-medium mb-2">⬆️ 기능적 향상</h3>
              <p className="text-white/80 text-sm leading-relaxed">{outcomes.functional_improvement}</p>
            </div>
          )}

          {/* Goal achievement */}
          {outcomes.goal_achievement && Object.keys(outcomes.goal_achievement).length > 0 && (
            <div className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
              <h3 className="text-white/50 text-xs font-medium mb-3">🎯 목표별 달성도</h3>
              <div className="space-y-2">
                {Object.entries(outcomes.goal_achievement).map(([goal, status]) => (
                  <div key={goal} className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{
                      background: status.toString().includes('달성') || status.toString().includes('완료') ? '#22c55e'
                        : status.toString().includes('진행') ? '#f59e0b' : '#6b7280'
                    }} />
                    <div>
                      <span className="text-white/60 text-xs">{goal}</span>
                      <span className="text-white/40 text-xs ml-2">— {status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remaining challenges */}
          {outcomes.remaining_challenges?.length > 0 && (
            <div className="rounded-xl p-5 border border-orange-500/20" style={{ background: '#1e293b' }}>
              <h3 className="text-orange-400 text-xs font-medium mb-2">⚠️ 잔존 과제</h3>
              <ul className="space-y-1">
                {outcomes.remaining_challenges.map((c, i) => (
                  <li key={i} className="text-white/70 text-sm flex gap-2"><span className="text-orange-400/50">•</span>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Next session */}
          {outcomes.next_session_focus?.length > 0 && (
            <div className="rounded-xl p-5 border border-indigo-500/20" style={{ background: '#1e293b' }}>
              <h3 className="text-indigo-400 text-xs font-medium mb-2">➡️ 다음 회기 초점</h3>
              <ul className="space-y-1">
                {outcomes.next_session_focus.map((f, i) => (
                  <li key={i} className="text-white/70 text-sm flex gap-2"><span className="text-indigo-400/50 font-mono">{i+1}.</span>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {outcomes.clinical_recommendations && (
            <div className="rounded-xl p-5 border border-green-500/20" style={{ background: '#1e293b' }}>
              <h3 className="text-green-400 text-xs font-medium mb-2">💡 임상 권고사항</h3>
              <p className="text-white/80 text-sm leading-relaxed">{outcomes.clinical_recommendations}</p>
            </div>
          )}

          <div className="text-right text-white/20 text-xs">AI Generated — 임상가의 검토 및 수정 필요</div>
        </div>
      )}
    </div>
  );
}
