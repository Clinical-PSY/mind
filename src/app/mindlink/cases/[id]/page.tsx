'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { computeStaleness, type CaseBundle } from '@/lib/staleness';
import { listenForUpdates } from '@/lib/case-sync';

interface Case {
  id: string; client_alias: string; age: number; gender: string;
  presenting_problems: string; background: string; referral_source: string;
  status: string; created_at: string; updated_at: string;
  sessions_count?: number; tests_count?: number;
}

const modules = [
  { num: 1, title: '회기 기록 & 검사',  icon: '📝', desc: '상담기록 입력 및 심리검사 결과 관리',    color: '#3b82f6' },
  { num: 2, title: '심리검사 보고서',    icon: '📊', desc: 'AI 기반 통합 심리평가 보고서 생성',      color: '#8b5cf6' },
  { num: 3, title: 'EEMM 사례개념화',   icon: '🧠', desc: '과정 기반 치료(PBT) 9차원 분석',        color: '#06b6d4' },
  { num: 4, title: '개입 전략 설계',     icon: '🎯', desc: 'EEMM 매핑 기반 치료 계획 수립',         color: '#f59e0b' },
  { num: 5, title: 'AI 슈퍼비전',        icon: '💬', desc: '실시간 임상 자문 스트리밍 대화',         color: '#10b981' },
  { num: 6, title: '성과 분석',          icon: '📈', desc: '누적 치료 진척도 및 종결 준비도 평가',   color: '#ef4444' },
];

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e', hold: '#f59e0b', closed: '#6b7280', terminated: '#ef4444',
};
const STATUS_LABELS: Record<string, string> = {
  active: '진행중', hold: '보류', closed: '종결', terminated: '중단',
};

const inputCls = [
  'w-full rounded-xl px-3 py-2 text-white text-sm',
  'bg-white/5 border border-white/10',
  'outline-none focus:border-indigo-400/60 transition-colors',
].join(' ');

