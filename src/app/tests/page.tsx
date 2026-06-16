"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";

type Section = "selector" | "questions" | "results";

interface TestOption { val: number; label: string; }
interface Cutoff { min: number; max: number; label: string; color: string; bg: string; interpret: string; next: string; }
interface TestData { abbr: string; name: string; subtitle: string; maxScore: number; questions: string[]; options: TestOption[]; cutoffs: Cutoff[]; }

const TESTS: Record<string, TestData> = {
  phq9: {
    abbr: "PHQ-9",
    name: "우울 선별 검사 (PHQ-9)",
    subtitle: "Patient Health Questionnaire-9 | 한국어판 타당화 (최재윤 등, 2007)",
    maxScore: 27,
    questions: [
      "일을 하는 것에 대한 흥미나 즐거움이 거의 없음",
      "기분이 가라앉거나, 우울하거나, 희망이 없음",
      "잠들기가 어렵거나 자꾸 깨어남, 또는 너무 많이 잠",
      "피로감을 느끼거나 기력이 거의 없음",
      "식욕이 저하되거나 과식을 함",
      "자신이 나쁜 사람이라고 생각하거나, 자신을 실망시키거나, 또는 자신을 실패자라고 느끼거나 가족을 실망시켰다고 느낌",
      "신문을 읽거나 TV를 보는 것과 같은 일에 집중하기가 어려움",
      "다른 사람들이 알아챌 만큼 움직임이나 말이 느려졌거나, 반대로 너무 안절부절못하거나 들뜬 상태로 평소보다 많이 움직임",
      "차라리 죽는 것이 낫겠다는 생각 또는 자신을 어떻게 해치고 싶다는 생각",
    ],
    options: [
      { val: 0, label: "전혀\n없었다" },
      { val: 1, label: "며칠\n동안" },
      { val: 2, label: "7일\n이상" },
      { val: 3, label: "거의\n매일" },
    ],
    cutoffs: [
      { min: 0, max: 4, label: "정상", color: "#22c55e", bg: "#f0fdf4", interpret: "현재 우울 증상이 최소한의 수준입니다. 일상적인 심리적 건강 관리를 지속하시기 바랍니다.", next: "정기적인 자기 점검을 통해 심리적 건강을 유지하세요. 스트레스 관리와 규칙적인 생활습관이 도움이 됩니다." },
      { min: 5, max: 9, label: "가벼운 우울", color: "#84cc16", bg: "#f7fee7", interpret: "가벼운 수준의 우울 증상이 나타납니다. 일상 기능에는 큰 지장이 없을 수 있으나, 증상이 지속되는 경우 전문가 상담을 고려해 보세요.", next: "일상적인 자기 돌봄(규칙적 수면, 운동, 사회적 연결)을 강화하고, 증상이 2주 이상 지속되면 전문가와 상담하세요." },
      { min: 10, max: 14, label: "중등도 우울", color: "#f59e0b", bg: "#fffbeb", interpret: "중등도 수준의 우울 증상이 있습니다. 일상 기능에 어느 정도 어려움이 생길 수 있으며, 전문적인 평가와 지원을 받는 것을 권장합니다.", next: "전문 심리상담사 또는 정신건강의학과 의사와의 상담을 강력히 권장합니다. 인지행동치료(CBT) 등의 심리치료가 효과적일 수 있습니다." },
      { min: 15, max: 19, label: "중등고도 우울", color: "#f97316", bg: "#fff7ed", interpret: "심한 수준의 우울 증상이 나타납니다. 일상 기능에 상당한 지장이 있을 수 있으며, 가능한 빠른 시일 내 전문적인 도움을 받으시기 바랍니다.", next: "즉시 전문 정신건강 서비스를 이용하세요. 심리치료와 필요에 따라 약물 치료를 병행하는 것이 도움이 될 수 있습니다." },
      { min: 20, max: 27, label: "고도 우울", color: "#ef4444", bg: "#fff1f2", interpret: "매우 심한 수준의 우울 증상이 있습니다. 즉각적인 전문적 평가 및 치료가 필요합니다.", next: "지금 즉시 정신건강의학과 또는 심리상담 전문기관을 방문하시기 바랍니다. 혼자 해결하려 하지 마시고 전문가의 도움을 받으세요." },
    ],
  },
  gad7: {
    abbr: "GAD-7",
    name: "불안 선별 검사 (GAD-7)",
    subtitle: "Generalized Anxiety Disorder-7 | 한국어판 타당화 (박원명 등, 2010)",
    maxScore: 21,
    questions: [
      "불안하거나 조마조마하거나 두렵다는 느낌이 듦",
      "걱정을 멈추거나 조절할 수 없음",
      "여러 가지 것들에 대해 지나치게 걱정함",
      "긴장을 풀기가 어려움",
      "너무 안절부절못해서 가만히 앉아 있기 어려움",
      "쉽게 짜증이 나거나 과민한 상태가 됨",
      "무언가 끔찍한 일이 일어날 것 같아 두려움",
    ],
    options: [
      { val: 0, label: "전혀\n없었다" },
      { val: 1, label: "며칠\n동안" },
      { val: 2, label: "7일\n이상" },
      { val: 3, label: "거의\n매일" },
    ],
    cutoffs: [
      { min: 0, max: 4, label: "최소 불안", color: "#22c55e", bg: "#f0fdf4", interpret: "불안 증상이 최소한의 수준입니다. 현재 일상적인 심리적 건강 상태를 유지하고 계십니다.", next: "건강한 생활습관(규칙적 운동, 충분한 수면, 이완 기법)을 통해 현재의 심리적 건강 상태를 유지하세요." },
      { min: 5, max: 9, label: "가벼운 불안", color: "#84cc16", bg: "#f7fee7", interpret: "가벼운 수준의 불안 증상이 나타납니다. 일상적 기능에는 큰 지장이 없을 수 있으나, 증상이 지속되면 전문가 상담을 고려하세요.", next: "마음챙김 명상, 심호흡 훈련 등의 이완 기법을 연습하고, 증상이 지속되면 전문가와 상담하세요." },
      { min: 10, max: 14, label: "중등도 불안", color: "#f59e0b", bg: "#fffbeb", interpret: "중등도 수준의 불안 증상이 있습니다. 일상 기능에 어느 정도 어려움이 있을 수 있으며, 전문적인 평가와 지원을 권장합니다.", next: "전문 심리상담사와의 상담을 강력히 권장합니다. 인지행동치료(CBT), 수용전념치료(ACT) 등이 불안 관리에 효과적입니다." },
      { min: 15, max: 21, label: "심한 불안", color: "#ef4444", bg: "#fff1f2", interpret: "심한 수준의 불안 증상이 있습니다. 일상 기능에 상당한 지장이 생길 수 있으며, 즉각적인 전문적 도움을 받으시기 바랍니다.", next: "즉시 정신건강 전문가(정신건강의학과 의사, 임상심리사)를 만나세요. 심리치료와 필요에 따른 약물 치료를 통해 증상을 효과적으로 관리할 수 있습니다." },
    ],
  },
};

