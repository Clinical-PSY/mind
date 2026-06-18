'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface Case {
  id: string; client_alias: string; age: number; gender: string;
  presenting_problems: string; status: string; created_at: string; updated_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e', hold: '#f59e0b', closed: '#6b7280', terminated: '#ef4444',
};
const STATUS_LABELS: Record<string, string> = {
  active: '진행중', hold: '보류', closed: '종결', terminated: '중단',
};

const inputCls = [
  'w-full rounded-xl px-3 py-2 text-sm text-white',
  'bg-white/5 border border-white/10',
  'outline-none focus:border-indigo-400/60 focus:bg-white/8',
  'transition-colors placeholder:text-white/25',
].join(' ');

export default function MindLinkDashboard() {
  const router = useRouter();
  const [cases,      setCases]      = useState<Case[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    client_alias: '', age: '', gender: '여',
    presenting_problems: '', background: '', referral_source: '',
  });
  const [creating, setCreating] = useState(false);
  const [error,    setError]    = useState('');
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchCases(); }, []);

  async function fetchCases() {
    setLoading(true);
    const res = await fetchWithAuth('/api/mindlink/cases');
    if (res.ok) setCases(await res.json());
    setLoading(false);
  }

  async function createCase() {
    if (!form.client_alias || !form.age || !form.presenting_problems) {
      setError('필수 항목을 입력하세요.'); return;
    }
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
    } else setError('사례 생성 실패');
    setCreating(false);
  }

  const filtered = cases.filter(c => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || c.client_alias.toLowerCase().includes(q) || c.presenting_problems.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = [
    { key: 'all',        label: '전체',   value: cases.length,                                  color: '#818cf8' },
    { key: 'active',     label: '진행중',  value: cases.filter(c => c.status === 'active').length,  color: '#22c55e' },
    { key: 'hold',       label: '보류',    value: cases.filter(c => c.status === 'hold').length,    color: '#f59e0b' },
    { key: 'closed',     label: '종결',    value: cases.filter(c => c.status === 'closed').length,  color: '#6b7280' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">사례 관리</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>AI 기반 임상 슈퍼비전 플랫폼</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setError(''); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <span className="text-base leading-none">+</span>
          <span>새 사례 등록</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stats.map(s => {
          const active = statusFilter === s.key;
          return (
            <button key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className="rounded-2xl p-4 text-left transition-all group"
              style={{
                background: active ? s.color + '18' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? s.color + '40' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: active ? s.color : s.color + 'cc' }}>{s.value}</p>
            </button>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: 'rgba(255,255,255,0.25)' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="내담자 가명 또는 주호소 검색..."
            className={inputCls + ' pl-9'} />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm text-white border border-white/10 outline-none transition-colors focus:border-indigo-400/60"
          style={{ background: 'rgba(255,255,255,0.05)', minWidth: 110 }}>
          <option value="all">전체 상태</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Case list */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[76px] rounded-2xl animate-pulse"
              style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24" style={{ color: 'rgba(255,255,255,0.2)' }}>
          <p className="text-4xl mb-3">{search || statusFilter !== 'all' ? '🔍' : '📋'}</p>
          <p className="text-sm">
            {search || statusFilter !== 'all' ? '검색 결과가 없습니다' : '등록된 사례가 없습니다'}
          </p>
          {!search && statusFilter === 'all' && (
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.15)' }}>
              새 사례를 등록하여 시작하세요
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <Link key={c.id} href={`/mindlink/cases/${c.id}`}>
              <div className="flex items-center gap-4 rounded-2xl px-5 py-4 border transition-all cursor-pointer group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.07)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.14)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
                }}>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {c.client_alias[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{c.client_alias}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.age}세 {c.gender}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: STATUS_COLORS[c.status] + '20',
                        color: STATUS_COLORS[c.status],
                      }}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {c.presenting_problems}
                  </p>
                </div>

                {/* Date + arrow */}
                <div className="text-right shrink-0 hidden sm:flex flex-col items-end gap-1">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {new Date(c.updated_at).toLocaleDateString('ko-KR')}
                  </p>
                  <p className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">열기 →</p>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length < cases.length && (
            <p className="text-center text-xs pt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {filtered.length} / {cases.length}건 표시
            </p>
          )}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 border overflow-y-auto max-h-[92vh]"
            style={{ background: '#0f1929', borderColor: 'rgba(255,255,255,0.1)' }}>

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-base">새 사례 등록</h2>
              <button onClick={() => setShowCreate(false)}
                className="text-white/30 hover:text-white/70 transition-colors text-lg leading-none">✕</button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>내담자 가명 *</label>
                  <input value={form.client_alias}
                    onChange={e => setForm(f => ({ ...f, client_alias: e.target.value }))}
                    placeholder="예: 내담자A" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>나이 *</label>
                  <input type="number" value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    placeholder="25" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>성별</label>
                <select value={form.gender}
                  onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2 text-white text-sm border border-white/10 outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <option value="여">여성</option>
                  <option value="남">남성</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>주호소 *</label>
                <textarea value={form.presenting_problems}
                  onChange={e => setForm(f => ({ ...f, presenting_problems: e.target.value }))}
                  rows={2} placeholder="주요 호소 문제를 입력하세요"
                  className={inputCls + ' resize-none'} />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>배경 정보</label>
                <textarea value={form.background}
                  onChange={e => setForm(f => ({ ...f, background: e.target.value }))}
                  rows={2} placeholder="가족관계, 병력 등"
                  className={inputCls + ' resize-none'} />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>의뢰 경위</label>
                <input value={form.referral_source}
                  onChange={e => setForm(f => ({ ...f, referral_source: e.target.value }))}
                  placeholder="자의뢰, 병원 의뢰 등" className={inputCls} />
              </div>

              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}
            </div>

            <div className="flex gap-2.5 mt-5">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-xl text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                취소
              </button>
              <button onClick={createCase} disabled={creating}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-90"
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
