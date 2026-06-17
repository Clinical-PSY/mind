'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface Case {
  id: string; client_alias: string; age: number; gender: string;
  presenting_problems: string; status: string; created_at: string; updated_at: string;
}

const STATUS_COLORS: Record<string, string> = { active: '#22c55e', hold: '#f59e0b', closed: '#6b7280', terminated: '#ef4444' };
const STATUS_LABELS: Record<string, string> = { active: '진행중', hold: '보류', closed: '종결', terminated: '중단' };

const inputCls = 'w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400';

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

  // 검색 / 필터
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
    } else setError('사례 생성 실패');
    setCreating(false);
  }

  const filtered = cases.filter(c => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || c.client_alias.toLowerCase().includes(q) || c.presenting_problems.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:      cases.length,
    active:     cases.filter(c => c.status === 'active').length,
    hold:       cases.filter(c => c.status === 'hold').length,
    closed:     cases.filter(c => c.status === 'closed').length,
    terminated: cases.filter(c => c.status === 'terminated').length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">사례 관리</h1>
          <p className="text-white/50 text-sm mt-1">AI 기반 임상 슈퍼비전 플랫폼</p>
        </div>
        <button onClick={() => { setShowCreate(true); setError(''); }}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          + 새 사례 등록
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: '전체', value: stats.total,  color: '#6366f1' },
          { label: '진행중', value: stats.active, color: '#22c55e' },
          { label: '보류',   value: stats.hold,   color: '#f59e0b' },
          { label: '종결',   value: stats.closed, color: '#6b7280' },
        ].map(s => (
          <button key={s.label}
            onClick={() => setStatusFilter(s.label === '전체' ? 'all' : Object.entries(STATUS_LABELS).find(([,v]) => v === s.label)?.[0] ?? 'all')}
            className="rounded-xl p-4 border border-white/10 text-left transition-all hover:border-white/25"
            style={{ background: statusFilter === (s.label === '전체' ? 'all' : Object.entries(STATUS_LABELS).find(([,v]) => v === s.label)?.[0]) ? s.color+'15' : '#1e293b' }}>
            <p className="text-white/50 text-xs mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </button>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="내담자 가명 또는 주호소 검색..."
            className="w-full rounded-lg pl-9 pr-4 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg px-3 py-2 text-white text-sm border border-white/10 outline-none"
          style={{ background: '#1e293b' }}>
          <option value="all">전체 상태</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Cases list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#1e293b' }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <p className="text-4xl mb-3">{search || statusFilter !== 'all' ? '🔍' : '📋'}</p>
          <p className="text-sm">{search || statusFilter !== 'all' ? '검색 결과가 없습니다' : '등록된 사례가 없습니다'}</p>
          {!search && statusFilter === 'all' && <p className="text-xs mt-1">새 사례를 등록하여 시작하세요</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <Link key={c.id} href={`/mindlink/cases/${c.id}`}>
              <div className="rounded-xl p-5 border border-white/10 hover:border-white/25 transition-all cursor-pointer group"
                style={{ background: '#1e293b' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                      {c.client_alias[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium">{c.client_alias}</span>
                        <span className="text-white/40 text-xs">{c.age}세 {c.gender}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: STATUS_COLORS[c.status]+'20', color: STATUS_COLORS[c.status] }}>
                          {STATUS_LABELS[c.status] ?? c.status}
                        </span>
                      </div>
                      <p className="text-white/50 text-xs mt-0.5 line-clamp-1">{c.presenting_problems}</p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block shrink-0">
                    <p className="text-white/30 text-xs">{new Date(c.updated_at).toLocaleDateString('ko-KR')}</p>
                    <p className="text-indigo-400 text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">열기 →</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length < cases.length && (
            <p className="text-center text-white/30 text-xs pt-2">{filtered.length} / {cases.length}건 표시</p>
          )}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-2xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto" style={{ background: '#1e293b' }}>
            <h2 className="text-white font-bold text-lg mb-5">새 사례 등록</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs block mb-1">내담자 가명 *</label>
                  <input value={form.client_alias} onChange={e => setForm(f => ({ ...f, client_alias: e.target.value }))}
                    placeholder="예: 내담자A" className={inputCls} />
                </div>
                <div>
                  <label className="text-white/50 text-xs block mb-1">나이 *</label>
                  <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    placeholder="25" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1">성별</label>
                <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm border border-white/10 outline-none focus:border-indigo-400"
                  style={{ background: '#0f172a' }}>
                  <option value="여">여성</option><option value="남">남성</option><option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1">주호소 *</label>
                <textarea value={form.presenting_problems} onChange={e => setForm(f => ({ ...f, presenting_problems: e.target.value }))}
                  rows={2} placeholder="주요 호소 문제를 입력하세요" className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1">배경 정보</label>
                <textarea value={form.background} onChange={e => setForm(f => ({ ...f, background: e.target.value }))}
                  rows={2} placeholder="가족관계, 병력 등" className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1">의뢰 경위</label>
                <input value={form.referral_source} onChange={e => setForm(f => ({ ...f, referral_source: e.target.value }))}
                  placeholder="자의뢰, 병원 의뢰 등" className={inputCls} />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-lg text-white/60 text-sm border border-white/10 hover:bg-white/5">취소</button>
              <button onClick={createCase} disabled={creating}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {creating ? '생성 중...' : '사례 등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
