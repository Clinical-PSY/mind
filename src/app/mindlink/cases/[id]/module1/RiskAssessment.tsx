'use client';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface Session { id: string; session_num: number; session_date: string; }
interface Risk {
  id: string; assessed_at: string; session_id: string | null;
  suicide_risk: number; self_harm_risk: number; harm_to_others: number;
  abuse_report: boolean; action_taken: string; notes: string;
}

const LEVEL_LABELS = ['없음', '낮음', '중간', '높음'];
const LEVEL_COLORS = ['#22c55e', '#f59e0b', '#f97316', '#ef4444'];

function RiskBadge({ level }: { level: number }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: LEVEL_COLORS[level]+'20', color: LEVEL_COLORS[level] }}>
      {LEVEL_LABELS[level]}
    </span>
  );
}

function RiskSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-white/50 text-xs">{label}</label>
        <RiskBadge level={value} />
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map(n => (
          <button key={n} onClick={() => onChange(n)}
            className="flex-1 h-8 rounded-lg text-xs font-medium transition-all border"
            style={value === n
              ? { background: LEVEL_COLORS[n]+'30', borderColor: LEVEL_COLORS[n]+'80', color: LEVEL_COLORS[n] }
              : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
            {LEVEL_LABELS[n]}
          </button>
        ))}
      </div>
    </div>
  );
}

const emptyRisk = () => ({
  assessed_at:    new Date().toISOString().split('T')[0],
  session_id:     '',
  suicide_risk:   0,
  self_harm_risk: 0,
  harm_to_others: 0,
  abuse_report:   false,
  action_taken:   '',
  notes:          '',
});

