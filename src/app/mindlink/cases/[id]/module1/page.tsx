'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface Session {
  id: string; session_num: number; session_date: string;
  mood_before: number | null; mood_after: number | null;
  observations: string; counselor_notes: string; homework: string;
}
interface TestResult {
  id: string; test_name: string; test_date: string;
  scores: Record<string, number | string>; interpretation: string;
  raw_data: string; category: string; sub_type: string;
}

// ── 카테고리 정의 ──────────────────────────────────────────────
const CATEGORIES = [
  { key: '지능검사',      icon: '🧩', color: '#3b82f6' },
  { key: '성격검사',      icon: '👤', color: '#8b5cf6' },
  { key: '투사검사',      icon: '🎨', color: '#ec4899' },
  { key: '신경심리검사',  icon: '⚡', color: '#f59e0b' },
  { key: '기타검사',      icon: '📋', color: '#6b7280' },
];
const PERSONALITY_SUBS = ['MMPI', 'TCI', '기타'];
const PROJECTIVE_SUBS  = ['SCT', '로르샤하', 'HTP', '기타'];

// ── 점수 필드 정의 ─────────────────────────────────────────────
const INTEL_NAMES = ['K-WAIS-IV', 'K-WISC-V', 'K-ABC-II', '기타'];
const INTEL_SCORES = [
  { key: 'FSIQ', label: '전체지능(FSIQ)' },
  { key: 'VCI',  label: '언어이해(VCI)'  },
  { key: 'VSI',  label: '시공간(VSI)'    },
  { key: 'FRI',  label: '유동추론(FRI)'  },
  { key: 'WMI',  label: '작업기억(WMI)'  },
  { key: 'PSI',  label: '처리속도(PSI)'  },
];
const MMPI_VALIDITY  = ['L','F','K'];
const MMPI_CLINICAL  = ['Hs','D','Hy','Pd','Mf','Pa','Pt','Sc','Ma','Si'];
const TCI_TEMP   = [
  { key:'NS', label:'자극추구(NS)' }, { key:'HA', label:'위험회피(HA)' },
  { key:'RD', label:'사회적민감성(RD)' }, { key:'PS', label:'인내력(PS)' },
];
const TCI_CHAR   = [
  { key:'SD', label:'자율성(SD)' }, { key:'C', label:'연대감(C)' },
  { key:'ST', label:'자기초월(ST)' },
];
const RSCH_FIELDS = [
  { key:'R', label:'R(반응수)' }, { key:'Lambda', label:'Lambda' },
  { key:'M',  label:'M(인간운동)' }, { key:'FM', label:'FM(동물운동)' },
  { key:'EA', label:'EA' }, { key:'es', label:'es' }, { key:'D', label:'D점수' },
];
const NEURO_NAMES = ['K-MoCA','MMSE-K','TMT-A','TMT-B','Stroop','WMS-IV','RCFT','BGT','기타'];

// ── 빈 폼 초기값 ───────────────────────────────────────────────
function emptyForm() {
  return {
    test_name: '', test_date: new Date().toISOString().split('T')[0],
    interpretation: '', raw_data: '',
    scores: {} as Record<string, string>,
    // 지능
    intel_name: 'K-WAIS-IV',
    // 성격 기타 - 동적 척도 목록
    extra_scales: [{ label: '', value: '' }],
    // 투사 SCT
    sct_responses: '',
    // 투사 HTP
    htp_house: '', htp_tree: '', htp_person: '',
    // 신경심리
    neuro_name: 'K-MoCA', neuro_raw: '', neuro_std: '', neuro_pct: '',
    // 기타
    other_name: '', other_result: '',
  };
}

