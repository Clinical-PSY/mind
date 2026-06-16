'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface Case {
  id: string; client_alias: string; age: number; gender: string;
  presenting_problems: string; status: string; created_at: string; updated_at: string;
}

export default function MindLinkDashboard() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ client_alias: '', age: '', gender: '여', presenting_problems: '', background: '', referral_source: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchCases(); }, []);

  async function fetchCases() {
    setLoading(true);
    const res = await fetchWithAuth('/api/mindlink/cases');
    if (res.ok) setCases(await res.json());
    setLoading(false);
  }

  async function createCase() {
    if (!form.client_alias || !form.age || !form.presenting_problems) { setError('필수 항목을 입력하세요.'); return; }
    setCreating(true); setError('');
    const res = await fetchWithAuth('/api/mindlink/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, age: Number(form.age) }),
    });
    if (res.ok) {
      const c = await res.json();
      setShowCreate(false);
      setForm({ client_alias: '', age: '', gender: '여', presenting_problems: '', background: '', referral_source: '' });
      router.push(`/mindlink/cases/${c.id}`);
    } else {
      setError('사례 생성 실패');
    }
    setCreating(false);
  }

  const statusColors: Record<string, string> = {
    active: '#22c55e', hold: '#f59e0b', closed: '#6b7280', terminated: '#ef4444',
  };
  const statusLabels: Record<string, string> = {
    active: '진행중', hold: '보류', closed: '종결', terminated: '중단',
  };

  const stats = {
    total: cases.length,
    active: cases.filter(c => c.status === 'active').length,
    closed: cases.filter(c => c.status === 'closed').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">사례 관리</h1>
          <p className="text-white/50 text-sm mt-1">AI 기반 임상 슈퍼비전 플랫폼</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          + 새 사례 등록
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: '전체 사례', value: stats.total, color: '#6366f1' },
          { label: '진행중', value: stats.active, color: '#22c55e' },
          { label: '종결', value: stats.closed, color: '#6b7280' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
            <p className="text-white/50 text-xs mb-1">{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Cases list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#1e293b' }} />)}
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">등록된 사례가 없습니다</p>
          <p className="text-xs mt-1">새 사례를 등록하여 시작하세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map(c => (
            <Link key={c.id} href={`/mindlink/cases/${c.id}`}>
              <div className="rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                style={{ background: '#1e293b' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      {c.client_alias[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{c.client_alias}</span>
                        <span className="text-white/40 text-xs">{c.age}세 {c.gender}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: statusColors[c.status] + '20', color: statusColors[c.status] }}>
                          {statusLabels[c.status] ?? c.status}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs mt-0.5 line-clamp-1">{c.presenting_problems}</p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-white/30 text-xs">{new Date(c.updated_at).toLocaleDateString('ko-KR')}</p>
                    <p className="text-indigo-400 text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">열기 →</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 w-full max-w-lg border border-white/10" style={{ background: '#1e293b' }}>
            <h2 className="text-white font-bold text-lg mb-5">새 사례 등록</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs block mb-1">내담자 가명 *</label>
                  <input value={form.client_alias} onChange={e => setForm(f => ({ ...f, client_alias: e.target.value }))}
                    placeholder="예: 내담자A" className="w-full rounded-lg px-3 py-2 text-white text-sm border border-white/10 bg-white/5 outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-white/60 text-xs block mb-1">나이 *</label>
                  <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    placeholder="25" className="w-full rounded-lg px-3 py-2 text-white text-sm border border-white/10 bg-white/5 outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div>
                <label className="text-white/60 text-xs block mb-1">성별</label>
                <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm border border-white/10 bg-slate-800 outline-none focus:border-indigo-400">
                  <option value="여">여성</option>
                  <option value="남">남성</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="text-white/60 text-xs block mb-1">주호소 *</label>
                <textarea value={form.presenting_problems} onChange={e => setForm(f => ({ ...f, presenting_problems: e.target.value }))}
                  rows={2} placeholder="주요 호소 문제를 입력하세요"
                  className="w-full rounded-lg px-3 py-2 text-white text-sm border border-white/10 bg-white/5 outline-none focus:border-indigo-400 resize-none" />
              </div>
              <div>
                <label className="text-white/60 text-xs block mb-1">배경 정보</label>
                <textarea value={form.background} onChange={e => setForm(f => ({ ...f, background: e.target.value }))}
                  rows={2} placeholder="가족관계, 병력 등"
                  className="w-full rounded-lg px-3 py-2 text-white text-sm border border-white/10 bg-white/5 outline-none focus:border-indigo-400 resize-none" />
              </div>
              <div>
                <label className="text-white/60 text-xs block mb-1">의뢰 경위</label>
                <input value={form.referral_source} onChange={e => setForm(f => ({ ...f, referral_source: e.target.value }))}
                  placeholder="자의뢰, 병원 의뢰 등" className="w-full rounded-lg px-3 py-2 text-white text-sm border border-white/10 bg-white/5 outline-none focus:border-indigo-400" />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-lg text-white/60 text-sm border border-white/10 hover:bg-white/5">취소</button>
              <button onClick={createCase} disabled={creating}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {creating ? '생성 중...' : '사례 등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