export default function RiskAssessment({ caseId, sessions }: { caseId: string; sessions: Session[] }) {
  const [risks,    setRisks]    = useState<Risk[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [form,     setForm]     = useState(emptyRisk());
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => { fetchRisks(); }, [caseId]);

  async function fetchRisks() {
    setLoading(true);
    const res = await fetchWithAuth(`/api/mindlink/cases/${caseId}/risk`);
    if (res.ok) setRisks(await res.json());
    setLoading(false);
  }

  function openAdd() { setForm(emptyRisk()); setEditId(null); setError(''); setShowForm(true); }

  function openEdit(r: Risk) {
    setForm({
      assessed_at:    r.assessed_at,
      session_id:     r.session_id ?? '',
      suicide_risk:   r.suicide_risk,
      self_harm_risk: r.self_harm_risk,
      harm_to_others: r.harm_to_others,
      abuse_report:   r.abuse_report,
      action_taken:   r.action_taken,
      notes:          r.notes,
    });
    setEditId(r.id); setError(''); setShowForm(true);
  }

  async function save() {
    setSaving(true); setError('');
    const payload = { ...form, session_id: form.session_id || null };
    const res = editId
      ? await fetchWithAuth(`/api/mindlink/cases/${caseId}/risk`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ risk_id: editId, ...payload }),
        })
      : await fetchWithAuth(`/api/mindlink/cases/${caseId}/risk`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
    if (res.ok) { await fetchRisks(); setShowForm(false); }
    else setError(editId ? '수정 실패' : '저장 실패');
    setSaving(false);
  }

  async function remove(id: string) {
    if (!window.confirm('위험평가 기록을 삭제하시겠습니까?')) return;
    await fetchWithAuth(`/api/mindlink/cases/${caseId}/risk`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ risk_id: id }),
    });
    await fetchRisks();
  }

  // 최고 위험도 계산
  const maxRisk = risks.length > 0 ? Math.max(...risks.map(r => Math.max(r.suicide_risk, r.self_harm_risk, r.harm_to_others))) : -1;

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold text-sm">⚠️ 위험관리 기록</h3>
          {maxRisk >= 0 && (
            <span className="text-xs text-white/40">
              최고 위험도: <span style={{ color: LEVEL_COLORS[maxRisk] }} className="font-medium">{LEVEL_LABELS[maxRisk]}</span>
            </span>
          )}
        </div>
        <button onClick={openAdd}
          className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
          style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>
          + 위험평가 추가
        </button>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#0f172a' }} />)}</div>
      ) : risks.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-sm">위험관리 기록이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {risks.map(r => {
            const linked = sessions.find(s => s.id === r.session_id);
            const highest = Math.max(r.suicide_risk, r.self_harm_risk, r.harm_to_others);
            return (
              <div key={r.id} className="rounded-xl p-4 border border-white/10 group" style={{ background: '#0f172a' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white/70 text-sm font-medium">{r.assessed_at}</span>
                    {linked && <span className="text-white/30 text-xs">회기 {linked.session_num}</span>}
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: LEVEL_COLORS[highest]+'20', color: LEVEL_COLORS[highest] }}>
                      전체 {LEVEL_LABELS[highest]}
                    </span>
                    {r.abuse_report && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                        학대 신고
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(r)} title="수정"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white/40 hover:text-indigo-400 border border-white/10 hover:border-indigo-400/30">
                      ✏️
                    </button>
                    <button onClick={() => remove(r.id)} title="삭제"
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white/40 hover:text-red-400 border border-white/10 hover:border-red-400/30">
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                  {[
                    { label: '자살위험',  level: r.suicide_risk },
                    { label: '자해위험',  level: r.self_harm_risk },
                    { label: '타해위험',  level: r.harm_to_others },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <span className="text-white/30">{item.label}</span>
                      <RiskBadge level={item.level} />
                    </div>
                  ))}
                </div>
                {r.action_taken && <p className="text-white/60 text-xs mt-1"><span className="text-white/30">조치 </span>{r.action_taken}</p>}
                {r.notes        && <p className="text-white/50 text-xs mt-0.5"><span className="text-white/20">메모 </span>{r.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 폼 모달 ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-2xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto" style={{ background: '#1e293b' }}>
            <h2 className="text-white font-bold text-lg mb-5">
              {editId ? '위험평가 수정' : '위험평가 추가'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs block mb-1">평가 날짜</label>
                  <input type="date" value={form.assessed_at}
                    onChange={e => setForm(f => ({ ...f, assessed_at: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-white/50 text-xs block mb-1">연결 회기</label>
                  <select value={form.session_id}
                    onChange={e => setForm(f => ({ ...f, session_id: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-white text-sm border border-white/10 outline-none focus:border-indigo-400"
                    style={{ background: '#0f172a' }}>
                    <option value="">선택 안함</option>
                    {sessions.map(s => (
                      <option key={s.id} value={s.id}>회기 {s.session_num} ({s.session_date})</option>
                    ))}
                  </select>
                </div>
              </div>

              <RiskSlider label="자살위험" value={form.suicide_risk}   onChange={v => setForm(f => ({ ...f, suicide_risk: v }))} />
              <RiskSlider label="자해위험" value={form.self_harm_risk} onChange={v => setForm(f => ({ ...f, self_harm_risk: v }))} />
              <RiskSlider label="타해위험" value={form.harm_to_others} onChange={v => setForm(f => ({ ...f, harm_to_others: v }))} />

              <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer"
                style={{ background: form.abuse_report ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)' }}
                onClick={() => setForm(f => ({ ...f, abuse_report: !f.abuse_report }))}>
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${form.abuse_report ? 'bg-purple-500 border-purple-500' : 'border-white/20'}`}>
                  {form.abuse_report && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-white/70 text-sm">학대 신고 여부</span>
              </div>

              <div>
                <label className="text-white/50 text-xs block mb-1">취해진 조치</label>
                <textarea rows={2} value={form.action_taken}
                  onChange={e => setForm(f => ({ ...f, action_taken: e.target.value }))}
                  placeholder="위기 개입, 보호자 연락, 입원 등"
                  className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400 resize-none" />
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1">추가 메모</label>
                <textarea rows={2} value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400 resize-none" />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg text-white/60 text-sm border border-white/10 hover:bg-white/5">취소</button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>
                {saving ? '저장 중...' : editId ? '수정 완료' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