export default function Module1({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab]       = useState<'sessions' | 'tests'>('sessions');
  const [testCat, setTestCat] = useState('지능검사');
  const [testSub, setTestSub] = useState('MMPI');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tests,    setTests]    = useState<TestResult[]>([]);
  const [loading,  setLoading]  = useState(true);

  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddTest,    setShowAddTest]    = useState(false);
  const [sessionForm, setSessionForm] = useState({
    session_num: '', session_date: new Date().toISOString().split('T')[0],
    mood_before: '', mood_after: '', observations: '', counselor_notes: '', homework: '',
  });
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  useEffect(() => { fetchData(); }, [id]);

  async function fetchData() {
    setLoading(true);
    const res = await fetchWithAuth(`/api/mindlink/cases/${id}`);
    if (res.ok) {
      const d = await res.json();
      setSessions(d.sessions ?? []);
      setTests(d.tests ?? []);
    }
    setLoading(false);
  }

  async function addSession() {
    if (!sessionForm.session_num || !sessionForm.session_date) { setError('회기 번호와 날짜는 필수입니다.'); return; }
    setSaving(true); setError('');
    const res = await fetchWithAuth(`/api/mindlink/cases/${id}/sessions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...sessionForm,
        session_num: Number(sessionForm.session_num),
        mood_before: sessionForm.mood_before ? Number(sessionForm.mood_before) : null,
        mood_after:  sessionForm.mood_after  ? Number(sessionForm.mood_after)  : null,
      }),
    });
    if (res.ok) {
      await fetchData();
      setShowAddSession(false);
      setSessionForm({ session_num: '', session_date: new Date().toISOString().split('T')[0], mood_before: '', mood_after: '', observations: '', counselor_notes: '', homework: '' });
    } else setError('저장 실패');
    setSaving(false);
  }

  // ── 검사 저장 ─────────────────────────────────────────────────
  async function addTest() {
    setSaving(true); setError('');
    let test_name = '';
    let scores: Record<string, number | string> = {};
    let raw_data = '';
    const sub_type = (testCat === '성격검사') ? testSub : (testCat === '투사검사') ? testSub : '';

    if (testCat === '지능검사') {
      test_name = form.intel_name === '기타' ? form.test_name : form.intel_name;
      INTEL_SCORES.forEach(s => { if (form.scores[s.key]) scores[s.key] = Number(form.scores[s.key]); });
    } else if (testCat === '성격검사' && testSub === 'MMPI') {
      test_name = form.test_name || 'MMPI-2';
      [...MMPI_VALIDITY, ...MMPI_CLINICAL].forEach(k => { if (form.scores[k]) scores[k] = Number(form.scores[k]); });
    } else if (testCat === '성격검사' && testSub === 'TCI') {
      test_name = 'TCI-RS';
      [...TCI_TEMP, ...TCI_CHAR].forEach(s => { if (form.scores[s.key]) scores[s.key] = Number(form.scores[s.key]); });
    } else if (testCat === '성격검사' && testSub === '기타') {
      if (!form.test_name.trim()) { setError('검사명을 입력하세요.'); setSaving(false); return; }
      test_name = form.test_name;
      form.extra_scales.forEach(({ label, value }) => { if (label && value) scores[label] = Number(value) || value; });
    } else if (testCat === '투사검사' && testSub === 'SCT') {
      test_name = '문장완성검사(SCT)';
      raw_data = form.sct_responses;
    } else if (testCat === '투사검사' && testSub === '로르샤하') {
      test_name = '로르샤하(Rorschach)';
      RSCH_FIELDS.forEach(s => { if (form.scores[s.key]) scores[s.key] = Number(form.scores[s.key]); });
    } else if (testCat === '투사검사' && testSub === 'HTP') {
      test_name = 'HTP';
      raw_data = JSON.stringify({ house: form.htp_house, tree: form.htp_tree, person: form.htp_person });
    } else if (testCat === '투사검사' && testSub === '기타') {
      if (!form.test_name.trim()) { setError('검사명을 입력하세요.'); setSaving(false); return; }
      test_name = form.test_name;
      raw_data = form.raw_data;
    } else if (testCat === '신경심리검사') {
      test_name = form.neuro_name === '기타' ? form.test_name : form.neuro_name;
      if (form.neuro_raw) scores['원점수']    = Number(form.neuro_raw);
      if (form.neuro_std) scores['표준점수']  = Number(form.neuro_std);
      if (form.neuro_pct) scores['백분위']    = Number(form.neuro_pct);
    } else {
      if (!form.other_name.trim()) { setError('검사명을 입력하세요.'); setSaving(false); return; }
      test_name = form.other_name;
      raw_data = form.other_result;
    }

    const res = await fetchWithAuth(`/api/mindlink/cases/${id}/tests`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test_name, test_date: form.test_date, scores, interpretation: form.interpretation, raw_data, category: testCat, sub_type }),
    });
    if (res.ok) {
      await fetchData();
      setShowAddTest(false);
      setForm(emptyForm());
    } else setError('저장 실패');
    setSaving(false);
  }

  function openAddTest() { setForm(emptyForm()); setError(''); setShowAddTest(true); }

  const filteredTests = tests.filter(t => t.category === testCat);
  const catInfo = CATEGORIES.find(c => c.key === testCat)!;

  // ── 점수 그리드 입력 헬퍼 ─────────────────────────────────────
  const ScoreInput = ({ k, label }: { k: string; label: string }) => (
    <div>
      <label className="text-white/40 text-xs block mb-0.5">{label}</label>
      <input type="number" value={form.scores[k] ?? ''}
        onChange={e => setForm(f => ({ ...f, scores: { ...f.scores, [k]: e.target.value } }))}
        className="w-full rounded-lg px-2 py-1.5 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
        <Link href="/mindlink" className="hover:text-white">대시보드</Link>
        <span>›</span>
        <Link href={`/mindlink/cases/${id}`} className="hover:text-white">사례</Link>
        <span>›</span>
        <span className="text-white/70">회기 기록 & 심리검사</span>
      </div>

      {/* 상단 탭 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#1e293b' }}>
          {(['sessions', 'tests'] as const).map(v => (
            <button key={v} onClick={() => setTab(v)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === v ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              style={tab === v ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
              {v === 'sessions' ? '📝 상담기록' : '🔬 심리검사'}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setError(''); tab === 'sessions' ? setShowAddSession(true) : openAddTest(); }}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          + {tab === 'sessions' ? '회기 추가' : '검사 추가'}
        </button>
      </div>

      {/* ── 상담기록 탭 ── */}
      {tab === 'sessions' && (
        loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#1e293b' }} />)}</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 text-white/30"><p className="text-4xl mb-2">📝</p><p className="text-sm">상담 기록이 없습니다</p></div>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>{s.session_num}</span>
                    <span className="text-white font-medium text-sm">{s.session_date}</span>
                  </div>
                  {(s.mood_before != null || s.mood_after != null) && (
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <span>기분 {s.mood_before ?? '?'}</span><span>→</span>
                      <span className={(s.mood_after ?? 0) > (s.mood_before ?? 0) ? 'text-green-400' : 'text-red-400'}>{s.mood_after ?? '?'}</span>
                    </div>
                  )}
                </div>
                {s.observations    && <p className="text-white/70 text-sm mb-1"><span className="text-white/30 text-xs">관찰  </span>{s.observations}</p>}
                {s.counselor_notes && <p className="text-white/60 text-xs mb-1"><span className="text-white/20">메모  </span>{s.counselor_notes}</p>}
                {s.homework        && <p className="text-white/50 text-xs"><span className="text-white/20">과제  </span>{s.homework}</p>}
              </div>
            ))}
          </div>
        )
      )}

      {/* ── 심리검사 탭 ── */}
      {tab === 'tests' && (
        <>
          {/* 카테고리 탭 */}
          <div className="flex gap-2 flex-wrap mb-4">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setTestCat(c.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                style={testCat === c.key
                  ? { background: c.color + '25', borderColor: c.color + '60', color: c.color }
                  : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                {c.icon} {c.key}
              </button>
            ))}
          </div>

          {/* 성격검사 서브탭 */}
          {testCat === '성격검사' && (
            <div className="flex gap-1 mb-4 p-1 rounded-lg w-fit" style={{ background: '#1e293b' }}>
              {PERSONALITY_SUBS.map(s => (
                <button key={s} onClick={() => setTestSub(s)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${testSub === s ? 'text-white' : 'text-white/40'}`}
                  style={testSub === s ? { background: '#8b5cf6' } : {}}>
                  {s}
                </button>
              ))}
            </div>
          )}
          {/* 투사검사 서브탭 */}
          {testCat === '투사검사' && (
            <div className="flex gap-1 mb-4 p-1 rounded-lg w-fit" style={{ background: '#1e293b' }}>
              {PROJECTIVE_SUBS.map(s => (
                <button key={s} onClick={() => setTestSub(s)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${testSub === s ? 'text-white' : 'text-white/40'}`}
                  style={testSub === s ? { background: '#ec4899' } : {}}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* 검사 목록 */}
          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#1e293b' }} />)}</div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <p className="text-3xl mb-2">{catInfo.icon}</p>
              <p className="text-sm">{testCat} 결과가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTests
                .filter(t => {
                  if (testCat === '성격검사') return !t.sub_type || t.sub_type === testSub;
                  if (testCat === '투사검사') return !t.sub_type || t.sub_type === testSub;
                  return true;
                })
                .map(t => <TestCard key={t.id} test={t} color={catInfo.color} />)}
            </div>
          )}
        </>
      )}

      {/* ── 회기 추가 모달 ── */}
      {showAddSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-2xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto" style={{ background: '#1e293b' }}>
            <h2 className="text-white font-bold text-lg mb-4">회기 기록 추가</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="회기 번호 *"><input type="number" value={sessionForm.session_num} onChange={e => setSessionForm(f => ({ ...f, session_num: e.target.value }))} className={inputCls} /></Field>
                <Field label="날짜 *"><input type="date" value={sessionForm.session_date} onChange={e => setSessionForm(f => ({ ...f, session_date: e.target.value }))} className={inputCls} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="기분(전 1~10)"><input type="number" min="1" max="10" value={sessionForm.mood_before} onChange={e => setSessionForm(f => ({ ...f, mood_before: e.target.value }))} className={inputCls} /></Field>
                <Field label="기분(후 1~10)"><input type="number" min="1" max="10" value={sessionForm.mood_after}  onChange={e => setSessionForm(f => ({ ...f, mood_after:  e.target.value }))} className={inputCls} /></Field>
              </div>
              <Field label="임상 관찰"><textarea rows={3} value={sessionForm.observations}    onChange={e => setSessionForm(f => ({ ...f, observations:    e.target.value }))} className={`${inputCls} resize-none`} /></Field>
              <Field label="상담사 메모"><textarea rows={2} value={sessionForm.counselor_notes} onChange={e => setSessionForm(f => ({ ...f, counselor_notes: e.target.value }))} className={`${inputCls} resize-none`} /></Field>
              <Field label="과제"><input value={sessionForm.homework} onChange={e => setSessionForm(f => ({ ...f, homework: e.target.value }))} className={inputCls} /></Field>
              {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>
            <ModalButtons onCancel={() => setShowAddSession(false)} onSave={addSession} saving={saving} />
          </div>
        </div>
      )}

      {/* ── 검사 추가 모달 ── */}
      {showAddTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="rounded-2xl p-6 w-full max-w-xl border border-white/10 max-h-[92vh] overflow-y-auto" style={{ background: '#1e293b' }}>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-lg">{catInfo.icon}</span>
              <h2 className="text-white font-bold text-lg">{testCat} 입력
                {(testCat === '성격검사' || testCat === '투사검사') && <span className="ml-2 text-sm font-normal" style={{ color: catInfo.color }}>— {testSub}</span>}
              </h2>
            </div>
            <div className="space-y-4">
              {/* 공통 날짜 */}
              <Field label="검사 날짜"><input type="date" value={form.test_date} onChange={e => setForm(f => ({ ...f, test_date: e.target.value }))} className={inputCls} /></Field>

              {/* ── 지능검사 ── */}
              {testCat === '지능검사' && <>
                <Field label="검사명">
                  <select value={form.intel_name} onChange={e => setForm(f => ({ ...f, intel_name: e.target.value }))} className={`${inputCls} bg-slate-800`}>
                    {INTEL_NAMES.map(n => <option key={n}>{n}</option>)}
                  </select>
                </Field>
                {form.intel_name === '기타' && <Field label="검사명 직접 입력"><input value={form.test_name} onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))} className={inputCls} /></Field>}
                <div>
                  <p className="text-white/40 text-xs mb-2">지수 점수 (표준점수)</p>
                  <div className="grid grid-cols-3 gap-2">{INTEL_SCORES.map(s => <ScoreInput key={s.key} k={s.key} label={s.label} />)}</div>
                </div>
              </>}

              {/* ── 성격검사 MMPI ── */}
              {testCat === '성격검사' && testSub === 'MMPI' && <>
                <Field label="버전">
                  <select value={form.test_name || 'MMPI-2'} onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))} className={`${inputCls} bg-slate-800`}>
                    {['MMPI-2','MMPI-2-RF','MMPI-A'].map(n => <option key={n}>{n}</option>)}
                  </select>
                </Field>
                <div>
                  <p className="text-white/40 text-xs mb-2">타당도 척도 (T점수)</p>
                  <div className="grid grid-cols-3 gap-2">{MMPI_VALIDITY.map(k => <ScoreInput key={k} k={k} label={k} />)}</div>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-2">임상 척도 (T점수)</p>
                  <div className="grid grid-cols-5 gap-2">{MMPI_CLINICAL.map(k => <ScoreInput key={k} k={k} label={k} />)}</div>
                </div>
              </>}

              {/* ── 성격검사 TCI ── */}
              {testCat === '성격검사' && testSub === 'TCI' && <>
                <div>
                  <p className="text-white/40 text-xs mb-2">기질 척도 (T점수)</p>
                  <div className="grid grid-cols-2 gap-2">{TCI_TEMP.map(s => <ScoreInput key={s.key} k={s.key} label={s.label} />)}</div>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-2">성격 척도 (T점수)</p>
                  <div className="grid grid-cols-3 gap-2">{TCI_CHAR.map(s => <ScoreInput key={s.key} k={s.key} label={s.label} />)}</div>
                </div>
              </>}

              {/* ── 성격검사 기타 ── */}
              {testCat === '성격검사' && testSub === '기타' && <>
                <Field label="검사명 *"><input value={form.test_name} onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))} placeholder="예: NEO-PI-R, MBTI" className={inputCls} /></Field>
                <div>
                  <p className="text-white/40 text-xs mb-2">척도 / 점수</p>
                  {form.extra_scales.map((s, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={s.label} onChange={e => setForm(f => { const es = [...f.extra_scales]; es[i] = { ...es[i], label: e.target.value }; return { ...f, extra_scales: es }; })} placeholder="척도명" className={`${inputCls} flex-1`} />
                      <input type="number" value={s.value} onChange={e => setForm(f => { const es = [...f.extra_scales]; es[i] = { ...es[i], value: e.target.value }; return { ...f, extra_scales: es }; })} placeholder="점수" className={`${inputCls} w-20`} />
                      {i === form.extra_scales.length - 1 && (
                        <button onClick={() => setForm(f => ({ ...f, extra_scales: [...f.extra_scales, { label: '', value: '' }] }))}
                          className="px-2 rounded-lg text-white/60 border border-white/10 hover:bg-white/5 text-sm">+</button>
                      )}
                    </div>
                  ))}
                </div>
              </>}

              {/* ── 투사검사 SCT ── */}
              {testCat === '투사검사' && testSub === 'SCT' && (
                <Field label="주요 반응 내용">
                  <textarea rows={5} value={form.sct_responses} onChange={e => setForm(f => ({ ...f, sct_responses: e.target.value }))}
                    placeholder="문장완성 주요 반응을 입력하세요..." className={`${inputCls} resize-none`} />
                </Field>
              )}

              {/* ── 투사검사 로르샤하 ── */}
              {testCat === '투사검사' && testSub === '로르샤하' && (
                <div>
                  <p className="text-white/40 text-xs mb-2">핵심 변인</p>
                  <div className="grid grid-cols-3 gap-2">{RSCH_FIELDS.map(s => <ScoreInput key={s.key} k={s.key} label={s.label} />)}</div>
                </div>
              )}

              {/* ── 투사검사 HTP ── */}
              {testCat === '투사검사' && testSub === 'HTP' && <>
                <Field label="🏠 집(House) 관찰"><textarea rows={2} value={form.htp_house}   onChange={e => setForm(f => ({ ...f, htp_house:   e.target.value }))} className={`${inputCls} resize-none`} /></Field>
                <Field label="🌳 나무(Tree) 관찰"><textarea rows={2} value={form.htp_tree}   onChange={e => setForm(f => ({ ...f, htp_tree:   e.target.value }))} className={`${inputCls} resize-none`} /></Field>
                <Field label="🧍 사람(Person) 관찰"><textarea rows={2} value={form.htp_person} onChange={e => setForm(f => ({ ...f, htp_person: e.target.value }))} className={`${inputCls} resize-none`} /></Field>
              </>}

              {/* ── 투사검사 기타 ── */}
              {testCat === '투사검사' && testSub === '기타' && <>
                <Field label="검사명 *"><input value={form.test_name} onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))} placeholder="예: KFD, BGT, DAP" className={inputCls} /></Field>
                <Field label="관찰 및 결과"><textarea rows={3} value={form.raw_data} onChange={e => setForm(f => ({ ...f, raw_data: e.target.value }))} className={`${inputCls} resize-none`} /></Field>
              </>}

              {/* ── 신경심리검사 ── */}
              {testCat === '신경심리검사' && <>
                <Field label="검사명">
                  <select value={form.neuro_name} onChange={e => setForm(f => ({ ...f, neuro_name: e.target.value }))} className={`${inputCls} bg-slate-800`}>
                    {NEURO_NAMES.map(n => <option key={n}>{n}</option>)}
                  </select>
                </Field>
                {form.neuro_name === '기타' && <Field label="검사명 직접 입력"><input value={form.test_name} onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))} className={inputCls} /></Field>}
                <div className="grid grid-cols-3 gap-3">
                  <Field label="원점수"><input type="number" value={form.neuro_raw} onChange={e => setForm(f => ({ ...f, neuro_raw: e.target.value }))} className={inputCls} /></Field>
                  <Field label="표준점수/T"><input type="number" value={form.neuro_std} onChange={e => setForm(f => ({ ...f, neuro_std: e.target.value }))} className={inputCls} /></Field>
                  <Field label="백분위(%)"><input type="number" value={form.neuro_pct} onChange={e => setForm(f => ({ ...f, neuro_pct: e.target.value }))} className={inputCls} /></Field>
                </div>
              </>}

              {/* ── 기타검사 ── */}
              {testCat === '기타검사' && <>
                <Field label="검사명 *"><input value={form.other_name} onChange={e => setForm(f => ({ ...f, other_name: e.target.value }))} placeholder="예: BDI-II, BAI, PCL-5" className={inputCls} /></Field>
                <Field label="점수 / 결과"><textarea rows={2} value={form.other_result} onChange={e => setForm(f => ({ ...f, other_result: e.target.value }))} className={`${inputCls} resize-none`} /></Field>
              </>}

              {/* 공통 해석 */}
              <Field label="해석 및 소견">
                <textarea rows={3} value={form.interpretation} onChange={e => setForm(f => ({ ...f, interpretation: e.target.value }))}
                  placeholder="검사 결과에 대한 임상적 해석을 입력하세요" className={`${inputCls} resize-none`} />
              </Field>

              {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>
            <ModalButtons onCancel={() => setShowAddTest(false)} onSave={addTest} saving={saving} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── 보조 컴포넌트 ─────────────────────────────────────────────
function TestCard({ test, color }: { test: TestResult; color: string }) {
  let htpData: Record<string, string> | null = null;
  if (test.sub_type === 'HTP' && test.raw_data) {
    try { htpData = JSON.parse(test.raw_data); } catch { /* */ }
  }
  return (
    <div className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm">{test.test_name}</span>
          {test.sub_type && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: color + '20', color }}>{test.sub_type}</span>}
        </div>
        <span className="text-white/40 text-xs">{test.test_date}</span>
      </div>
      {Object.keys(test.scores || {}).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {Object.entries(test.scores).map(([k, v]) => (
            <span key={k} className="px-2 py-0.5 rounded text-xs border border-white/10 text-white/60">
              {k}: <span className="text-white font-medium">{v}</span>
            </span>
          ))}
        </div>
      )}
      {htpData && (
        <div className="space-y-1 mb-2 text-xs text-white/60">
          {htpData.house  && <p><span className="text-white/30">🏠 </span>{htpData.house}</p>}
          {htpData.tree   && <p><span className="text-white/30">🌳 </span>{htpData.tree}</p>}
          {htpData.person && <p><span className="text-white/30">🧍 </span>{htpData.person}</p>}
        </div>
      )}
      {!htpData && test.raw_data && <p className="text-white/60 text-xs mb-2">{test.raw_data}</p>}
      {test.interpretation && <p className="text-white/70 text-sm leading-relaxed">{test.interpretation}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-white/50 text-xs block mb-1">{label}</label>
      {children}
    </div>
  );
}

function ModalButtons({ onCancel, onSave, saving }: { onCancel: () => void; onSave: () => void; saving: boolean }) {
  return (
    <div className="flex gap-3 mt-6">
      <button onClick={onCancel} className="flex-1 py-2 rounded-lg text-white/60 text-sm border border-white/10 hover:bg-white/5">취소</button>
      <button onClick={onSave} disabled={saving} className="flex-1 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
        {saving ? '저장 중...' : '저장'}
      </button>
    </div>
  );
}

const inputCls = 'w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400';