export default function TestsPage() {
  const [section, setSection] = useState<Section>("selector");
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const startTest = useCallback((testKey: string) => {
    setCurrentTest(testKey);
    setAnswers({});
    setSection("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAnswer = useCallback((idx: number, val: number) => {
    setAnswers((prev) => ({ ...prev, [idx]: val }));
  }, []);

  const showResults = useCallback(() => {
    setSection("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToSelector = useCallback(() => {
    setSection("selector");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goBack = useCallback(() => {
    setSection("selector");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const test = currentTest ? TESTS[currentTest] : null;
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const level = test ? test.cutoffs.find((c) => totalScore >= c.min && totalScore <= c.max) : null;
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = test ? test.questions.length : 0;
  const allAnswered = answeredCount === totalQuestions && totalQuestions > 0;
  const hasCrisis = currentTest === "phq9" && answers[8] >= 1;

  const circumference = 314;
  const pct = test ? totalScore / test.maxScore : 0;
  const strokeDashoffset = circumference - circumference * pct;

  return (
    <>
      <ScrollReveal />
      <Navbar />
      <main>
        <style>{`
          .page-hero { background:linear-gradient(140deg,#0a1830 0%,#132347 45%,#1c3460 100%); padding:110px 5% 70px; text-align:center; position:relative; overflow:hidden; }
          .page-hero::before { content:''; position:absolute; inset:0; background-image:linear-gradient(rgba(78,157,224,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(78,157,224,.04) 1px,transparent 1px); background-size:60px 60px; pointer-events:none; }
          .page-hero-tag { display:inline-block; background:rgba(78,157,224,.15); border:1px solid rgba(78,157,224,.35); color:var(--bs-accent); font-size:.78rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; padding:.38rem 1.1rem; border-radius:100px; margin-bottom:1.2rem; }
          .page-hero h1 { font-size:clamp(1.9rem,4vw,2.9rem); color:#fff; font-weight:800; line-height:1.3; margin-bottom:.9rem; }
          .page-hero p { color:rgba(255,255,255,.72); font-size:1.05rem; max-width:560px; margin:0 auto; }
          #selectorSection { padding:72px 5%; }
          .selector-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.8rem; max-width:820px; margin:0 auto; }
          .selector-card { background:var(--bs-white); border-radius:20px; border:2px solid var(--bs-border); padding:2.4rem 2.2rem; cursor:pointer; transition:all .3s; display:flex; flex-direction:column; gap:1.2rem; }
          .selector-card:hover { border-color:var(--bs-accent); transform:translateY(-4px); box-shadow:0 16px 40px rgba(78,157,224,.2); }
          .selector-badge { display:inline-flex; align-items:center; justify-content:center; width:68px; height:68px; border-radius:16px; font-size:1.2rem; font-weight:800; color:#fff; background:linear-gradient(140deg,var(--bs-navy),var(--bs-blue)); box-shadow:0 6px 18px rgba(26,47,94,.28); }
          .selector-card h3 { color:var(--bs-navy); font-size:1.15rem; font-weight:800; line-height:1.35; }
          .selector-card p { color:var(--bs-muted); font-size:.9rem; line-height:1.75; flex:1; }
          .selector-meta { display:flex; flex-wrap:wrap; gap:.5rem; }
          .meta-tag { background:var(--bs-light-blue); color:var(--bs-blue); font-size:.72rem; font-weight:700; padding:.25rem .85rem; border-radius:100px; }
          .start-btn { display:inline-flex; align-items:center; justify-content:center; gap:.45rem; background:var(--bs-navy); color:#fff; padding:.7rem 1.5rem; border-radius:9px; font-size:.9rem; font-weight:700; border:none; cursor:pointer; transition:background .2s,transform .15s; margin-top:.5rem; font-family:inherit; }
          .start-btn:hover { background:var(--bs-blue); transform:translateY(-1px); }
          @media(max-width:640px) { .selector-grid{grid-template-columns:1fr;} }
          .test-container { max-width:760px; margin:0 auto; padding:72px 5% 60px; }
          .test-header { margin-bottom:2.5rem; }
          .back-btn { display:inline-flex; align-items:center; gap:.5rem; color:var(--bs-blue); font-size:.88rem; font-weight:600; background:none; border:none; cursor:pointer; padding:0; font-family:inherit; margin-bottom:1.5rem; transition:gap .2s; }
          .back-btn:hover { gap:.8rem; }
          .test-title-row { display:flex; align-items:center; gap:1rem; margin-bottom:.7rem; }
          .test-abbr-badge { background:linear-gradient(140deg,var(--bs-navy),var(--bs-blue)); color:#fff; font-size:.95rem; font-weight:800; padding:.45rem 1rem; border-radius:10px; box-shadow:0 4px 14px rgba(26,47,94,.22); }
          .test-header h2 { color:var(--bs-navy); font-size:1.55rem; font-weight:800; }
          .test-header p { color:var(--bs-muted); font-size:.95rem; margin-top:.5rem; }
          .progress-wrap { margin-bottom:2.5rem; }
          .progress-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:.55rem; }
          .progress-label { font-size:.83rem; font-weight:600; color:var(--bs-blue); }
          .progress-count { font-size:.83rem; color:var(--bs-muted); }
          .progress-bar { height:8px; background:var(--bs-border); border-radius:100px; overflow:hidden; }
          .progress-fill { height:100%; background:linear-gradient(90deg,var(--bs-blue),var(--bs-accent)); border-radius:100px; transition:width .4s cubic-bezier(.22,1,.36,1); }
          .question-instruction { background:var(--bs-light-blue); border-radius:14px; padding:1.2rem 1.6rem; margin-bottom:2rem; font-size:.93rem; color:var(--bs-navy); border-left:4px solid var(--bs-accent); }
          .question-instruction strong { display:block; margin-bottom:.3rem; font-weight:700; }
          .question-card { background:var(--bs-white); border-radius:16px; border:1.5px solid var(--bs-border); padding:1.8rem 2rem; margin-bottom:1.2rem; transition:border-color .2s, box-shadow .2s; }
          .question-card.answered { border-color:var(--bs-accent); box-shadow:0 4px 16px rgba(78,157,224,.12); }
          .question-card.warning-card { background:#fff5f5; border-color:#fca5a5; }
          .question-num { font-size:.78rem; font-weight:700; color:var(--bs-accent); letter-spacing:1px; text-transform:uppercase; margin-bottom:.6rem; }
          .question-text { font-size:1rem; font-weight:600; color:var(--bs-navy); margin-bottom:1.3rem; line-height:1.6; }
          .options-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:.7rem; }
          .option-label { display:flex; flex-direction:column; align-items:center; gap:.45rem; cursor:pointer; }
          .option-label input[type=radio] { display:none; }
          .option-box { width:100%; padding:.65rem .3rem; border-radius:10px; border:1.5px solid var(--bs-border); display:flex; flex-direction:column; align-items:center; gap:.35rem; transition:all .2s; background:var(--bs-bg); text-align:center; }
          .option-box .opt-num { font-size:1.1rem; font-weight:800; color:var(--bs-muted); transition:color .2s; }
          .option-box .opt-text { font-size:.72rem; font-weight:500; color:var(--bs-muted); line-height:1.4; transition:color .2s; }
          .option-label input[type=radio]:checked + .option-box { border-color:var(--bs-accent); background:var(--bs-light-blue); }
          .option-label input[type=radio]:checked + .option-box .opt-num { color:var(--bs-blue); }
          .option-label input[type=radio]:checked + .option-box .opt-text { color:var(--bs-blue); }
          .option-box:hover { border-color:var(--bs-accent); background:var(--bs-light-blue); }
          .warning-note { background:#fee2e2; border-radius:8px; padding:.7rem 1rem; margin-top:1rem; font-size:.82rem; color:#dc2626; font-weight:600; }
          .submit-wrap { text-align:center; margin-top:2.5rem; padding-top:2rem; border-top:1px solid var(--bs-border); }
          .submit-wrap p { font-size:.88rem; color:var(--bs-muted); margin-bottom:1.2rem; }
          .submit-test-btn { background:var(--bs-navy); color:#fff; border:none; padding:1rem 3rem; border-radius:12px; font-size:1rem; font-weight:700; cursor:pointer; transition:background .2s,transform .15s,opacity .2s; font-family:inherit; }
          .submit-test-btn:disabled { opacity:.4; cursor:not-allowed; }
          .submit-test-btn:not(:disabled):hover { background:var(--bs-blue); transform:translateY(-2px); }
          @media(max-width:560px) { .options-grid { grid-template-columns:repeat(2,1fr); } .question-card { padding:1.4rem 1.2rem; } }
          .results-container { max-width:680px; margin:0 auto; text-align:center; padding:72px 5% 80px; }
          .results-title { font-size:clamp(1.5rem,3vw,2.2rem); color:var(--bs-navy); font-weight:800; margin-bottom:.7rem; }
          .results-test-name { font-size:.95rem; color:var(--bs-muted); margin-bottom:2.5rem; }
          .score-gauge { position:relative; width:220px; height:220px; margin:0 auto 2rem; }
          .gauge-svg { width:100%; height:100%; transform:rotate(-90deg); }
          .gauge-bg { fill:none; stroke:var(--bs-border); strokeWidth:14; }
          .gauge-fill { fill:none; strokeWidth:14; strokeLinecap:round; transition:stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1); }
          .gauge-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
          .gauge-score { font-size:2.8rem; font-weight:800; color:var(--bs-navy); line-height:1; }
          .gauge-max { font-size:.85rem; color:var(--bs-muted); margin-top:.2rem; }
          .severity-badge { display:inline-flex; align-items:center; gap:.5rem; padding:.6rem 1.8rem; border-radius:100px; font-size:1.05rem; font-weight:700; margin-bottom:1.5rem; }
          .severity-dot { width:10px; height:10px; border-radius:50%; background:currentColor; opacity:.8; }
          .result-card { background:var(--bs-white); border-radius:20px; border:1.5px solid var(--bs-border); padding:2rem 2.2rem; text-align:left; margin-bottom:1.4rem; }
          .result-card h3 { color:var(--bs-navy); font-size:1.05rem; font-weight:700; margin-bottom:.8rem; display:flex; align-items:center; gap:.6rem; }
          .result-card h3 span { font-size:1.2rem; }
          .result-card p { color:var(--bs-muted); font-size:.93rem; line-height:1.85; }
          .cutoff-table { width:100%; border-collapse:collapse; margin-top:1rem; font-size:.87rem; }
          .cutoff-table th { background:var(--bs-light-blue); color:var(--bs-navy); font-weight:700; padding:.6rem 1rem; text-align:left; }
          .cutoff-table td { padding:.55rem 1rem; border-bottom:1px solid var(--bs-border); color:var(--bs-text); }
          .cutoff-table tr.current-row td { background:#f0f9ff; font-weight:700; color:var(--bs-navy); }
          .cutoff-dot { display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:.5rem; vertical-align:middle; }
          .crisis-alert { background:#fff1f0; border:2px solid #fca5a5; border-radius:14px; padding:1.4rem 1.8rem; margin-bottom:1.4rem; text-align:left; }
          .crisis-alert h3 { color:#dc2626; font-size:1rem; font-weight:700; margin-bottom:.6rem; }
          .crisis-alert p { color:#7f1d1d; font-size:.9rem; line-height:1.8; }
          .result-actions { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-top:2rem; }
          .retry-btn { background:var(--bs-light-blue); color:var(--bs-blue); border:none; padding:.85rem 2rem; border-radius:10px; font-size:.95rem; font-weight:700; cursor:pointer; transition:background .2s; font-family:inherit; }
          .retry-btn:hover { background:#d4e9fa; }
          .contact-btn { background:var(--bs-navy); color:#fff; border:none; padding:.85rem 2rem; border-radius:10px; font-size:.95rem; font-weight:700; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; gap:.4rem; transition:background .2s; font-family:inherit; }
          .contact-btn:hover { background:var(--bs-blue); }
          .disclaimer { background:var(--bs-light-blue); border-radius:12px; padding:1.2rem 1.6rem; font-size:.82rem; color:var(--bs-muted); line-height:1.8; text-align:left; margin-top:2rem; }
          .disclaimer strong { color:var(--bs-navy); }
        `}</style>

        <div className="page-hero">
          <div className="page-hero-tag">Assessment</div>
          <h1>표준화 심리검사</h1>
          <p>한국어로 타당화된 국제 공인 심리검사를 통해<br />현재 마음 상태를 정확하게 파악해 보세요.</p>
        </div>

        {section === "selector" && (
          <section id="selectorSection">
            <div className="selector-grid">
              <div className="selector-card" onClick={() => startTest("phq9")}>
                <div className="selector-badge">PHQ-9</div>
                <div>
                  <h3>우울 선별 검사<br />(PHQ-9)</h3>
                  <p>Patient Health Questionnaire-9는 전 세계적으로 가장 널리 사용되는 우울증 선별 도구입니다. 한국에서는 최재윤 등(2007)에 의해 타당화되었으며, 지난 2주간의 우울 증상을 9개 문항으로 평가합니다. 민감도 88%, 특이도 88%의 높은 정확도를 자랑합니다.</p>
                </div>
                <div className="selector-meta">
                  <span className="meta-tag">우울 측정</span>
                  <span className="meta-tag">9문항</span>
                  <span className="meta-tag">약 3분</span>
                  <span className="meta-tag">한국어 타당화</span>
                </div>
                <button className="start-btn">검사 시작하기 →</button>
              </div>
              <div className="selector-card" onClick={() => startTest("gad7")}>
                <div className="selector-badge">GAD-7</div>
                <div>
                  <h3>불안 선별 검사<br />(GAD-7)</h3>
                  <p>Generalized Anxiety Disorder-7은 범불안장애를 비롯한 다양한 불안 증상을 평가하는 표준화 도구입니다. 한국에서는 박원명 등(2010)에 의해 타당화되었으며, 지난 2주간의 불안 증상을 7개 문항으로 평가합니다. 임상적 컷오프(10점) 기준 민감도 89%, 특이도 82%를 보입니다.</p>
                </div>
                <div className="selector-meta">
                  <span className="meta-tag">불안 측정</span>
                  <span className="meta-tag">7문항</span>
                  <span className="meta-tag">약 2분</span>
                  <span className="meta-tag">한국어 타당화</span>
                </div>
                <button className="start-btn">검사 시작하기 →</button>
              </div>
            </div>
            <div className="disclaimer" style={{maxWidth:'820px',margin:'2rem auto 0'}}>
              <strong>안내 사항:</strong> 본 검사는 전문 임상 진단을 대체할 수 없으며, 심리적 증상 유무를 선별하는 참고 도구입니다. 검사 결과와 무관하게 전문적인 도움이 필요하다고 느끼신다면 즉시 전문가에게 상담을 받으시기 바랍니다.
            </div>
          </section>
        )}

        {section === "questions" && test && (
          <div className="test-container">
            <div className="test-header">
              <button className="back-btn" onClick={goBack}>← 검사 선택으로 돌아가기</button>
              <div className="test-title-row">
                <div className="test-abbr-badge">{test.abbr}</div>
                <h2>{test.name}</h2>
              </div>
              <p>{test.subtitle}</p>
            </div>
            <div className="progress-wrap">
              <div className="progress-top">
                <span className="progress-label">진행률</span>
                <span className="progress-count">{answeredCount} / {totalQuestions}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%`}}></div>
              </div>
            </div>
            <div className="question-instruction">
              <strong>지시문</strong>
              지난 <strong>2주 동안</strong>, 다음의 증상들로 인해서 얼마나 자주 방해를 받으셨습니까? 각 문항에 대해 해당되는 응답을 하나 선택해 주세요.
            </div>
            {test.questions.map((q, i) => {
              const isLast = currentTest === "phq9" && i === 8;
              return (
                <div key={i} className={`question-card${answers[i] !== undefined ? " answered" : ""}${isLast ? " warning-card" : ""}`}>
                  <div className="question-num">문항 {i + 1}</div>
                  <div className="question-text">{q}</div>
                  <div className="options-grid">
                    {test.options.map((opt) => (
                      <label key={opt.val} className="option-label">
                        <input
                          type="radio"
                          name={`q${i}`}
                          value={opt.val}
                          checked={answers[i] === opt.val}
                          onChange={() => handleAnswer(i, opt.val)}
                        />
                        <div className="option-box">
                          <span className="opt-num">{opt.val}</span>
                          <span className="opt-text">{opt.label.split("\n").map((t, idx) => <span key={idx}>{t}{idx === 0 && <br />}</span>)}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {isLast && <div className="warning-note">⚠️ 이 문항에 1점 이상 응답하신 경우 전문가와 즉시 상담하시기 바랍니다.</div>}
                </div>
              );
            })}
            <div className="submit-wrap">
              <p>{allAnswered ? "모든 문항에 응답하셨습니다. 결과를 확인하세요." : "모든 문항에 응답하시면 결과를 확인할 수 있습니다."}</p>
              <button className="submit-test-btn" disabled={!allAnswered} onClick={showResults}>결과 보기 →</button>
            </div>
          </div>
        )}

        {section === "results" && test && level && (
          <div className="results-container">
            <button className="back-btn" onClick={goToSelector} style={{marginBottom:'1.5rem'}}>← 다른 검사 보기</button>
            <p className="results-test-name">{test.name}</p>
            <h2 className="results-title">검사가 완료되었습니다</h2>
            <p className="results-test-name" style={{marginBottom:'2rem'}}>결과는 아래에서 확인하세요</p>
            <div className="score-gauge">
              <svg className="gauge-svg" viewBox="0 0 120 120">
                <circle className="gauge-bg" cx="60" cy="60" r="50" fill="none" stroke="var(--bs-border)" strokeWidth="14"/>
                <circle className="gauge-fill" cx="60" cy="60" r="50" fill="none" strokeWidth="14" strokeLinecap="round"
                  stroke={level.color}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="gauge-center">
                <div className="gauge-score">{totalScore}</div>
                <div className="gauge-max">/ {test.maxScore}점</div>
              </div>
            </div>
            <div className="severity-badge" style={{background: level.bg, color: level.color}}>
              <span className="severity-dot"></span>
              <span>{level.label}</span>
            </div>
            {hasCrisis && (
              <div className="crisis-alert">
                <h3>⚠️ 즉각적인 전문 도움이 필요합니다</h3>
                <p>자해 또는 자살에 관한 생각이 있다고 응답하셨습니다. 즉시 전문가의 도움을 받으시기 바랍니다.<br /><br /><strong>자살예방상담전화: 1393</strong> (24시간)<br /><strong>정신건강위기상담전화: 1577-0199</strong> (24시간)<br /><strong>생명의전화: 1588-9191</strong> (24시간)</p>
              </div>
            )}
            <div className="result-card">
              <h3><span>📋</span> 결과 해석</h3>
              <p>{level.interpret}</p>
            </div>
            <div className="result-card">
              <h3><span>📊</span> 점수 범위 기준표</h3>
              <table className="cutoff-table">
                <thead><tr><th>점수 범위</th><th>해석</th><th>권고 사항</th></tr></thead>
                <tbody>
                  {test.cutoffs.map((c) => {
                    const isCur = totalScore >= c.min && totalScore <= c.max;
                    return (
                      <tr key={c.label} className={isCur ? "current-row" : ""}>
                        <td><span className="cutoff-dot" style={{background: c.color}}></span>{c.min}–{c.max}점 {isCur ? "◀ 현재" : ""}</td>
                        <td>{c.label}</td>
                        <td>{c.next.substring(0, 40)}…</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="result-card">
              <h3><span>💡</span> 다음 단계 안내</h3>
              <p>{level.next}</p>
            </div>
            <div className="disclaimer">
              <strong>중요 안내:</strong> 본 검사는 임상 진단 도구가 아닌 선별 도구입니다. 결과는 현재 심리 상태의 참고 자료이며, 정확한 진단 및 치료는 반드시 전문 정신건강의학과 의사 또는 임상심리사를 통해 이루어져야 합니다.
            </div>
            <div className="result-actions">
              <button className="retry-btn" onClick={goToSelector}>다른 검사 해보기</button>
              <a href="/#contact" className="contact-btn">전문가 상담 신청 →</a>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
