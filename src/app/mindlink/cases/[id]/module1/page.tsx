'use client';
import { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import RorschachCoding from './RorschachCoding';
import RiskAssessment from './RiskAssessment';
import { IndexScoreChart, SubtestChart, classifyIndex } from './IntelChart';
import SCTForm from './SCTForm';

// ── 타입 ──────────────────────────────────────────────────────
interface Session {
  id: string; session_num: number; session_date: string;
  session_type: string; duration: number;
  mood_before: number | null; mood_after: number | null;
  session_notes: string;
  observations: string; counselor_notes: string; homework: string;
  soap_s: string; soap_o: string; soap_a: string; soap_p: string;
}
interface TestResult {
  id: string; test_name: string; test_date: string;
  scores: Record<string, number | string>; interpretation: string;
  raw_data: string; category: string; sub_type: string;
}

// ── 상수 ─────────────────────────────────────────────────────
const CATEGORIES = [
  { key: '지능검사',     icon: '🧩', color: '#3b82f6' },
  { key: '성격검사',     icon: '👤', color: '#8b5cf6' },
  { key: '투사검사',     icon: '🎨', color: '#ec4899' },
  { key: '신경심리검사', icon: '⚡', color: '#f59e0b' },
  { key: '기타검사',     icon: '📋', color: '#6b7280' },
];
const SESSION_TYPES    = ['대면', '비대면(화상)', '전화', '가정방문'];
const PERSONALITY_SUBS = ['MMPI', 'TCI', '기타'];
const PROJECTIVE_SUBS  = ['SCT', '로르샤하', 'HTP', '기타'];
const INTEL_NAMES  = ['K-WAIS-IV', 'K-WISC-V', 'K-ABC-II', '기타'];

// 검사명별 지수 구성
const INTEL_SCORES_BY_TEST: Record<string, { key: string; label: string }[]> = {
  'K-WAIS-IV': [
    { key: 'VCI',  label: '언어이해(VCI)'  },
    { key: 'PRI',  label: '지각추론(PRI)'  },
    { key: 'WMI',  label: '작업기억(WMI)'  },
    { key: 'PSI',  label: '처리속도(PSI)'  },
    { key: 'FSIQ', label: '전체지능(FSIQ)' },
  ],
  'K-WISC-V': [
    { key: 'VCI',  label: '언어이해(VCI)'  },
    { key: 'VSI',  label: '시공간(VSI)'    },
    { key: 'FRI',  label: '유동추론(FRI)'  },
    { key: 'WMI',  label: '작업기억(WMI)'  },
    { key: 'PSI',  label: '처리속도(PSI)'  },
    { key: 'FSIQ', label: '전체지능(FSIQ)' },
  ],
  'K-ABC-II': [
    { key: 'MPI',  label: '정신처리지수(MPI)' },
    { key: 'FCI',  label: '유동-결정지수(FCI)' },
    { key: 'NVI',  label: '비언어지수(NVI)'   },
    { key: 'KI',   label: '지식지수(KI)'      },
  ],
  '기타': [
    { key: 'FSIQ', label: '전체지능(FSIQ)' },
  ],
};
// ── 소검사 정의 ────────────────────────────────────────────────
// K-WAIS-IV (Wechsler Adult Intelligence Scale 4th ed.)
// 언어이해: 공통성·어휘·상식(핵심) + 이해(보충)
// 지각추론: 토막짜기·행렬추론·퍼즐(핵심) + 무게비교·빠진곳찾기(보충)
// 작업기억: 숫자·산수(핵심) + 순서화(보충)
// 처리속도: 동형찾기·기호쓰기(핵심) + 지우기(보충)
const WAIS4_SUBTESTS: { domain: string; color: string; tests: { key: string; label: string; core: boolean }[] }[] = [
  { domain: '언어이해', color: '#3b82f6', tests: [
    { key: 'SI', label: '공통성',     core: true  },
    { key: 'VC', label: '어휘',       core: true  },
    { key: 'IN', label: '상식',       core: true  },
    { key: 'CO', label: '이해',       core: false },
  ]},
  { domain: '지각추론', color: '#8b5cf6', tests: [
    { key: 'BD',  label: '토막짜기',    core: true  },
    { key: 'MR',  label: '행렬추론',    core: true  },
    { key: 'VP',  label: '퍼즐',        core: true  },
    { key: 'FW',  label: '무게비교',    core: false },
    { key: 'PCm', label: '빠진곳찾기',  core: false },
  ]},
  { domain: '작업기억', color: '#22c55e', tests: [
    { key: 'DS', label: '숫자',   core: true  },
    { key: 'AR', label: '산수',   core: true  },
    { key: 'LN', label: '순서화', core: false },
  ]},
  { domain: '처리속도', color: '#06b6d4', tests: [
    { key: 'SS', label: '동형찾기', core: true  },
    { key: 'CD', label: '기호쓰기', core: true  },
    { key: 'CA', label: '지우기',   core: false },
  ]},
];

// K-WISC-V (Wechsler Intelligence Scale for Children 5th ed.)
// 언어이해: 공통성·어휘(핵심) + 상식·이해(보충)
// 시공간:   토막짜기·퍼즐(핵심)
// 유동추론: 행렬추론·무게비교(핵심) + 공통그림찾기·산수(보충)
// 작업기억: 숫자·그림기억(핵심) + 순서화(보충)
// 처리속도: 기호쓰기·동형찾기(핵심) + 선택(보충)
const WISC5_SUBTESTS: { domain: string; color: string; tests: { key: string; label: string; core: boolean }[] }[] = [
  { domain: '언어이해', color: '#3b82f6', tests: [
    { key: 'SI', label: '공통성',  core: true  },
    { key: 'VC', label: '어휘',    core: true  },
    { key: 'IN', label: '상식',    core: false },
    { key: 'CO', label: '이해',    core: false },
  ]},
  { domain: '시공간', color: '#ec4899', tests: [
    { key: 'BD', label: '토막짜기', core: true },
    { key: 'VP', label: '퍼즐',     core: true },
  ]},
  { domain: '유동추론', color: '#f59e0b', tests: [
    { key: 'MR',  label: '행렬추론',     core: true  },
    { key: 'FW',  label: '무게비교',     core: true  },
    { key: 'PCn', label: '공통그림찾기', core: false },
    { key: 'AR',  label: '산수',         core: false },
  ]},
  { domain: '작업기억', color: '#22c55e', tests: [
    { key: 'DS', label: '숫자',   core: true  },
    { key: 'PS', label: '그림기억', core: true  },
    { key: 'LN', label: '순서화', core: false },
  ]},
  { domain: '처리속도', color: '#06b6d4', tests: [
    { key: 'CD', label: '기호쓰기', core: true  },
    { key: 'SS', label: '동형찾기', core: true  },
    { key: 'CA', label: '선택',     core: false },
  ]},
];

function getSubtests(intelName: string) {
  if (intelName === 'K-WISC-V') return WISC5_SUBTESTS;
  if (intelName === 'K-WAIS-IV') return WAIS4_SUBTESTS;
  return [];
}

const MMPI_VALIDITY = ['L','F','K'];
const MMPI_CLINICAL = ['Hs','D','Hy','Pd','Mf','Pa','Pt','Sc','Ma','Si'];
const TCI_TEMP = [
  { key:'NS', label:'자극추구(NS)' }, { key:'HA', label:'위험회피(HA)' },
  { key:'RD', label:'사회적민감성(RD)' }, { key:'PS', label:'인내력(PS)' },
];
const TCI_CHAR = [
  { key:'SD', label:'자율성(SD)' }, { key:'C', label:'연대감(C)' }, { key:'ST', label:'자기초월(ST)' },
];
const NEURO_NAMES = ['K-MoCA','MMSE-K','TMT-A','TMT-B','Stroop','WMS-IV','RCFT','BGT','기타'];

const SOAP_SECTIONS = [
  { key: 'soap_s' as const, label: 'S — Subjective', color: '#3b82f6', placeholder: '내담자 진술, 주요 호소 내용, 감정 및 사고 보고' },
  { key: 'soap_o' as const, label: 'O — Objective',  color: '#22c55e', placeholder: '행동관찰, 정서상태, 위험징후 확인' },
  { key: 'soap_a' as const, label: 'A — Assessment', color: '#f59e0b', placeholder: '임상적 해석, 사례개념화, 진단적 고려사항, 위험도 평가' },
  { key: 'soap_p' as const, label: 'P — Plan',       color: '#8b5cf6', placeholder: '다음 회기 목표, 개입계획, 과제 부여, 의뢰 여부' },
];

// ── 빈 폼 ─────────────────────────────────────────────────────
function emptySessionForm() {
  return {
    session_num:   '',
    session_date:  new Date().toISOString().split('T')[0],
    session_type:  '대면',
    duration:      '50',
    mood_before:   '',
    mood_after:    '',
    session_notes: '',
    soap_s: '', soap_o: '', soap_a: '', soap_p: '',
  };
}
function emptyForm() {
  return {
    test_name: '', test_date: new Date().toISOString().split('T')[0],
    interpretation: '', raw_data: '',
    scores: {} as Record<string, string>,
    intel_name: 'K-WAIS-IV',
    extra_scales: [{ label: '', value: '' }],
    sct_responses: '',
    htp_house: '', htp_tree: '', htp_person: '',
    neuro_name: 'K-MoCA', neuro_raw: '', neuro_std: '', neuro_pct: '',
    other_name: '', other_result: '',
  };
}

function populateFormFromTest(test: TestResult) {
  const f = emptyForm();
  f.test_date      = test.test_date;
  f.interpretation = test.interpretation;
  if (test.category === '지능검사') {
    f.intel_name = INTEL_NAMES.slice(0,-1).includes(test.test_name) ? test.test_name : '기타';
    if (f.intel_name === '기타') f.test_name = test.test_name;
    const intelScores = INTEL_SCORES_BY_TEST[f.intel_name] ?? INTEL_SCORES_BY_TEST['기타'];
    intelScores.forEach(s => { if (test.scores[s.key] != null) f.scores[s.key] = String(test.scores[s.key]); });
  } else if (test.category === '성격검사' && test.sub_type === 'MMPI') {
    f.test_name = test.test_name;
    [...MMPI_VALIDITY,...MMPI_CLINICAL].forEach(k => { if (test.scores[k] != null) f.scores[k] = String(test.scores[k]); });
  } else if (test.category === '성격검사' && test.sub_type === 'TCI') {
    [...TCI_TEMP,...TCI_CHAR].forEach(s => { if (test.scores[s.key] != null) f.scores[s.key] = String(test.scores[s.key]); });
  } else if (test.category === '성격검사' && test.sub_type === '기타') {
    f.test_name = test.test_name;
    const entries = Object.entries(test.scores).map(([label, value]) => ({ label, value: String(value) }));
    f.extra_scales = entries.length > 0 ? entries : [{ label: '', value: '' }];
  } else if (test.category === '투사검사' && test.sub_type === 'SCT') {
    f.sct_responses = test.raw_data;
  } else if (test.category === '투사검사' && test.sub_type === '로르샤하') {
    f.raw_data = test.raw_data;
    Object.entries(test.scores).forEach(([k, v]) => { f.scores[k] = String(v); });
  } else if (test.category === '투사검사' && test.sub_type === 'HTP') {
    try { const d = JSON.parse(test.raw_data); f.htp_house = d.house ?? ''; f.htp_tree = d.tree ?? ''; f.htp_person = d.person ?? ''; } catch { /**/ }
  } else if (test.category === '투사검사' && test.sub_type === '기타') {
    f.test_name = test.test_name; f.raw_data = test.raw_data;
  } else if (test.category === '신경심리검사') {
    f.neuro_name = NEURO_NAMES.slice(0,-1).includes(test.test_name) ? test.test_name : '기타';
    if (f.neuro_name === '기타') f.test_name = test.test_name;
    if (test.scores['원점수']  != null) f.neuro_raw = String(test.scores['원점수']);
    if (test.scores['표준점수'] != null) f.neuro_std = String(test.scores['표준점수']);
    if (test.scores['백분위']  != null) f.neuro_pct = String(test.scores['백분위']);
  } else {
    f.other_name = test.test_name; f.other_result = test.raw_data;
  }
  return f;
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function Module1({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab,      setTab]      = useState<'sessions' | 'tests' | 'risk'>('sessions');
  const [testCat,  setTestCat]  = useState('지능검사');
  const [testSub,  setTestSub]  = useState('MMPI');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tests,    setTests]    = useState<TestResult[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [hasDraft, setHasDraft] = useState(false);

  const [showAddSession,   setShowAddSession]   = useState(false);
  const [showAddTest,      setShowAddTest]      = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTestId,    setEditingTestId]    = useState<string | null>(null);
  const [sessionForm,      setSessionForm]      = useState(emptySessionForm());
  const [form,             setForm]             = useState(emptyForm());
  const [saving,           setSaving]           = useState(false);
  const [soapLoading,      setSoapLoading]      = useState(false);
  const [soapError,        setSoapError]        = useState('');
  const [error,            setError]            = useState('');
  const [intelTab,         setIntelTab]         = useState<'지수' | '소검사' | '그래프'>('지수');

  // 자동저장 (신규 회기만)
  useEffect(() => {
    if (!showAddSession || editingSessionId) return;
    const t = setTimeout(() => {
      localStorage.setItem(`ml_draft_${id}`, JSON.stringify(sessionForm));
      setHasDraft(true);
    }, 1500);
    return () => clearTimeout(t);
  }, [sessionForm, showAddSession, editingSessionId, id]);

  useEffect(() => {
    setHasDraft(!!localStorage.getItem(`ml_draft_${id}`));
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    const res = await fetchWithAuth(`/api/mindlink/cases/${id}`);
    if (res.ok) { const d = await res.json(); setSessions(d.sessions ?? []); setTests(d.tests ?? []); }
    setLoading(false);
  }

  // ── AI SOAP 자동생성 ──────────────────────────────────────
  async function generateSOAP() {
    if (!sessionForm.session_notes.trim()) {
      setSoapError('상담 노트를 먼저 작성하세요.');
      return;
    }
    setSoapLoading(true); setSoapError('');
    const res = await fetchWithAuth('/api/mindlink/ai/soap', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_id: id,
        session_notes: sessionForm.session_notes,
        session_num:   sessionForm.session_num,
        session_date:  sessionForm.session_date,
      }),
    });
    if (res.ok) {
      const d = await res.json();
      setSessionForm(f => ({
        ...f,
        soap_s: d.soap_s ?? f.soap_s,
        soap_o: d.soap_o ?? f.soap_o,
        soap_a: d.soap_a ?? f.soap_a,
        soap_p: d.soap_p ?? f.soap_p,
      }));
    } else {
      const d = await res.json();
      setSoapError(d.error ?? 'AI 오류');
    }
    setSoapLoading(false);
  }

  // ── 회기 CRUD ─────────────────────────────────────────────
  async function saveSession() {
    if (!sessionForm.session_date) { setError('날짜는 필수입니다.'); return; }
    setSaving(true); setError('');
    const payload = {
      session_date:  sessionForm.session_date,
      session_type:  sessionForm.session_type,
      duration:      Number(sessionForm.duration) || 50,
      mood_before:   sessionForm.mood_before  ? Number(sessionForm.mood_before)  : null,
      mood_after:    sessionForm.mood_after   ? Number(sessionForm.mood_after)   : null,
      session_notes: sessionForm.session_notes,
      soap_s: sessionForm.soap_s, soap_o: sessionForm.soap_o,
      soap_a: sessionForm.soap_a, soap_p: sessionForm.soap_p,
    };
    const res = editingSessionId
      ? await fetchWithAuth(`/api/mindlink/cases/${id}/sessions`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: editingSessionId, ...payload }),
        })
      : await fetchWithAuth(`/api/mindlink/cases/${id}/sessions`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, session_num: Number(sessionForm.session_num) }),
        });
    if (res.ok) {
      localStorage.removeItem(`ml_draft_${id}`); setHasDraft(false);
      await fetchData(); closeSessionModal();
    } else {
      const d = await res.json().catch(() => ({}));
      setError((d.detail || d.error) ?? (editingSessionId ? '수정 실패' : '저장 실패'));
    }
    setSaving(false);
  }

  async function deleteSession(sessionId: string) {
    if (!window.confirm('이 회기 기록을 삭제하시겠습니까?')) return;
    await fetchWithAuth(`/api/mindlink/cases/${id}/sessions`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });
    await fetchData();
  }

  function openAddSession() {
    const raw = localStorage.getItem(`ml_draft_${id}`);
    setSessionForm(raw ? { ...emptySessionForm(), ...JSON.parse(raw) } : emptySessionForm());
    setEditingSessionId(null); setSoapError(''); setError(''); setShowAddSession(true);
  }

  function openEditSession(s: Session) {
    setEditingSessionId(s.id);
    setSessionForm({
      session_num:   String(s.session_num),
      session_date:  s.session_date,
      session_type:  s.session_type ?? '대면',
      duration:      String(s.duration ?? 50),
      mood_before:   s.mood_before != null ? String(s.mood_before) : '',
      mood_after:    s.mood_after  != null ? String(s.mood_after)  : '',
      session_notes: s.session_notes || '',
      soap_s: s.soap_s || '',
      soap_o: s.soap_o || s.observations    || '',
      soap_a: s.soap_a || s.counselor_notes || '',
      soap_p: s.soap_p || s.homework        || '',
    });
    setSoapError(''); setError(''); setShowAddSession(true);
  }

  // ── 검사 CRUD ─────────────────────────────────────────────
  async function saveTest() {
    setSaving(true); setError('');
    let test_name = ''; let scores: Record<string, number | string> = {}; let raw_data = '';
    const sub_type = testCat === '성격검사' ? testSub : testCat === '투사검사' ? testSub : '';

    if (testCat === '지능검사') {
      test_name = form.intel_name === '기타' ? form.test_name : form.intel_name;
      const intelScores = INTEL_SCORES_BY_TEST[form.intel_name] ?? INTEL_SCORES_BY_TEST['기타'];
      intelScores.forEach(s => { if (form.scores[s.key]) scores[s.key] = Number(form.scores[s.key]); });
    } else if (testCat === '성격검사' && testSub === 'MMPI') {
      test_name = form.test_name || 'MMPI-2';
      [...MMPI_VALIDITY,...MMPI_CLINICAL].forEach(k => { if (form.scores[k]) scores[k] = Number(form.scores[k]); });
    } else if (testCat === '성격검사' && testSub === 'TCI') {
      test_name = 'TCI-RS';
      [...TCI_TEMP,...TCI_CHAR].forEach(s => { if (form.scores[s.key]) scores[s.key] = Number(form.scores[s.key]); });
    } else if (testCat === '성격검사' && testSub === '기타') {
      if (!form.test_name.trim()) { setError('검사명을 입력하세요.'); setSaving(false); return; }
      test_name = form.test_name;
      form.extra_scales.forEach(({ label, value }) => { if (label && value) scores[label] = Number(value) || value; });
    } else if (testCat === '투사검사' && testSub === 'SCT') {
      test_name = '문장완성검사(SCT)'; raw_data = form.sct_responses;
    } else if (testCat === '투사검사' && testSub === '로르샤하') {
      test_name = '로르샤하(Rorschach)';
      Object.entries(form.scores).forEach(([k, v]) => { if (v !== '') scores[k] = isNaN(Number(v)) ? v : Number(v); });
      raw_data = form.raw_data;
    } else if (testCat === '투사검사' && testSub === 'HTP') {
      test_name = 'HTP';
      raw_data = JSON.stringify({ house: form.htp_house, tree: form.htp_tree, person: form.htp_person });
    } else if (testCat === '투사검사' && testSub === '기타') {
      if (!form.test_name.trim()) { setError('검사명을 입력하세요.'); setSaving(false); return; }
      test_name = form.test_name; raw_data = form.raw_data;
    } else if (testCat === '신경심리검사') {
      test_name = form.neuro_name === '기타' ? form.test_name : form.neuro_name;
      if (form.neuro_raw) scores['원점수']  = Number(form.neuro_raw);
      if (form.neuro_std) scores['표준점수'] = Number(form.neuro_std);
      if (form.neuro_pct) scores['백분위']   = Number(form.neuro_pct);
    } else {
      if (!form.other_name.trim()) { setError('검사명을 입력하세요.'); setSaving(false); return; }
      test_name = form.other_name; raw_data = form.other_result;
    }

    const common = { test_name, test_date: form.test_date, scores, interpretation: form.interpretation, raw_data };
    const res = editingTestId
      ? await fetchWithAuth(`/api/mindlink/cases/${id}/tests`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test_id: editingTestId, ...common }),
        })
      : await fetchWithAuth(`/api/mindlink/cases/${id}/tests`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...common, category: testCat, sub_type }),
        });
    if (res.ok) { await fetchData(); closeTestModal(); }
    else {
      const d = await res.json().catch(() => ({}));
      setError((d.detail || d.error) ?? (editingTestId ? '수정 실패' : '저장 실패'));
    }
    setSaving(false);
  }

  async function deleteTest(testId: string) {
    if (!window.confirm('이 검사 결과를 삭제하시겠습니까?')) return;
    await fetchWithAuth(`/api/mindlink/cases/${id}/tests`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test_id: testId }),
    });
    await fetchData();
  }

  function openEditTest(t: TestResult) {
    setEditingTestId(t.id); setTestCat(t.category);
    setTestSub(t.sub_type || (t.category === '성격검사' ? 'MMPI' : t.category === '투사검사' ? 'SCT' : ''));
    setForm(populateFormFromTest(t)); setError(''); setShowAddTest(true);
  }

  function openAddTest()       { setForm(emptyForm()); setEditingTestId(null); setError(''); setShowAddTest(true); }
  function closeSessionModal() { setShowAddSession(false); setEditingSessionId(null); setSessionForm(emptySessionForm()); setSoapError(''); setError(''); }
  function closeTestModal()    { setShowAddTest(false);    setEditingTestId(null);    setForm(emptyForm());              setError(''); }

  const handleRorschachDataChange = useCallback((s: Record<string, string>, r: string) => {
    setForm(f => ({ ...f, scores: s, raw_data: r }));
  }, []);
  function handleScoreChange(k: string, v: string) { setForm(f => ({ ...f, scores: { ...f.scores, [k]: v } })); }

  const filteredTests = tests.filter(t => {
    if (t.category !== testCat) return false;
    if (testCat === '성격검사' && t.sub_type !== testSub) return false;
    if (testCat === '투사검사' && t.sub_type !== testSub) return false;
    return true;
  });
  const catInfo = CATEGORIES.find(c => c.key === testCat)!;

  return (
    // max-w-7xl 로 가로 폭 확장
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
        <Link href="/mindlink" className="hover:text-white">대시보드</Link>
        <span>›</span>
        <Link href={`/mindlink/cases/${id}`} className="hover:text-white">사례</Link>
        <span>›</span>
        <span className="text-white/70">회기 기록 & 심리검사</span>
      </div>

      {/* 탭 + 액션 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#1e293b' }}>
          {(['sessions', 'tests', 'risk'] as const).map(v => (
            <button key={v} onClick={() => setTab(v)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === v ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              style={tab === v ? { background: v === 'risk' ? 'linear-gradient(135deg,#ef4444,#f97316)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
              {v === 'sessions' ? '📝 상담기록' : v === 'tests' ? '🔬 심리검사' : '⚠️ 위험관리'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.open(`/mindlink/cases/${id}/print`, '_blank')}
            className="px-3 py-1.5 rounded-lg text-white/60 text-xs font-medium border border-white/10 hover:bg-white/5 hover:text-white transition-all">
            🖨️ PDF 출력
          </button>
          {tab !== 'risk' && (
            <button onClick={() => { setError(''); tab === 'sessions' ? openAddSession() : openAddTest(); }}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              + {tab === 'sessions' ? '회기 추가' : '검사 추가'}
            </button>
          )}
        </div>
      </div>

      {/* 자동저장 초안 알림 */}
      {tab === 'sessions' && hasDraft && !showAddSession && (
        <div className="flex items-center justify-between p-3 rounded-lg border border-indigo-400/30 bg-indigo-400/10 mb-4 text-xs">
          <span className="text-indigo-300">💾 저장되지 않은 초안이 있습니다.</span>
          <div className="flex gap-3">
            <button onClick={openAddSession} className="text-indigo-300 underline hover:text-indigo-200">이어 작성</button>
            <button onClick={() => { localStorage.removeItem(`ml_draft_${id}`); setHasDraft(false); }} className="text-white/30 hover:text-white/60">삭제</button>
          </div>
        </div>
      )}

      {/* ── 상담기록 탭 ── */}
      {tab === 'sessions' && (
        loading
          ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: '#1e293b' }} />)}</div>
          : sessions.length === 0
            ? <div className="text-center py-20 text-white/30"><p className="text-4xl mb-2">📝</p><p className="text-sm">상담 기록이 없습니다</p></div>
            : <div className="space-y-3">{sessions.map(s => <SessionCard key={s.id} session={s} onEdit={() => openEditSession(s)} onDelete={() => deleteSession(s.id)} />)}</div>
      )}

      {/* ── 심리검사 탭 ── */}
      {tab === 'tests' && (
        <>
          <div className="flex gap-2 flex-wrap mb-4">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setTestCat(c.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                style={testCat === c.key
                  ? { background: c.color+'25', borderColor: c.color+'60', color: c.color }
                  : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                {c.icon} {c.key}
              </button>
            ))}
          </div>
          {testCat === '성격검사' && (
            <div className="flex gap-1 mb-4 p-1 rounded-lg w-fit" style={{ background: '#1e293b' }}>
              {PERSONALITY_SUBS.map(s => (
                <button key={s} onClick={() => setTestSub(s)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${testSub === s ? 'text-white' : 'text-white/40'}`}
                  style={testSub === s ? { background: '#8b5cf6' } : {}}>{s}</button>
              ))}
            </div>
          )}
          {testCat === '투사검사' && (
            <div className="flex gap-1 mb-4 p-1 rounded-lg w-fit" style={{ background: '#1e293b' }}>
              {PROJECTIVE_SUBS.map(s => (
                <button key={s} onClick={() => setTestSub(s)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${testSub === s ? 'text-white' : 'text-white/40'}`}
                  style={testSub === s ? { background: '#ec4899' } : {}}>{s}</button>
              ))}
            </div>
          )}
          {loading
            ? <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#1e293b' }} />)}</div>
            : filteredTests.length === 0
              ? <div className="text-center py-16 text-white/30"><p className="text-3xl mb-2">{catInfo.icon}</p><p className="text-sm">{testCat} 결과가 없습니다</p></div>
              : <div className="space-y-3">{filteredTests.map(t => <TestCard key={t.id} test={t} color={catInfo.color} onEdit={() => openEditTest(t)} onDelete={() => deleteTest(t.id)} />)}</div>
          }
        </>
      )}

      {/* ── 위험관리 탭 ── */}
      {tab === 'risk' && (
        <RiskAssessment caseId={id} sessions={sessions.map(s => ({ id: s.id, session_num: s.session_num, session_date: s.session_date }))} />
      )}

      {/* ══════════════════════════════════════════════════════
          회기 추가 / 수정 모달  (넓은 2-컬럼 레이아웃)
          ══════════════════════════════════════════════════════ */}
      {showAddSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="rounded-2xl w-full border border-white/10 flex flex-col" style={{ background: '#1e293b', maxWidth: '1100px', maxHeight: '92vh' }}>

            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <h2 className="text-white font-bold text-lg">
                {editingSessionId ? '회기 기록 수정' : '회기 기록 추가'}
              </h2>
              {!editingSessionId && <span className="text-indigo-400 text-xs">💾 자동저장 중</span>}
            </div>

            {/* 기본 정보 행 */}
            <div className="px-6 pt-4 pb-3 border-b border-white/10 shrink-0">
              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-1">
                  <label className={labelCls}>회기 번호</label>
                  <input type="number" value={sessionForm.session_num} disabled={!!editingSessionId}
                    onChange={e => setSessionForm(f => ({ ...f, session_num: e.target.value }))}
                    className={`${inputCls} ${editingSessionId ? 'opacity-40 cursor-not-allowed' : ''}`} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>날짜 *</label>
                  <input type="date" value={sessionForm.session_date}
                    onChange={e => setSessionForm(f => ({ ...f, session_date: e.target.value }))} className={inputCls} />
                </div>
                <div className="col-span-1">
                  <label className={labelCls}>상담형태</label>
                  <select value={sessionForm.session_type} onChange={e => setSessionForm(f => ({ ...f, session_type: e.target.value }))}
                    className={inputCls} style={{ background: '#0f172a' }}>
                    {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className={labelCls}>시간(분)</label>
                  <input type="number" min="10" max="180" value={sessionForm.duration}
                    onChange={e => setSessionForm(f => ({ ...f, duration: e.target.value }))} className={inputCls} />
                </div>
                <div className="col-span-1">
                  <label className={labelCls}>기분 전→후</label>
                  <div className="flex gap-1 items-center">
                    <input type="number" min="1" max="10" value={sessionForm.mood_before} placeholder="전"
                      onChange={e => setSessionForm(f => ({ ...f, mood_before: e.target.value }))} className={`${inputCls} w-12 px-1 text-center`} />
                    <span className="text-white/30 text-xs">→</span>
                    <input type="number" min="1" max="10" value={sessionForm.mood_after} placeholder="후"
                      onChange={e => setSessionForm(f => ({ ...f, mood_after: e.target.value }))} className={`${inputCls} w-12 px-1 text-center`} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2-컬럼 본문 (스크롤 가능) */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

              {/* ── 좌: 자유기술 노트 ── */}
              <div className="flex flex-col w-1/2 border-r border-white/10 p-5 min-h-0">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <span className="text-white/70 text-sm font-semibold">📋 상담 노트</span>
                  <span className="text-white/30 text-xs">자유롭게 기술 후 AI로 SOAP 자동 작성</span>
                </div>
                <textarea
                  value={sessionForm.session_notes}
                  onChange={e => setSessionForm(f => ({ ...f, session_notes: e.target.value }))}
                  placeholder={`상담 내용을 자유롭게 기술하세요.\n\n예)\n- 내담자 오늘 많이 울었음. 직장 스트레스 이야기.\n- 수면 2~3시간으로 줄었다고 함.\n- 어머니와의 갈등 다시 언급.\n- CBT 숙제 부분 완료. 자동적 사고 기록지 3개 작성.`}
                  className="flex-1 w-full rounded-xl px-4 py-3 text-white/85 text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400 resize-none leading-relaxed"
                  style={{ minHeight: '300px' }}
                />

                {/* AI 버튼 */}
                <div className="mt-3 shrink-0">
                  <button
                    onClick={generateSOAP}
                    disabled={soapLoading || !sessionForm.session_notes.trim()}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                    {soapLoading
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>AI 분석 중...</span></>
                      : <><span>✨</span><span>AI로 SOAP 자동 작성</span></>
                    }
                  </button>
                  {soapError && <p className="text-red-400 text-xs mt-1.5">{soapError}</p>}
                </div>
              </div>

              {/* ── 우: SOAP ── */}
              <div className="flex flex-col w-1/2 p-5 overflow-y-auto min-h-0">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <span className="text-white/70 text-sm font-semibold">🏥 SOAP 기록</span>
                  {(sessionForm.soap_s || sessionForm.soap_o || sessionForm.soap_a || sessionForm.soap_p) && (
                    <span className="text-green-400 text-xs">✓ AI 작성 완료</span>
                  )}
                </div>
                <div className="rounded-xl border border-white/10 overflow-hidden flex-1">
                  {SOAP_SECTIONS.map(sec => (
                    <div key={sec.key} className="border-b border-white/10 last:border-0 flex flex-col" style={{ minHeight: '120px' }}>
                      <div className="px-3 pt-2.5 pb-1 flex items-center gap-2 shrink-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sec.color }} />
                        <span className="text-xs font-bold" style={{ color: sec.color }}>{sec.label}</span>
                      </div>
                      <textarea
                        value={sessionForm[sec.key]}
                        onChange={e => setSessionForm(f => ({ ...f, [sec.key]: e.target.value }))}
                        placeholder={sec.placeholder}
                        className="flex-1 w-full px-3 pb-3 text-white/80 text-sm bg-transparent outline-none resize-none placeholder:text-white/20 leading-relaxed" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 모달 하단 */}
            <div className="px-6 py-4 border-t border-white/10 shrink-0">
              {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
              <div className="flex gap-3">
                <button onClick={closeSessionModal} className="flex-1 py-2 rounded-lg text-white/60 text-sm border border-white/10 hover:bg-white/5">취소</button>
                <button onClick={saveSession} disabled={saving}
                  className="flex-1 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {saving ? '처리 중...' : editingSessionId ? '수정 완료' : '저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 검사 모달 (기존 유지) ── */}
      {showAddTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className={`rounded-2xl p-6 w-full border border-white/10 max-h-[92vh] overflow-y-auto ${testCat === '투사검사' && testSub === '로르샤하' ? 'max-w-5xl' : 'max-w-xl'}`} style={{ background: '#1e293b' }}>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-lg">{catInfo.icon}</span>
              <h2 className="text-white font-bold text-lg">
                {editingTestId ? `${testCat} 수정` : `${testCat} 입력`}
                {(testCat === '성격검사' || testCat === '투사검사') &&
                  <span className="ml-2 text-sm font-normal" style={{ color: catInfo.color }}>— {testSub}</span>}
              </h2>
            </div>
            <div className="space-y-4">
              <Field label="검사 날짜">
                <input type="date" value={form.test_date} onChange={e => setForm(f => ({ ...f, test_date: e.target.value }))} className={inputCls} />
              </Field>
              {testCat === '지능검사' && <>
                {/* 검사명 + 날짜 */}
                <div className="flex gap-3">
                  <Field label="검사명">
                    <select value={form.intel_name}
                      onChange={e => { setForm(f => ({ ...f, intel_name: e.target.value })); setIntelTab('지수'); }}
                      className={inputCls} style={{ background: '#0f172a' }}>
                      {INTEL_NAMES.map(n => <option key={n}>{n}</option>)}
                    </select>
                  </Field>
                  {form.intel_name === '기타' && (
                    <Field label="직접 입력">
                      <input value={form.test_name} onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))} className={inputCls} />
                    </Field>
                  )}
                </div>

                {/* 탭 */}
                <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: '#0f172a' }}>
                  {(['지수', '소검사', '그래프'] as const).map(t => (
                    <button key={t} onClick={() => setIntelTab(t)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${intelTab === t ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                      style={intelTab === t ? { background: '#3b82f6' } : {}}>
                      {t === '지수' ? '📊 지수점수' : t === '소검사' ? '🔢 소검사' : '📈 그래프'}
                    </button>
                  ))}
                </div>

                {/* 지수점수 탭 */}
                {intelTab === '지수' && (
                  <div>
                    <p className="text-white/40 text-xs mb-3">
                      지수점수 (표준점수, 평균=100 SD=15)
                      <span className="ml-2 text-white/20">· FSIQ 분류: 130↑최우수 / 120↑우수 / 110↑평균상 / 90↑평균 / 80↑평균하 / 70↑경계선</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(INTEL_SCORES_BY_TEST[form.intel_name] ?? INTEL_SCORES_BY_TEST['기타']).map(s => (
                        <div key={s.key}>
                          <ScoreInput k={s.key} label={s.label} scores={form.scores} setScores={handleScoreChange} />
                          {form.scores[s.key] && Number(form.scores[s.key]) > 0 && (
                            <p className="text-xs mt-0.5 pl-1" style={{ color: classifyIndex(Number(form.scores[s.key])).color }}>
                              {classifyIndex(Number(form.scores[s.key])).label}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 소검사 탭 */}
                {intelTab === '소검사' && (
                  <div className="space-y-4">
                    <p className="text-white/40 text-xs">
                      소검사 환산점수 (평균=10 SD=3)
                      <span className="ml-2 text-white/20">· 핵심(●) / 보충(○) · 분류: 16↑매우우수 / 13↑평균상 / 8↑평균 / 6↑평균하 / 4↑낮음</span>
                    </p>
                    {getSubtests(form.intel_name).map(({ domain, color, tests }) => (
                      <div key={domain} className="rounded-xl p-3 border border-white/10" style={{ background: '#0f172a' }}>
                        <p className="text-xs font-semibold mb-2" style={{ color }}>{domain}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {tests.map(t => (
                            <div key={t.key}>
                              <label className="text-white/40 text-xs block mb-0.5">
                                <span style={{ color }} className="mr-1">{t.core ? '●' : '○'}</span>
                                {t.label}
                              </label>
                              <input type="number" min="1" max="19"
                                value={form.scores[t.key] ?? ''}
                                onChange={e => handleScoreChange(t.key, e.target.value)}
                                className="w-full rounded-lg px-2 py-1.5 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400"
                                placeholder="1–19"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {getSubtests(form.intel_name).length === 0 && (
                      <p className="text-white/30 text-xs text-center py-4">이 검사의 소검사 정보가 없습니다.</p>
                    )}
                  </div>
                )}

                {/* 그래프 탭 */}
                {intelTab === '그래프' && (
                  <div className="space-y-6 py-2">
                    <IndexScoreChart scores={form.scores} intelName={form.intel_name} />
                    <div className="border-t border-white/10 pt-4">
                      <SubtestChart scores={form.scores} intelName={form.intel_name} />
                    </div>
                  </div>
                )}
              </>}
              {testCat === '성격검사' && testSub === 'MMPI' && <>
                <Field label="버전">
                  <select value={form.test_name || 'MMPI-2'} onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))} className={inputCls} style={{ background: '#0f172a' }}>
                    {['MMPI-2','MMPI-2-RF','MMPI-A'].map(n => <option key={n}>{n}</option>)}
                  </select>
                </Field>
                <div><p className="text-white/40 text-xs mb-2">타당도 척도 (T점수)</p>
                  <div className="grid grid-cols-3 gap-2">{MMPI_VALIDITY.map(k => <ScoreInput key={k} k={k} label={k} scores={form.scores} setScores={handleScoreChange} />)}</div></div>
                <div><p className="text-white/40 text-xs mb-2">임상 척도 (T점수)</p>
                  <div className="grid grid-cols-5 gap-2">{MMPI_CLINICAL.map(k => <ScoreInput key={k} k={k} label={k} scores={form.scores} setScores={handleScoreChange} />)}</div></div>
              </>}
              {testCat === '성격검사' && testSub === 'TCI' && <>
                <div><p className="text-white/40 text-xs mb-2">기질 척도 (T점수)</p>
                  <div className="grid grid-cols-2 gap-2">{TCI_TEMP.map(s => <ScoreInput key={s.key} k={s.key} label={s.label} scores={form.scores} setScores={handleScoreChange} />)}</div></div>
                <div><p className="text-white/40 text-xs mb-2">성격 척도 (T점수)</p>
                  <div className="grid grid-cols-3 gap-2">{TCI_CHAR.map(s => <ScoreInput key={s.key} k={s.key} label={s.label} scores={form.scores} setScores={handleScoreChange} />)}</div></div>
              </>}
              {testCat === '성격검사' && testSub === '기타' && <>
                <Field label="검사명 *"><input value={form.test_name} onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))} placeholder="예: NEO-PI-R" className={inputCls} /></Field>
                <div><p className="text-white/40 text-xs mb-2">척도 / 점수</p>
                  {form.extra_scales.map((s, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={s.label} onChange={e => setForm(f => { const es=[...f.extra_scales]; es[i]={...es[i],label:e.target.value}; return {...f,extra_scales:es}; })} placeholder="척도명" className={`${inputCls} flex-1`} />
                      <input type="number" value={s.value} onChange={e => setForm(f => { const es=[...f.extra_scales]; es[i]={...es[i],value:e.target.value}; return {...f,extra_scales:es}; })} placeholder="점수" className={`${inputCls} w-20`} />
                      {i===form.extra_scales.length-1 && <button onClick={() => setForm(f=>({...f,extra_scales:[...f.extra_scales,{label:'',value:''}]}))} className="px-2 rounded-lg text-white/60 border border-white/10 hover:bg-white/5 text-sm">+</button>}
                    </div>
                  ))}
                </div>
              </>}
              {testCat === '투사검사' && testSub === 'SCT' && (
                <SCTForm
                  rawData={form.sct_responses}
                  onChange={raw => setForm(f => ({ ...f, sct_responses: raw }))}
                />
              )}
              {testCat === '투사검사' && testSub === '로르샤하' && <RorschachCoding onDataChange={handleRorschachDataChange} initialRawData={form.raw_data} />}
              {testCat === '투사검사' && testSub === 'HTP' && <>
                <Field label="🏠 집(House)"><textarea rows={2} value={form.htp_house}   onChange={e=>setForm(f=>({...f,htp_house:e.target.value}))}   className={`${inputCls} resize-none`} /></Field>
                <Field label="🌳 나무(Tree)"><textarea rows={2} value={form.htp_tree}   onChange={e=>setForm(f=>({...f,htp_tree:e.target.value}))}   className={`${inputCls} resize-none`} /></Field>
                <Field label="🧍 사람(Person)"><textarea rows={2} value={form.htp_person} onChange={e=>setForm(f=>({...f,htp_person:e.target.value}))} className={`${inputCls} resize-none`} /></Field>
              </>}
              {testCat === '투사검사' && testSub === '기타' && <>
                <Field label="검사명 *"><input value={form.test_name} onChange={e=>setForm(f=>({...f,test_name:e.target.value}))} placeholder="예: KFD, BGT" className={inputCls} /></Field>
                <Field label="관찰 및 결과"><textarea rows={3} value={form.raw_data} onChange={e=>setForm(f=>({...f,raw_data:e.target.value}))} className={`${inputCls} resize-none`} /></Field>
              </>}
              {testCat === '신경심리검사' && <>
                <Field label="검사명">
                  <select value={form.neuro_name} onChange={e=>setForm(f=>({...f,neuro_name:e.target.value}))} className={inputCls} style={{ background: '#0f172a' }}>
                    {NEURO_NAMES.map(n=><option key={n}>{n}</option>)}
                  </select>
                </Field>
                {form.neuro_name === '기타' && <Field label="직접 입력"><input value={form.test_name} onChange={e=>setForm(f=>({...f,test_name:e.target.value}))} className={inputCls} /></Field>}
                <div className="grid grid-cols-3 gap-3">
                  <Field label="원점수"><input type="number" value={form.neuro_raw} onChange={e=>setForm(f=>({...f,neuro_raw:e.target.value}))} className={inputCls} /></Field>
                  <Field label="표준점수/T"><input type="number" value={form.neuro_std} onChange={e=>setForm(f=>({...f,neuro_std:e.target.value}))} className={inputCls} /></Field>
                  <Field label="백분위(%)"><input type="number" value={form.neuro_pct} onChange={e=>setForm(f=>({...f,neuro_pct:e.target.value}))} className={inputCls} /></Field>
                </div>
              </>}
              {testCat === '기타검사' && <>
                <Field label="검사명 *"><input value={form.other_name} onChange={e=>setForm(f=>({...f,other_name:e.target.value}))} placeholder="예: BDI-II, BAI, PCL-5" className={inputCls} /></Field>
                <Field label="점수 / 결과"><textarea rows={2} value={form.other_result} onChange={e=>setForm(f=>({...f,other_result:e.target.value}))} className={`${inputCls} resize-none`} /></Field>
              </>}
              <Field label="해석 및 소견">
                <textarea rows={3} value={form.interpretation} onChange={e=>setForm(f=>({...f,interpretation:e.target.value}))} placeholder="검사 결과에 대한 임상적 해석" className={`${inputCls} resize-none`} />
              </Field>
              {error && <p className="text-red-400 text-xs">{error}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={closeTestModal} className="flex-1 py-2 rounded-lg text-white/60 text-sm border border-white/10 hover:bg-white/5">취소</button>
              <button onClick={saveTest} disabled={saving} className="flex-1 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {saving ? '처리 중...' : editingTestId ? '수정 완료' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 보조 컴포넌트 ─────────────────────────────────────────────

function SessionCard({ session: s, onEdit, onDelete }: { session: Session; onEdit: () => void; onDelete: () => void }) {
  const soapO = s.soap_o || s.observations    || '';
  const soapA = s.soap_a || s.counselor_notes || '';
  const soapP = s.soap_p || s.homework        || '';
  const hasSOAP = s.soap_s || soapO || soapA || soapP;
  return (
    <div className="rounded-xl border border-white/10 group overflow-hidden" style={{ background: '#1e293b' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>{s.session_num}</span>
          <span className="text-white font-semibold text-sm">{s.session_date}</span>
          {s.session_type && <span className="px-2 py-0.5 rounded-full text-xs border border-white/10 text-white/40">{s.session_type}</span>}
          {s.duration > 0 && <span className="text-white/25 text-xs">{s.duration}분</span>}
          {(s.mood_before != null || s.mood_after != null) && (
            <span className="flex items-center gap-1 text-xs">
              <span className="text-white/40">{s.mood_before ?? '?'}</span>
              <span className="text-white/20">→</span>
              <span className={(s.mood_after ?? 0) > (s.mood_before ?? 0) ? 'text-green-400' : 'text-red-400'} style={{ fontWeight: 600 }}>{s.mood_after ?? '?'}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionBtn onClick={onEdit} title="수정" icon="✏️" />
          <ActionBtn onClick={onDelete} title="삭제" icon="🗑️" danger />
        </div>
      </div>

      {/* 본문: 좌(노트) + 우(SOAP) */}
      <div className="flex">
        {/* 자유 노트 */}
        {s.session_notes && (
          <div className="flex-1 px-5 py-3 border-r border-white/5 min-w-0">
            <p className="text-white/30 text-xs mb-1">📋 상담 노트</p>
            <p className="text-white/60 text-xs leading-relaxed line-clamp-4 whitespace-pre-wrap">{s.session_notes}</p>
          </div>
        )}
        {/* SOAP */}
        {hasSOAP && (
          <div className={`px-5 py-3 space-y-1 ${s.session_notes ? 'w-80 shrink-0' : 'flex-1'}`}>
            {s.soap_s && <SoapLine label="S" color="#3b82f6" text={s.soap_s} />}
            {soapO    && <SoapLine label="O" color="#22c55e" text={soapO}    />}
            {soapA    && <SoapLine label="A" color="#f59e0b" text={soapA}    />}
            {soapP    && <SoapLine label="P" color="#8b5cf6" text={soapP}    />}
          </div>
        )}
        {/* 아무것도 없을 때 */}
        {!s.session_notes && !hasSOAP && (
          <div className="px-5 py-3 text-white/20 text-xs">(기록 없음)</div>
        )}
      </div>
    </div>
  );
}

function SoapLine({ label, color, text }: { label: string; color: string; text: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs font-bold shrink-0 mt-0.5 w-4" style={{ color }}>{label}</span>
      <p className="text-white/60 text-xs leading-relaxed line-clamp-2 flex-1">{text}</p>
    </div>
  );
}

function TestCard({ test, color, onEdit, onDelete }: { test: TestResult; color: string; onEdit: () => void; onDelete: () => void }) {
  let htpData: Record<string, string> | null = null;
  if (test.sub_type === 'HTP' && test.raw_data) { try { htpData = JSON.parse(test.raw_data); } catch { /**/ } }

  const isIntel = test.category === '지능검사';
  const [showChart, setShowChart] = useState(false);

  // 지능검사: 지수점수와 소검사 분리 표시
  const intelIndexKeys = ['FSIQ','VCI','PRI','VSI','FRI','WMI','PSI','MPI','FCI','NVI','KI'];
  const indexScores   = isIntel ? Object.entries(test.scores).filter(([k]) =>  intelIndexKeys.includes(k)) : [];
  const subtestScores = isIntel ? Object.entries(test.scores).filter(([k]) => !intelIndexKeys.includes(k)) : [];

  return (
    <div className="rounded-xl border border-white/10 group overflow-hidden" style={{ background: '#1e293b' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-semibold text-sm">{test.test_name}</span>
          {test.sub_type && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: color+'20', color }}>{test.sub_type}</span>}
          <span className="text-white/40 text-xs">{test.test_date}</span>
        </div>
        <div className="flex items-center gap-2">
          {isIntel && Object.keys(test.scores).length > 0 && (
            <button onClick={() => setShowChart(c => !c)}
              className="px-2 py-1 rounded-lg text-xs border border-white/10 text-white/40 hover:text-indigo-400 hover:border-indigo-400/30 transition-colors">
              {showChart ? '점수표' : '📈 그래프'}
            </button>
          )}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ActionBtn onClick={onEdit} title="수정" icon="✏️" />
            <ActionBtn onClick={onDelete} title="삭제" icon="🗑️" danger />
          </div>
        </div>
      </div>

      <div className="px-5 py-3">
        {/* 지능검사: 그래프 모드 */}
        {isIntel && showChart && (
          <div className="space-y-4">
            <IndexScoreChart scores={Object.fromEntries(Object.entries(test.scores).map(([k,v]) => [k, String(v)]))} intelName={test.test_name} />
            {subtestScores.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <SubtestChart scores={Object.fromEntries(Object.entries(test.scores).map(([k,v]) => [k, String(v)]))} intelName={test.test_name} />
              </div>
            )}
          </div>
        )}

        {/* 지능검사: 점수표 모드 */}
        {isIntel && !showChart && (
          <div className="space-y-2">
            {indexScores.length > 0 && (
              <div>
                <p className="text-white/30 text-xs mb-1.5">지수점수</p>
                <div className="flex flex-wrap gap-2">
                  {indexScores.map(([k, v]) => {
                    const { label, color: clr } = classifyIndex(Number(v));
                    return (
                      <div key={k} className="flex flex-col items-center px-3 py-2 rounded-lg border border-white/10 min-w-[68px]" style={{ background: '#0f172a' }}>
                        <span className="text-white/40 text-xs">{k}</span>
                        <span className="text-white font-bold text-lg leading-tight">{v}</span>
                        <span className="text-xs mt-0.5" style={{ color: clr }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {subtestScores.length > 0 && (
              <div>
                <p className="text-white/30 text-xs mb-1.5 mt-2">소검사 환산점수</p>
                <div className="flex flex-wrap gap-1.5">
                  {subtestScores.map(([k, v]) => (
                    <span key={k} className="px-2 py-0.5 rounded text-xs border border-white/10 text-white/60">
                      {k}: <span className="text-white font-medium">{v}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 비지능검사 */}
        {!isIntel && Object.keys(test.scores || {}).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {Object.entries(test.scores).slice(0, 20).map(([k, v]) => (
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
        {!htpData && test.raw_data && test.sub_type !== '로르샤하' && test.sub_type !== 'SCT' && (
          <p className="text-white/60 text-xs mb-2 line-clamp-3">{test.raw_data}</p>
        )}
        {test.sub_type === 'SCT' && test.raw_data && (() => {
          try {
            const resp: Record<string, string> = JSON.parse(test.raw_data);
            const filled = Object.entries(resp).filter(([, v]) => v?.trim());
            return (
              <div className="mb-2">
                <p className="text-white/30 text-xs mb-1">작성 {filled.length}문항 / 50</p>
                <div className="space-y-0.5">
                  {filled.slice(0, 4).map(([num, val]) => (
                    <p key={num} className="text-white/50 text-xs line-clamp-1">
                      <span className="text-white/25 font-mono mr-1">{num}.</span>{val}
                    </p>
                  ))}
                  {filled.length > 4 && <p className="text-white/20 text-xs">…외 {filled.length - 4}문항</p>}
                </div>
              </div>
            );
          } catch { return <p className="text-white/60 text-xs mb-2 line-clamp-3">{test.raw_data}</p>; }
        })()}
        {test.interpretation && <p className="text-white/70 text-sm leading-relaxed mt-2">{test.interpretation}</p>}
      </div>
    </div>
  );
}

function ActionBtn({ onClick, title, icon, danger }: { onClick: () => void; title: string; icon: string; danger?: boolean }) {
  return (
    <button onClick={onClick} title={title}
      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors border border-white/10
        ${danger ? 'text-white/40 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10' : 'text-white/40 hover:text-indigo-400 hover:border-indigo-400/30 hover:bg-indigo-400/10'}`}>
      {icon}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

const inputCls = 'w-full rounded-lg px-3 py-2 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400';
const labelCls = 'text-white/50 text-xs block mb-1';

function ScoreInput({ k, label, scores, setScores }: { k: string; label: string; scores: Record<string, string>; setScores: (k: string, v: string) => void }) {
  return (
    <div>
      <label className="text-white/40 text-xs block mb-0.5">{label}</label>
      <input type="number" value={scores[k] ?? ''} onChange={e => setScores(k, e.target.value)}
        className="w-full rounded-lg px-2 py-1.5 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-indigo-400" />
    </div>
  );
}
