'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface Case {
  id: string; client_alias: string; age: number; gender: string;
  presenting_problems: string; background: string; referral_source: string;
  status: string; created_at: string; updated_at: string;
  sessions_count?: number; tests_count?: number;
}

const modules = [
  { num: 1, title: '회기 기록 & 검사', icon: '📝', desc: '상담기록 입력 및 심리검사 결과 관리', color: '#3b82f6' },
  { num: 2, title: '심리검사 보고서', icon: '📊', desc: 'AI 기반 통합 심리평가 보고서 생성', color: '#8b5cf6' },
  { num: 3, title: 'EEMM 사례개념화', icon: '🧠', desc: '과정 기반 치료(PBT) 6차원 분석', color: '#06b6d4' },
  { num: 4, title: '개입 전략 설계', icon: '🎯', desc: 'EEMM 매핑 기반 치료 계획 수립', color: '#f59e0b' },
  { num: 5, title: 'AI 슈퍼비전', icon: '💬', desc: '실시간 임상 자문 스트리밍 대화', color: '#10b981' },
  { num: 6, title: '성과 분석', icon: '📈', desc: '누적 치료 진척도 및 종결 준비도 평가', color: '#ef4444' },
];

export default function CaseHub({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusEdit, setStatusEdit] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetchWithAuth(`/api/mindlink/cases/${id}`);
      if (!res.ok) { router.replace('/mindlink'); return; }
      const data = await res.json();
      setCaseData(data);
      setNewStatus(data.status);
      setLoading(false);
    })();
  }, [id, router]);

  async function updateStatus() {
    await fetchWithAuth(`/api/mindlink/cases/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setCaseData(prev => prev ? { ...prev, status: newStatus } : prev);
    setStatusEdit(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!caseData) return null;

  const statusColors: Record<string, string> = { active: '#22c55e', hold: '#f59e0b', closed: '#6b7280', terminated: '#ef4444' };
  const statusLabels: Record<string, string> = { active: '진행중', hold: '보류', closed: '종결', terminated: '중단' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
        <Link href="/mindlink" className="hover:text-white transition-colors">대시보드</Link>
        <span>›</span>
        <span className="text-white/70">{caseData.client_alias}</span>
      </div>

      {/* Case header */}
      <div className="rounded-2xl p-6 mb-8 border border-white/10" style={{ background: '#1e293b' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {caseData.client_alias[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">{caseData.client_alias}</h1>
                <span className="text-white/40 text-sm">{caseData.age}세 {caseData.gender}</span>
                {statusEdit ? (
                  <div className="flex items-center gap-2">
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                      className="text-xs rounded-lg px-2 py-1 border border-white/20 bg-slate-700 text-white outline-none">
                      {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <button onClick={updateStatus} className="text-xs px-2 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600">저장</button>
                    <button onClick={() => setStatusEdit(false)} className="text-xs text-white/40 hover:text-white">취소</button>
                  </div>
                ) : (
                  <button onClick={() => setStatusEdit(true)}
                    className="px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ background: statusColors[caseData.status] + '20', color: statusColors[caseData.status] }}>
                    {statusLabels[caseData.status] ?? caseData.status}
                  </button>
                )}
              </div>
              <p className="text-white/50 text-sm mt-1 line-clamp-2">{caseData.presenting_problems}</p>
            </div>
          </div>
          <div className="text-right text-xs text-white/30 shrink-0">
            <p>등록 {new Date(caseData.created_at).toLocaleDateString('ko-KR')}</p>
            <p className="mt-0.5">수정 {new Date(caseData.updated_at).toLocaleDateString('ko-KR')}</p>
          </div>
        </div>
        {(caseData.background || caseData.referral_source) && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {caseData.background && (
              <div><span className="text-white/30">배경: </span><span className="text-white/60">{caseData.background}</span></div>
            )}
            {caseData.referral_source && (
              <div><span className="text-white/30">의뢰: </span><span className="text-white/60">{caseData.referral_source}</span></div>
            )}
          </div>
        )}
      </div>

      {/* Module grid */}
      <h2 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4">모듈</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(m => (
          <Link key={m.num} href={`/mindlink/cases/${id}/module${m.num}`}>
            <div className="rounded-xl p-5 border border-white/10 hover:border-white/25 transition-all cursor-pointer group h-full"
              style={{ background: '#1e293b' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: m.color + '20' }}>
                  {m.icon}
                </div>
                <span className="text-white/20 text-xs font-mono group-hover:text-white/40 transition-colors">0{m.num}</span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{m.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{m.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: m.color }}>
                <span>열기</span><span>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
