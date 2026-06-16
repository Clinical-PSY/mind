'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';

interface Session {
  id: string; session_num: number; session_date: string; mood_before: number | null;
  mood_after: number | null; observations: string; counselor_notes: string; homework: string;
}
interface TestResult {
  id: string; test_name: string; test_date: string; scores: Record<string, number>;
  interpretation: string; raw_data: string;
}

export default function Module1({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<'sessions' | 'tests'>('sessions');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddTest, setShowAddTest] = useState(false);
  const [sessionForm, setSessionForm] = useState({ session_num: '', session_date: new Date().toISOString().split('T')[0], mood_before: '', mood_after: '', observations: '', counselor_notes: '', homework: '' });
  const [testForm, setTestForm] = useState({ test_name: '', test_date: new Date().toISOString().split('T')[0], scores: '{}', interpretation: '', raw_data: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  async function fetchData() {
    setLoading(true);
    const res = await fetch(`/api/mindlink/cases/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSessions(data.sessions ?? []);
      setTests(data.tests ?? []);
    }
    setLoading(false);
  }

  async function addSession() {
    if (!sessionForm.session_num || !sessionForm.session_date) { setError('회기 번호와 날짜는 필수입니다.'); return; }
    setSaving(true); setError('');
    const res = await fetch(`/api/mindlink/cases/${id}/sessions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...sessionForm, session_num: Number(sessionForm.session_num), mood_before: sessionForm.mood_before ? Number(sessionForm.mood_before) : null, mood_after: sessionForm.mood_after ? Number(sessionForm.mood_after) : null }),
    });
    if (res.ok) { await fetchData(); setShowAddSession(false); setSessionForm({ session_num: '', session_date: new Date().toISOString().split('T')[0], mood_before: '', mood_after: '', observations: '', counselor_notes: '', homework: '' }); }
    else setError('저장 실패');
    setSaving(false);
  }

  async function addTest() {
    if (!testForm.test_name || !testForm.test_date) { setError('검사명과 날짜는 필수입니다.'); return; }
    let scores: Record<string, number> = {};
    try { scores = JSON.parse(testForm.scores || '{}'); } catch { setError('점수 형식이 올바르지 않습니다 (JSON).'); return; }
    setSaving(true); setError('');
    const res = await fetch(`/api/mindlink/cases/${id}/tests`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testForm, scores }),
    });
    if (res.ok) { await fetchData(); setShowAddTest(false); setTestForm({ test_name: '', test_date: new Date().toISOString().split('T')[0], scores: '{}', interpretation: '', raw_data: '' }); }
    else setError('저장 실패');
    setSaving(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
        <Link href="/mindlink" className="hover:text-white">대시보드</Link>
        <span>›</span>
        <Link href={`/mindlink/cases/${id}`} className="hover:text-white">사례</Link>
        <span>›</span>
        <span className="text-white/70">회기 기록 & 검사</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">📝 회기 기록 & 심리검사</h1>
        <button onClick={() => tab === 'sessions' ? setShowAddSession(true) : setShowAddTest(true)}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          + {tab === 'sessions' ? '회기 추가' : '검사 추가'}
        </button>
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-lg w-fit" style={{ background: '#1e293b' }}>
        {([['sessions', '상담기록'], ['tests', '심리검사']] as const).map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === v ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
            style={tab === v ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}>
            {l}
          </button>
        ))}
      </div>

      {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#1e293b' }} />)}</div> : (
        tab === 'sessions' ? (
          sessions.length === 0 ? (
            <div className="text-center py-16 text-white/30"><p className="text-3xl mb-2">📝</p><p className="text-sm">상담 기록이 없습니다</p></div>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>{s.session_num}</span>
                      <span className="text-white font-medium text-sm">{s.session_date}</span>
                    </div>
                    {(s.mood_before || s.mood_after) && (
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <span>기분 {s.mood_before ?? '?'}</span>
                        <span>→</span>
                        <span className={s.mood_after && s.mood_before && s.mood_after > s.mood_before ? 'text-green-400' : 'text-red-400'}>
                          {s.mood_after ?? '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  {s.observations && <p className="text-white/70 text-sm mb-2"><span className="text-white/30 text-xs">관찰 </span>{s.observations}</p>}
                  {s.counselor_notes && <p className="text-white/60 text-xs"><span className="text-white/20">메모 </span>{s.counselor_notes}</p>}
                  {s.homework && <p className="text-white/50 text-xs mt-1"><span className="text-white/20">과제 </span>{s.homework}</p>}
                </div>
              ))}
            </div>
          )
        ) : (
          tests.length === 0 ? (
            <div className="text-center py-16 text-white/30"><p className="text-3xl mb-2">📊</p><p className="text-sm">심리검사 결과가 없습니다</p></div>
          ) : (
            <div className="space-y-3">
              {tests.map(t => (
                <div key={t.id} className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold text-sm">{t.test_name}</span>
                    <span className="text-white/40 text-xs">{t.test_date}</span>
                  </div>
                  {Object.keys(t.scores || {}).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {Object.entries(t.scores).map(([k, v]) => (
                        <span key={k} className="px-2 py-0.5 rounded-full text-xs border border-white/10 text-white/60">
                          {k}: <span className="text-white font-medium">{v}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {t.interpretation && <p className="text-white/60 text-sm">{t.interpretation}</p>}
                </div>
              ))}
            </div>
          )
        )
      )}

      {/* Add Session Modal */}
      {showAddSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-2xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto" style={{ background: '#1e293b' }}>
            <h2 className="text-white font-bold text-lg mb-4">회기 기록 추가</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs block mb-1">회기 번호 *</label>
                  <input type="number" value={sessionForm.session_num} onChange={e => setSessionForm(f => ({ ...f, session_num: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-white/50 text-xs block mb-1">날짜 *</label>
                  <input type="date" value={sessionForm.session_date} onChange={e => setSessionForm(f => ({ ...f, session_date: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs block mb-1">기분 (전, 1~10)</label>
                  <input type="number" min="1" max="10" value={sessionForm.mood_before} onChange={e => setSessionForm(f => ({ ...f, mood_before: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-white/50 text-xs block mb-1">기분 (후, 1~10)</label>
                  <input type="number" min="1" max="10" value={sessionForm.mood_after} onChange={e => setSessionForm(f => ({ ...f, mood_after: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1">임상 관찰</label>
                <textarea rows={3} value={sessionForm.observations} onChange={e => setSessionForm(f => ({ ...f, observations: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400 resize-none" />
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1">상담사 메모</label>
                <textarea rows={2} value={sessionForm.counselor_notes} onChange={e => setSessionForm(f => ({ ...f, counselor_notes: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400 resize-none" />
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1">과제</label>
                <input value={sessionForm.homework} onChange={e => setSessionForm(f => ({ ...f, homework: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400" />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddSession(false)} className="flex-1 py-2 rounded-lg text-white/60 text-sm border border-white/10 hover:bg-white/5">취소</button>
              <button onClick={addSession} disabled={saving} className="flex-1 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Test Modal */}
      {showAddTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-2xl p-6 w-full max-w-lg border border-white/10" style={{ background: '#1e293b' }}>
            <h2 className="text-white font-bold text-lg mb-4">심리검사 결과 추가</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs block mb-1">검사명 *</label>
                  <input value={testForm.test_name} onChange={e => setTestForm(f => ({ ...f, test_name: e.target.value }))}
                    placeholder="예: MMPI-2, K-BDI" className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="text-white/50 text-xs block mb-1">검사 날짜 *</label>
                  <input type="date" value={testForm.test_date} onChange={e => setTestForm(f => ({ ...f, test_date: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1">점수 (JSON 형식)</label>
                <input value={testForm.scores} onChange={e => setTestForm(f => ({ ...f, scores: e.target.value }))}
                  placeholder='{"우울": 72, "불안": 68}'
                  className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400 font-mono" />
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1">해석 요약</label>
                <textarea rows={3} value={testForm.interpretation} onChange={e => setTestForm(f => ({ ...f, interpretation: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400 resize-none" />
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1">원자료 메모</label>
                <textarea rows={2} value={testForm.raw_data} onChange={e => setTestForm(f => ({ ...f, raw_data: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400 resize-none" />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddTest(false)} className="flex-1 py-2 rounded-lg text-white/60 text-sm border border-white/10 hover:bg-white/5">취소</button>
              <button onClick={addTest} disabled={saving} className="flex-1 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