export default function CaseHub({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();
  const [caseData,   setCaseData]   = useState<Case | null>(null);
  const [bundle,     setBundle]     = useState<CaseBundle>({});
  const [loading,    setLoading]    = useState(true);
  const [showEdit,   setShowEdit]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [editError,  setEditError]  = useState('');
  const [editForm, setEditForm] = useState({
    client_alias: '', age: '', gender: '', presenting_problems: '', background: '', referral_source: '',
  });
  const [statusEdit, setStatusEdit] = useState(false);
  const [newStatus,  setNewStatus]  = useState('');

  async function loadCase() {
    const res = await fetchWithAuth(`/api/mindlink/cases/${id}`);
    if (!res.ok) { router.replace('/mindlink'); return; }
    const data = await res.json();
    setCaseData(data);
    setBundle({ sessions: data.sessions, tests: data.tests, psych_report: data.psych_report, conceptualization: data.conceptualization, intervention: data.intervention, outcomes: data.outcomes });
    setNewStatus(data.status);
    setLoading(false);
  }

  useEffect(() => {
    loadCase();
    const cleanup = listenForUpdates(id, loadCase);
    return cleanup;
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStatus() {
    await fetchWithAuth(`/api/mindlink/cases/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setCaseData(prev => prev ? { ...prev, status: newStatus } : prev);
    setStatusEdit(false);
  }

  function openEdit() {
    if (!caseData) return;
    setEditForm({
      client_alias: caseData.client_alias,
      age: String(caseData.age ?? ''),
      gender: caseData.gender,
      presenting_problems: caseData.presenting_problems,
      background: caseData.background,
      referral_source: caseData.referral_source,
    });
    setEditError('');
    setShowEdit(true);
  }

  async function saveEdit() {
    if (!editForm.client_alias.trim()) { setEditError('가명은 필수입니다.'); return; }
    setSaving(true); setEditError('');
    const res = await fetchWithAuth(`/api/mindlink/cases/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, age: Number(editForm.age) }),
    });
    if (res.ok) {
      setCaseData(prev => prev ? { ...prev, ...editForm, age: Number(editForm.age) } : prev);
      setShowEdit(false);
    } else setEditError('수정 실패');
    setSaving(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!caseData) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
        <Link href="/mindlink" className="hover:text-white/70 transition-colors">사례 관리</Link>
        <span>›</span>
        <span style={{ color: 'rgba(255,255,255,0.65)' }}>{caseData.client_alias}</span>
      </div>

      {/* Case header card */}
      <div className="rounded-2xl p-6 mb-6 border"
        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {caseData.client_alias[0]}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-white">{caseData.client_alias}</h1>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {caseData.age}세 {caseData.gender}
                </span>

                {statusEdit ? (
                  <div className="flex items-center gap-2">
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                      className="text-xs rounded-lg px-2 py-1 border border-white/20 text-white outline-none"
                      style={{ background: '#0f172a' }}>
                      {Object.entries(STATUS_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                    <button onClick={updateStatus}
                      className="text-xs px-2 py-1 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">
                      저장
                    </button>
                    <button onClick={() => setStatusEdit(false)}
                      className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      취소
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setStatusEdit(true)}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium hover:opacity-75 transition-opacity"
                    style={{
                      background: STATUS_COLORS[caseData.status] + '20',
                      color: STATUS_COLORS[caseData.status],
                    }}>
                    {STATUS_LABELS[caseData.status] ?? caseData.status}
                  </button>
                )}
              </div>
              <p className="text-sm mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {caseData.presenting_problems}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2.5 shrink-0">
            <div className="text-right text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              <p>등록 {new Date(caseData.created_at).toLocaleDateString('ko-KR')}</p>
              <p className="mt-0.5">수정 {new Date(caseData.updated_at).toLocaleDateString('ko-KR')}</p>
            </div>
            <button onClick={openEdit}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.85)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
              }}>
              ✏️ 정보 수정
            </button>
          </div>
        </div>

        {(caseData.background || caseData.referral_source) && (
          <div className="mt-4 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {caseData.background && (
              <div>
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>배경 </span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{caseData.background}</span>
              </div>
            )}
            {caseData.referral_source && (
              <div>
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>의뢰 </span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{caseData.referral_source}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Module grid */}
      {(() => {
        const stale = computeStaleness(bundle);
        const staleMap: Record<number, boolean> = { 2: stale.m2, 3: stale.m3, 4: stale.m4, 6: stale.m6 };
        return (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.25)' }}>모듈</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {modules.map(m => {
                const isStale = staleMap[m.num] ?? false;
                return (
                  <Link key={m.num} href={`/mindlink/cases/${id}/module${m.num}`}>
                    <div className="rounded-2xl p-5 border cursor-pointer group h-full transition-all relative"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderColor: isStale ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.07)',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)';
                        (e.currentTarget as HTMLDivElement).style.borderColor = isStale ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.14)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                        (e.currentTarget as HTMLDivElement).style.borderColor = isStale ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.07)';
                      }}>
                      {/* staleness dot */}
                      {isStale && (
                        <span className="absolute top-3 right-3 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            style={{ background: '#fbbf24' }} />
                          <span className="relative inline-flex rounded-full h-2 w-2"
                            style={{ background: '#f59e0b' }} />
                        </span>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ background: m.color + '18' }}>
                          {m.icon}
                        </div>
                        <span className="text-xs font-mono transition-colors"
                          style={{ color: 'rgba(255,255,255,0.18)' }}>0{m.num}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">{m.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>{m.desc}</p>
                      {isStale ? (
                        <p className="mt-2 text-xs" style={{ color: '#fbbf24' }}>업데이트 필요</p>
                      ) : (
                        <div className="mt-3 flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: m.color }}>
                          <span>열기</span><span>→</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        );
      })()}

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 border overflow-y-auto max-h-[92vh]"
            style={{ background: '#0f1929', borderColor: 'rgba(255,255,255,0.1)' }}>

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-base">내담자 정보 수정</h2>
              <button onClick={() => setShowEdit(false)}
                className="text-white/30 hover:text-white/70 transition-colors text-lg leading-none">✕</button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>내담자 가명 *</label>
                  <input value={editForm.client_alias}
                    onChange={e => setEditForm(f => ({ ...f, client_alias: e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>나이</label>
                  <input type="number" value={editForm.age}
                    onChange={e => setEditForm(f => ({ ...f, age: e.target.value }))}
                    className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>성별</label>
                <select value={editForm.gender}
                  onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2 text-white text-sm border border-white/10 outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <option value="여">여성</option>
                  <option value="남">남성</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>주호소</label>
                <textarea rows={2} value={editForm.presenting_problems}
                  onChange={e => setEditForm(f => ({ ...f, presenting_problems: e.target.value }))}
                  className={inputCls + ' resize-none'} />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>배경 정보</label>
                <textarea rows={2} value={editForm.background}
                  onChange={e => setEditForm(f => ({ ...f, background: e.target.value }))}
                  className={inputCls + ' resize-none'} />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>의뢰 경위</label>
                <input value={editForm.referral_source}
                  onChange={e => setEditForm(f => ({ ...f, referral_source: e.target.value }))}
                  className={inputCls} />
              </div>

              {editError && <p className="text-red-400 text-xs">{editError}</p>}
            </div>

            <div className="flex gap-2.5 mt-5">
              <button onClick={() => setShowEdit(false)}
                className="flex-1 py-2.5 rounded-xl text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                취소
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {saving ? '저장 중...' : '수정 완료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
