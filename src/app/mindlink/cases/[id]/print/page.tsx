'use client';
import { useEffect, useState, use } from 'react';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

// ── Types ────────────────────────────────────────────────────────────
interface Session {
  id: string; session_num: number; session_date: string;
  session_type: string; duration: number;
  mood_before: number | null; mood_after: number | null;
  observations: string; counselor_notes: string; homework: string;
  soap_s: string; soap_o: string; soap_a: string; soap_p: string;
}
interface TestResult {
  id: string; test_name: string; test_date: string;
  scores: Record<string, number | string>;
  interpretation: string; raw_data: string;
  category: string; sub_type: string;
}
interface Risk {
  id: string; assessed_at: string;
  suicide_risk: number; self_harm_risk: number; harm_to_others: number;
  abuse_report: boolean; action_taken: string; notes: string;
}
interface PsychReport {
  referral_background?: string; test_results_summary?: string;
  cognitive_function?: string; emotional_personality?: string;
  interpersonal?: string; expected_diagnosis?: string;
  treatment_recommendations?: string; summary?: string;
}
interface GridCell { key_concepts: string[]; maladaptive_pattern: string; clinical_indicators: string; }
interface Conceptualization {
  summary?: string; strengths?: string[]; vulnerabilities?: string[];
  counseling_goals?: string; counseling_strategy?: string;
  eemm_grid?: Record<string, GridCell>;
}
interface CaseData {
  id: string; client_alias: string; age: number; gender: string;
  presenting_problems: string; background: string; referral_source: string;
  status: string; created_at: string;
  sessions: Session[]; tests: TestResult[]; risks: Risk[];
  psych_report?: PsychReport | null;
  conceptualization?: Conceptualization | null;
}

// ── Constants ────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = { active: '진행중', hold: '보류', closed: '종결', terminated: '중단' };
const RISK_LABELS = ['없음', '낮음', '중간', '높음'];

const PSYCH_SECTIONS: { key: keyof PsychReport; label: string }[] = [
  { key: 'referral_background',    label: '의뢰 배경 및 주호소'   },
  { key: 'test_results_summary',   label: '검사 결과 개요'         },
  { key: 'cognitive_function',     label: '인지기능'               },
  { key: 'emotional_personality',  label: '정서 및 성격'           },
  { key: 'interpersonal',          label: '대인관계'               },
  { key: 'expected_diagnosis',     label: '예상 진단'              },
  { key: 'treatment_recommendations', label: '치료 권고사항'       },
  { key: 'summary',                label: '종합 요약'              },
];

const EEMM_LAYERS = [
  {
    key: 'psychological', label: '심리 과정', labelEn: 'Psychological Process',
    dims: [
      { key: 'attention',  label: '주의',     labelEn: 'Attention'  },
      { key: 'cognition',  label: '인지',     labelEn: 'Cognition'  },
      { key: 'self',       label: '자기',     labelEn: 'Self'       },
    ],
  },
  {
    key: 'behavioral', label: '행동 조절', labelEn: 'Behavioral Regulation',
    dims: [
      { key: 'emotion',    label: '정서',     labelEn: 'Emotion'    },
      { key: 'behavior',   label: '행동',     labelEn: 'Behavior'   },
      { key: 'motivation', label: '동기',     labelEn: 'Motivation' },
    ],
  },
  {
    key: 'contextual', label: '환경 맥락', labelEn: 'Contextual Factors',
    dims: [
      { key: 'bio_physiological', label: '생물생리', labelEn: 'Bio-physiological' },
      { key: 'context',           label: '맥락',     labelEn: 'Context'           },
      { key: 'socio_cultural',    label: '사회문화', labelEn: 'Socio-cultural'    },
    ],
  },
];

// MMPI scale order: validity then clinical
const MMPI_VALIDITY_KEYS = ['L', 'F', 'K'];
const MMPI_CLINICAL_KEYS = ['Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si'];
const MMPI_CLINICAL_NUMS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

// TCI subscales: temperament then character
const TCI_TEMPERAMENT: { key: string; label: string }[] = [
  { key: 'NS', label: '자극추구(NS)' },
  { key: 'HA', label: '위험회피(HA)' },
  { key: 'RD', label: '사회적 민감성(RD)' },
  { key: 'P',  label: '인내력(P)' },
];
const TCI_CHARACTER: { key: string; label: string }[] = [
  { key: 'SD', label: '자율성(SD)' },
  { key: 'C',  label: '연대감(C)' },
  { key: 'ST', label: '자기초월(ST)' },
];

// Tests to include in the report
function isIncludedTest(t: TestResult): boolean {
  const n = (t.test_name + t.sub_type + t.category).toLowerCase();
  const isIntel = t.category === '지능검사' || n.includes('wais') || n.includes('wisc') || n.includes('k-abc');
  const isMMPI  = t.sub_type === 'MMPI' || n.includes('mmpi');
  const isTCI   = t.sub_type === 'TCI'  || n.includes('tci');
  return isIntel || isMMPI || isTCI;
}

// ── SVG Profile Chart ─────────────────────────────────────────────────
interface ChartPoint { label: string; value: number; }

function ProfileChart({
  data, mean, sdSize, cutoff, yMin, yMax, separator, cutoffLabel,
}: {
  data: ChartPoint[]; mean: number; sdSize: number;
  cutoff?: number; yMin: number; yMax: number;
  separator?: number; // index after which to draw vertical separator (validity | clinical)
  cutoffLabel?: string;
}) {
  if (!data.length) return null;

  const VW = 700, VH = 310;
  const PT = 32, PB = 74, PL = 46, PR = 28;
  const CW = VW - PL - PR, CH = VH - PT - PB;

  const toY = (v: number) => PT + CH - ((v - yMin) / (yMax - yMin)) * CH;
  const toX = (i: number) => PL + (i + 0.5) * (CW / data.length);

  // SD reference lines
  const sdLines: { v: number; sd: number }[] = [];
  for (let s = Math.floor((yMin - mean) / sdSize); s <= Math.ceil((yMax - mean) / sdSize); s++) {
    const v = mean + s * sdSize;
    if (v >= yMin && v <= yMax) sdLines.push({ v, sd: s });
  }

  const pts = data.map((d, i) => `${toX(i).toFixed(1)},${toY(d.value).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <rect width={VW} height={VH} fill="white" />
      {/* Chart area */}
      <rect x={PL} y={PT} width={CW} height={CH} fill="white" stroke="#ccc" strokeWidth={0.5} />

      {/* SD reference lines */}
      {sdLines.map(({ v, sd }) => {
        const y = toY(v);
        const isMean = sd === 0;
        const isCutoff = cutoff !== undefined && v === cutoff;
        return (
          <g key={sd}>
            <line x1={PL} y1={y} x2={PL + CW} y2={y}
              stroke={isCutoff ? '#222' : isMean ? '#555' : '#ddd'}
              strokeWidth={isCutoff ? 1.4 : isMean ? 0.9 : 0.5}
              strokeDasharray={isCutoff ? '8,3' : isMean ? '' : '3,3'} />
            <text x={PL - 4} y={y + 3.5} fontSize={8.5} textAnchor="end"
              fill={isMean ? '#222' : '#999'} fontWeight={isMean ? '600' : '400'}>{v}</text>
            {sd !== 0 && (
              <text x={PL + CW + 4} y={y + 3.5} fontSize={7} fill="#bbb">
                {sd > 0 ? `+${sd}σ` : `${sd}σ`}
              </text>
            )}
            {isCutoff && cutoffLabel && (
              <text x={PL + CW + 4} y={y + 3.5} fontSize={8} fill="#333" fontWeight="700">{cutoffLabel}</text>
            )}
          </g>
        );
      })}

      {/* Cutoff line if not coinciding with an SD line */}
      {cutoff !== undefined && !sdLines.some(s => s.v === cutoff) && cutoff >= yMin && cutoff <= yMax && (
        <line x1={PL} y1={toY(cutoff)} x2={PL + CW} y2={toY(cutoff)}
          stroke="#222" strokeWidth={1.4} strokeDasharray="8,3" />
      )}

      {/* Validity/Clinical separator */}
      {separator !== undefined && (() => {
        const x = PL + (separator + 1) * (CW / data.length);
        return <line x1={x} y1={PT} x2={x} y2={PT + CH} stroke="#888" strokeWidth={0.8} strokeDasharray="4,2" />;
      })()}

      {/* Vertical grid lines */}
      {data.map((_, i) => (
        <line key={i} x1={toX(i)} y1={PT} x2={toX(i)} y2={PT + CH} stroke="#f0f0f0" strokeWidth={0.5} />
      ))}

      {/* Connecting line */}
      <polyline points={pts} fill="none" stroke="#222" strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" />

      {/* Data points */}
      {data.map((d, i) => {
        const x = toX(i), y = toY(d.value);
        const isOut = cutoff !== undefined
          ? d.value >= cutoff
          : Math.abs(d.value - mean) >= sdSize; // ±1SD for IQ
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={3.5} fill={isOut ? '#111' : '#555'} />
            <text x={x} y={y - 7} fontSize={8.5} textAnchor="middle" fill="#111" fontWeight={isOut ? '700' : '400'}>
              {d.value}
            </text>
          </g>
        );
      })}

      {/* X-axis labels (rotated) */}
      {data.map((d, i) => (
        <text key={i} fontSize={8.5} fill="#444" textAnchor="end"
          transform={`translate(${toX(i)},${PT + CH + 10}) rotate(-45)`}>
          {d.label}
        </text>
      ))}

      {/* Axes */}
      <line x1={PL} y1={PT} x2={PL} y2={PT + CH} stroke="#555" strokeWidth={0.8} />
      <line x1={PL} y1={PT + CH} x2={PL + CW} y2={PT + CH} stroke="#555" strokeWidth={0.8} />
    </svg>
  );
}

// ── Intelligence Test Chart ───────────────────────────────────────────
function IntelDisplay({ test }: { test: TestResult }) {
  const numeric = Object.entries(test.scores)
    .map(([k, v]) => ({ label: k, value: Number(v) }))
    .filter(x => !isNaN(x.value) && x.value > 0);
  if (!numeric.length) return null;

  // Determine: index scores (mean=100) vs scaled scores (mean=10)
  const avg = numeric.reduce((s, x) => s + x.value, 0) / numeric.length;
  const isIndex = avg > 30;

  const mean   = isIndex ? 100 : 10;
  const sdSize = isIndex ? 15 : 3;
  const yMin   = isIndex ? 40 : 1;
  const yMax   = isIndex ? 160 : 19;

  // Score table: bold if outside ±1SD
  const bold = (v: number) => v < mean - sdSize || v > mean + sdSize;

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 8, color: '#888', marginBottom: 6 }}>
        평균: {mean}점 | 표준편차: {sdSize}점 | 굵은 글씨: ±1SD 이탈
        {isIndex ? ' | 지수점수 (VCI·PRI·WMI·PSI·FSIQ)' : ' | 소검사 환산점수'}
      </div>
      <ProfileChart data={numeric} mean={mean} sdSize={sdSize} yMin={yMin} yMax={yMax} />
      {/* Score summary table */}
      <table style={{ fontSize: 8.5, marginTop: 8, borderCollapse: 'collapse', border: '1px solid #ccc' }}>
        <tbody>
          <tr>
            {numeric.map(d => (
              <td key={d.label} style={{ padding: '4px 10px', textAlign: 'center', border: '1px solid #ddd', background: '#f9f9f9', fontSize: 8, color: '#666' }}>
                {d.label}
              </td>
            ))}
          </tr>
          <tr>
            {numeric.map(d => (
              <td key={d.label} style={{ padding: '4px 10px', textAlign: 'center', border: '1px solid #ddd', fontWeight: bold(d.value) ? '700' : '400', color: '#111' }}>
                {d.value}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── MMPI-2 Chart ─────────────────────────────────────────────────────
function MMPIDisplay({ test }: { test: TestResult }) {
  const sc = test.scores;

  // Build ordered data: validity then clinical
  const validityData: ChartPoint[] = MMPI_VALIDITY_KEYS
    .filter(k => sc[k] != null && !isNaN(Number(sc[k])))
    .map(k => ({ label: k, value: Number(sc[k]) }));

  const clinicalData: ChartPoint[] = [];
  MMPI_CLINICAL_KEYS.forEach((k, i) => {
    const numKey = MMPI_CLINICAL_NUMS[i];
    const v = sc[k] ?? sc[numKey];
    if (v != null && !isNaN(Number(v))) {
      clinicalData.push({ label: `${numKey}(${k})`, value: Number(v) });
    }
  });

  const data = [...validityData, ...clinicalData];
  if (!data.length) return null;

  const separator = validityData.length > 0 ? validityData.length - 1 : undefined;
  const cutoff65 = 65;

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 8, color: '#888', marginBottom: 6 }}>
        T점수 | 평균: 50T | ━━━ T=65 임상적 주의 기준선 | 굵은 글씨: T≥65 임상적 상승
        {separator !== undefined && '  |  점선 구분: 타당도 ／ 임상척도'}
      </div>
      <ProfileChart
        data={data} mean={50} sdSize={10} cutoff={cutoff65}
        yMin={20} yMax={120} separator={separator}
        cutoffLabel="T=65"
      />
      {/* Score table */}
      <table style={{ fontSize: 8.5, marginTop: 8, borderCollapse: 'collapse', border: '1px solid #ccc', width: '100%' }}>
        <tbody>
          <tr>
            {data.map(d => (
              <td key={d.label} style={{ padding: '4px 8px', textAlign: 'center', border: '1px solid #ddd', background: '#f9f9f9', fontSize: 7.5, color: '#666' }}>
                {d.label}
              </td>
            ))}
          </tr>
          <tr>
            {data.map(d => (
              <td key={d.label} style={{ padding: '4px 8px', textAlign: 'center', border: '1px solid #ddd', fontWeight: d.value >= cutoff65 ? '700' : '400', color: '#111' }}>
                {d.value}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── TCI Display ───────────────────────────────────────────────────────
function TCIDisplay({ test }: { test: TestResult }) {
  const sc = test.scores;

  const tempData: ChartPoint[] = TCI_TEMPERAMENT
    .filter(d => sc[d.key] != null && !isNaN(Number(sc[d.key])))
    .map(d => ({ label: d.label, value: Number(sc[d.key]) }));
  const charData: ChartPoint[] = TCI_CHARACTER
    .filter(d => sc[d.key] != null && !isNaN(Number(sc[d.key])))
    .map(d => ({ label: d.label, value: Number(sc[d.key]) }));

  const allData = [...tempData, ...charData];
  if (!allData.length) return null;

  // Detect scale: T-scores (mean≈50) vs percentile (0–100) vs raw
  const avg = allData.reduce((s, x) => s + x.value, 0) / allData.length;
  const isTScore = avg > 30 && avg < 80;
  const mean   = isTScore ? 50 : 50;
  const sdSize = isTScore ? 10 : 10;
  const yMin   = 20;
  const yMax   = 80;
  const separator = tempData.length > 0 ? tempData.length - 1 : undefined;

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 8, color: '#888', marginBottom: 6 }}>
        T점수 | 평균: 50 | 굵은 글씨: ±1SD 이탈 | 점선 구분: 기질 ／ 성격
      </div>
      <ProfileChart data={allData} mean={mean} sdSize={sdSize} yMin={yMin} yMax={yMax} separator={separator} />
      <table style={{ fontSize: 8.5, marginTop: 8, borderCollapse: 'collapse', border: '1px solid #ccc', width: '100%' }}>
        <tbody>
          <tr>
            {allData.map(d => (
              <td key={d.label} style={{ padding: '4px 8px', textAlign: 'center', border: '1px solid #ddd', background: '#f9f9f9', fontSize: 7.5, color: '#666' }}>
                {d.label}
              </td>
            ))}
          </tr>
          <tr>
            {allData.map(d => {
              const isOut = Math.abs(d.value - mean) >= sdSize;
              return (
                <td key={d.label} style={{ padding: '4px 8px', textAlign: 'center', border: '1px solid #ddd', fontWeight: isOut ? '700' : '400', color: '#111' }}>
                  {d.value}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
      {test.interpretation && (
        <div style={{ marginTop: 10, padding: '8px 12px', borderLeft: '3px solid #aaa', background: '#f7f7f7' }}>
          <div style={{ fontSize: 8, color: '#888', marginBottom: 3 }}>해석</div>
          <p style={{ fontSize: 9.5, color: '#222', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>{test.interpretation}</p>
        </div>
      )}
    </div>
  );
}

// ── Test dispatcher ───────────────────────────────────────────────────
function TestDisplay({ test }: { test: TestResult }) {
  const n = (test.test_name + test.sub_type + test.category).toLowerCase();
  if (test.category === '지능검사' || n.includes('wais') || n.includes('wisc') || n.includes('k-abc'))
    return <IntelDisplay test={test} />;
  if (test.sub_type === 'MMPI' || n.includes('mmpi'))
    return <MMPIDisplay test={test} />;
  if (test.sub_type === 'TCI' || n.includes('tci'))
    return <TCIDisplay test={test} />;
  return null;
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<CaseData | null>(null);

  useEffect(() => {
    // Override app theme: force white on html, body, and all direct-child wrappers
    const origHtmlBg = document.documentElement.style.background;
    const origBodyBg = document.body.style.background;
    document.documentElement.style.setProperty('background', '#d6d6d6', 'important');
    document.body.style.setProperty('background', 'transparent', 'important');
    // Clear dark-mode classes that might be set by the layout
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    // Force white on all layout wrapper divs (Next.js adds several)
    const wrappers = document.body.querySelectorAll<HTMLElement>('div');
    const cleared: { el: HTMLElement; bg: string }[] = [];
    wrappers.forEach(el => {
      const bg = el.style.background;
      if (!el.classList.contains('print-page-area') && !el.classList.contains('print-page')) {
        el.style.setProperty('background', 'transparent', 'important');
        cleared.push({ el, bg });
      }
    });
    return () => {
      document.documentElement.style.background = origHtmlBg;
      document.body.style.background = origBodyBg;
      cleared.forEach(({ el, bg }) => { el.style.background = bg; });
    };
  }, []);

  useEffect(() => {
    fetchWithAuth(`/api/mindlink/cases/${id}`)
      .then(r => r.json())
      .then((d: CaseData) => { setData(d); setTimeout(() => window.print(), 900); });
  }, [id]);

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#666' }}>
        <p>보고서 생성 중...</p>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const docNo = `ML-${id.slice(0, 8).toUpperCase()}`;
  const pr = data.psych_report;
  const concept = data.conceptualization;
  const eemmGrid = concept?.eemm_grid;

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 18mm 20mm 20mm 22mm; }

        @media print {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          .no-print { display: none !important; }
          .page-break { page-break-before: always; break-before: page; }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; }

          /* Hide the outer page-area shell; only the A4 card content is printed */
          html, body, body > *, body > * > *, body > * > * > * {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-page-area {
            background: transparent !important;
            padding: 0 !important;
          }
          .print-page {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            max-width: none !important;
            margin: 0 !important;
          }
        }

        @media screen {
          .print-page-area {
            background: #d6d6d6;
            min-height: 100vh;
            padding: 32px 16px 64px;
          }
          .print-page {
            max-width: 794px;
            margin: 0 auto;
            background: #ffffff;
            box-shadow: 0 4px 32px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.10);
            padding: 22mm 22mm 24mm 24mm;
          }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Force transparent on all Next.js layout wrappers so only our containers show colour */
        html, body,
        #__next,
        [data-nextjs-scroll-focus-boundary],
        body > div, body > div > div,
        body > div > div > div,
        body > div > div > div > main,
        body > div > div > div > main > div {
          background: transparent !important;
          background-color: transparent !important;
        }

        html { background: #d6d6d6 !important; }
        body {
          font-family: 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif;
          font-size: 10pt;
          line-height: 1.75;
          color: #111111;
        }
        .print-page-area { background: #d6d6d6 !important; }
        .print-page     { background: #ffffff !important; }

        table { border-collapse: collapse; }
        p { margin: 0; }
      `}</style>

      {/* 인쇄 버튼 — 화면에서만 표시 */}
      <div className="no-print" style={{ maxWidth: 794, margin: '0 auto', padding: '0 0 14px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={() => window.print()}
          style={{ padding: '8px 18px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          🖨 인쇄 / PDF 저장
        </button>
        <button onClick={() => window.history.back()}
          style={{ padding: '8px 14px', background: '#f0f0f0', color: '#333', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          ← 뒤로
        </button>
      </div>

      <div className="print-page-area">
      <div className="print-page">

        {/* ── 레터헤드 ── */}
        <div style={{ borderTop: '3px solid #111', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #888', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 8.5, letterSpacing: '0.15em', color: '#666', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>
                Clinical Psychology · MindLink
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>
                심리상담 사례보고서
              </div>
              <div style={{ fontSize: 9, color: '#888', marginTop: 2, letterSpacing: '0.04em' }}>
                Case Report in Clinical Psychology
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 8.5, color: '#555', lineHeight: 2 }}>
              <div><span style={{ color: '#aaa' }}>문서번호&ensp;</span><strong style={{ color: '#333' }}>{docNo}</strong></div>
              <div><span style={{ color: '#aaa' }}>작성일&ensp;</span>{today}</div>
              <div><span style={{ color: '#aaa' }}>상태&ensp;</span>{STATUS_LABEL[data.status] ?? data.status}</div>
              <div><span style={{ color: '#aaa' }}>총 회기&ensp;</span>{data.sessions.length}회</div>
            </div>
          </div>
        </div>
        <div style={{ background: '#111', color: '#fff', fontSize: 8, letterSpacing: '0.22em', textAlign: 'center', padding: '5px 0', marginBottom: 28 }}>
          CONFIDENTIAL — 임상 목적 비밀 문서 · 무단 복제 및 배포 금지
        </div>

        {/* ══ Ⅰ. 내담자 기본정보 ══ */}
        <DocSection num="Ⅰ" title="내담자 기본정보" sub="Client Information">
          <table style={{ width: '100%', fontSize: 9.5 }}>
            <tbody>
              <InfoRow label="가명 (Alias)" value={<strong>{data.client_alias}</strong>} label2="나이 / 성별" value2={`${data.age}세 · ${data.gender}`} />
              <InfoRow label="등록일" value={new Date(data.created_at).toLocaleDateString('ko-KR')} label2="의뢰경로" value2={data.referral_source || '—'} />
              <InfoRowFull label="주호소" value={data.presenting_problems || '—'} />
              {data.background && <InfoRowFull label="배경정보" value={data.background} />}
            </tbody>
          </table>
        </DocSection>

        {/* ══ Ⅱ. 심리검사 보고서 ══ */}
        {pr && (
          <DocSection num="Ⅱ" title="심리검사 보고서" sub="Psychological Assessment Report">
            {data.tests.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 8, color: '#999', marginRight: 6 }}>실시 검사:</span>
                {data.tests.map(t => (
                  <span key={t.id} style={{ fontSize: 8.5, padding: '2px 8px', border: '1px solid #bbb', marginRight: 5, marginBottom: 4, display: 'inline-block', color: '#333' }}>
                    {t.test_name} <span style={{ color: '#aaa' }}>({t.test_date})</span>
                  </span>
                ))}
              </div>
            )}
            <div style={{ border: '1px solid #ccc' }}>
              {PSYCH_SECTIONS.map(({ key, label }, idx) => {
                const val = pr[key];
                if (!val?.trim()) return null;
                return (
                  <div key={key} className="avoid-break"
                    style={{ display: 'flex', borderBottom: idx < PSYCH_SECTIONS.length - 1 ? '1px solid #e8e8e8' : 'none' }}>
                    <div style={{ minWidth: 128, padding: '9px 12px', background: '#f5f5f5', borderRight: '1px solid #ddd', flexShrink: 0 }}>
                      <div style={{ fontSize: 8, color: '#aaa', marginBottom: 1 }}>§ {String(idx + 1).padStart(2, '0')}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#333' }}>{label}</div>
                    </div>
                    <div style={{ padding: '9px 14px', fontSize: 9.5, color: '#222', lineHeight: 1.8, whiteSpace: 'pre-wrap', flex: 1 }}>
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </DocSection>
        )}

        {/* ══ Ⅲ. EEMM 9차원 격자 ══ */}
        {eemmGrid && (
          <div className="page-break">
            <DocSection num="Ⅲ" title="EEMM 사례개념화" sub="Extended Evolutionary Meta-Model · 9-Dimension Grid">
              <p style={{ fontSize: 8.5, color: '#777', marginBottom: 12, lineHeight: 1.6 }}>
                Hayes &amp; Hofmann (2018) 확장진화메타모델(EEMM) — 9차원 부적응 패턴 및 임상 지표
              </p>

              {/* 강점 / 취약점 */}
              {(concept?.strengths?.length || concept?.vulnerabilities?.length) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  {concept?.strengths?.length ? (
                    <div className="avoid-break" style={{ border: '1px solid #ccc' }}>
                      <div style={{ background: '#222', color: '#fff', fontSize: 8, fontWeight: 700, padding: '5px 10px' }}>강점 및 자원</div>
                      <ul style={{ listStyle: 'none', padding: '8px 10px' }}>
                        {concept.strengths.map((s, i) => (
                          <li key={i} style={{ fontSize: 9, color: '#333', lineHeight: 1.7, display: 'flex', gap: 6 }}>
                            <span style={{ color: '#888', flexShrink: 0 }}>·</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {concept?.vulnerabilities?.length ? (
                    <div className="avoid-break" style={{ border: '1px solid #ccc' }}>
                      <div style={{ background: '#555', color: '#fff', fontSize: 8, fontWeight: 700, padding: '5px 10px' }}>취약점</div>
                      <ul style={{ listStyle: 'none', padding: '8px 10px' }}>
                        {concept.vulnerabilities.map((v, i) => (
                          <li key={i} style={{ fontSize: 9, color: '#333', lineHeight: 1.7, display: 'flex', gap: 6 }}>
                            <span style={{ color: '#888', flexShrink: 0 }}>·</span>{v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}

              {/* 9차원 격자 — 레이어 제목을 표 안 spanrow로 */}
              <table style={{ width: '100%', fontSize: 8.5, border: '1.5px solid #444' }}>
                <tbody>
                  {EEMM_LAYERS.map((layer, li) => (
                    <>
                      {/* Layer header row — inside the table */}
                      <tr key={`layer-${li}`}>
                        <td colSpan={3} style={{
                          background: li === 0 ? '#111' : li === 1 ? '#333' : '#555',
                          color: '#fff', padding: '6px 12px',
                          fontSize: 8.5, fontWeight: 700,
                          letterSpacing: '0.1em', border: '1px solid #444',
                        }}>
                          {layer.label}
                          <span style={{ fontWeight: 400, fontSize: 7.5, color: '#ccc', marginLeft: 10, letterSpacing: '0.05em' }}>
                            {layer.labelEn}
                          </span>
                        </td>
                      </tr>
                      {/* Dimension cells row */}
                      <tr key={`cells-${li}`}>
                        {layer.dims.map(dim => {
                          const cell = eemmGrid[dim.key] as GridCell | undefined;
                          return (
                            <td key={dim.key} style={{
                              width: '33.33%', verticalAlign: 'top',
                              border: '1px solid #ccc',
                              background: '#ffffff', padding: '0',
                            }}>
                              {/* Dimension title inside cell */}
                              <div style={{
                                background: '#f0f0f0', borderBottom: '1px solid #ddd',
                                padding: '5px 10px',
                              }}>
                                <span style={{ fontSize: 9, fontWeight: 700, color: '#111' }}>{dim.label}</span>
                                <span style={{ fontSize: 7.5, color: '#888', marginLeft: 6 }}>{dim.labelEn}</span>
                              </div>
                              <div style={{ padding: '8px 10px' }}>
                                {cell ? (
                                  <>
                                    {cell.key_concepts?.length > 0 && (
                                      <div style={{ marginBottom: 5, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                        {cell.key_concepts.map((c, ci) => (
                                          <span key={ci} style={{
                                            fontSize: 7.5, padding: '1px 6px',
                                            border: '1px solid #999', background: '#f5f5f5',
                                            color: '#222', fontWeight: 600,
                                          }}>{c}</span>
                                        ))}
                                      </div>
                                    )}
                                    {cell.maladaptive_pattern && (
                                      <p style={{ fontSize: 8.5, color: '#222', lineHeight: 1.7, marginBottom: 4 }}>
                                        {cell.maladaptive_pattern}
                                      </p>
                                    )}
                                    {cell.clinical_indicators && (
                                      <p style={{ fontSize: 8, color: '#777', lineHeight: 1.6, borderTop: '1px dashed #e0e0e0', paddingTop: 4, marginTop: 4 }}>
                                        {cell.clinical_indicators}
                                      </p>
                                    )}
                                  </>
                                ) : (
                                  <span style={{ fontSize: 8, color: '#ccc' }}>—</span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>

              {/* 목표 / 전략 */}
              {(concept?.counseling_goals || concept?.counseling_strategy) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                  {concept?.counseling_goals && (
                    <div className="avoid-break" style={{ border: '1px solid #ccc' }}>
                      <div style={{ background: '#333', color: '#fff', fontSize: 8, fontWeight: 700, padding: '5px 10px' }}>상담 목표</div>
                      <p style={{ fontSize: 9, lineHeight: 1.8, padding: '8px 10px', color: '#333', whiteSpace: 'pre-wrap' }}>{concept.counseling_goals}</p>
                    </div>
                  )}
                  {concept?.counseling_strategy && (
                    <div className="avoid-break" style={{ border: '1px solid #ccc' }}>
                      <div style={{ background: '#333', color: '#fff', fontSize: 8, fontWeight: 700, padding: '5px 10px' }}>상담 전략</div>
                      <p style={{ fontSize: 9, lineHeight: 1.8, padding: '8px 10px', color: '#333', whiteSpace: 'pre-wrap' }}>{concept.counseling_strategy}</p>
                    </div>
                  )}
                </div>
              )}
            </DocSection>
          </div>
        )}

        {/* ══ Ⅳ. 심리검사 원데이터 ══ */}
        {data.tests.filter(isIncludedTest).length > 0 && (
          <div className="page-break">
            <DocSection num="Ⅳ" title="심리검사 원데이터" sub="Test Data Summary · 지능검사 / MMPI-2 / TCI">
              {data.tests.filter(isIncludedTest).map((t, ti, arr) => (
                <div key={t.id} className="avoid-break" style={{ marginBottom: 20, paddingBottom: 20, borderBottom: ti < arr.length - 1 ? '1px solid #e8e8e8' : 'none' }}>
                  {/* Test header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid #eee' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 21, height: 21, borderRadius: '50%', background: '#333', color: '#fff', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                      {ti + 1}
                    </span>
                    <strong style={{ fontSize: 11, color: '#111' }}>{t.test_name}</strong>
                    {t.sub_type && <span style={{ fontSize: 8, color: '#777', border: '1px solid #ccc', padding: '1px 7px' }}>{t.sub_type}</span>}
                    <span style={{ fontSize: 8.5, color: '#aaa', marginLeft: 'auto' }}>{t.test_date}</span>
                  </div>
                  <TestDisplay test={t} />
                </div>
              ))}
            </DocSection>
          </div>
        )}

        {/* ══ Ⅴ. 상담 회기 기록 ══ */}
        {data.sessions.length > 0 && (
          <div className="page-break">
            <DocSection num="Ⅴ" title={`상담 회기 기록 (총 ${data.sessions.length}회)`} sub="Session Records">
              {/* 요약 테이블 */}
              <table style={{ width: '100%', fontSize: 8.5, marginBottom: 18, border: '1px solid #bbb' }}>
                <thead>
                  <tr style={{ background: '#222' }}>
                    {['회기', '날짜', '유형', '시간(분)', '기분 전→후'].map(h => (
                      <th key={h} style={{ color: '#fff', padding: '5px 9px', textAlign: 'center', fontWeight: 600, border: '1px solid #444' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.sessions.map((s, si) => (
                    <tr key={s.id} style={{ background: si % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '4px 9px', textAlign: 'center', border: '1px solid #ddd', fontWeight: 700 }}>{s.session_num}</td>
                      <td style={{ padding: '4px 9px', textAlign: 'center', border: '1px solid #ddd' }}>{s.session_date}</td>
                      <td style={{ padding: '4px 9px', textAlign: 'center', border: '1px solid #ddd', color: '#666' }}>{s.session_type || '—'}</td>
                      <td style={{ padding: '4px 9px', textAlign: 'center', border: '1px solid #ddd' }}>{s.duration || '—'}</td>
                      <td style={{ padding: '4px 9px', textAlign: 'center', border: '1px solid #ddd' }}>
                        {s.mood_before != null || s.mood_after != null ? `${s.mood_before ?? '?'} → ${s.mood_after ?? '?'}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* 회기별 상세 */}
              {data.sessions.map(s => {
                const rows = [
                  { k: 'S', label: 'Subjective · 주관적 호소', text: s.soap_s },
                  { k: 'O', label: 'Objective · 관찰 내용',   text: s.soap_o || s.observations },
                  { k: 'A', label: 'Assessment · 임상 평가',  text: s.soap_a || s.counselor_notes },
                  { k: 'P', label: 'Plan · 계획',             text: s.soap_p || s.homework },
                ].filter(r => r.text);
                if (!rows.length) return null;
                return (
                  <div key={s.id} className="avoid-break" style={{ marginBottom: 14, border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f2f2f2', borderBottom: '1px solid #ddd', padding: '5px 12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: '#333', color: '#fff', fontSize: 9, fontWeight: 700 }}>
                        {s.session_num}
                      </span>
                      <strong style={{ fontSize: 10, color: '#111' }}>{s.session_date}</strong>
                      {s.session_type && <span style={{ fontSize: 8, color: '#666', border: '1px solid #ccc', padding: '1px 6px', background: '#fff' }}>{s.session_type}</span>}
                      {s.duration > 0 && <span style={{ fontSize: 8.5, color: '#888' }}>{s.duration}분</span>}
                      {(s.mood_before != null || s.mood_after != null) && (
                        <span style={{ fontSize: 8, color: '#888', marginLeft: 'auto' }}>기분: {s.mood_before ?? '?'} → {s.mood_after ?? '?'}</span>
                      )}
                    </div>
                    {rows.map((r, ri) => (
                      <div key={r.k} style={{ display: 'flex', borderBottom: ri < rows.length - 1 ? '1px solid #eee' : 'none' }}>
                        <div style={{ width: 34, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 9, background: '#f8f8f8', borderRight: '1px solid #eee' }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#333' }}>{r.k}</span>
                        </div>
                        <div style={{ flex: 1, padding: '8px 12px' }}>
                          <div style={{ fontSize: 7.5, color: '#aaa', letterSpacing: '0.05em', marginBottom: 3 }}>{r.label}</div>
                          <p style={{ fontSize: 9.5, color: '#222', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </DocSection>
          </div>
        )}

        {/* ══ Ⅵ. 위험관리 ══ */}
        {data.risks?.length > 0 && (
          <DocSection num="Ⅵ" title="위험관리 기록" sub="Risk Management">
            <table style={{ width: '100%', fontSize: 9, border: '1px solid #bbb' }}>
              <thead>
                <tr style={{ background: '#222' }}>
                  {['평가일', '자살위험', '자해위험', '타해위험', '학대신고', '취해진 조치', '비고'].map(h => (
                    <th key={h} style={{ color: '#fff', padding: '5px 9px', textAlign: 'left', fontWeight: 600, border: '1px solid #444' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.risks.map((r, ri) => (
                  <tr key={r.id} style={{ background: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '5px 9px', border: '1px solid #ddd' }}>{r.assessed_at}</td>
                    <td style={{ padding: '5px 9px', border: '1px solid #ddd', fontWeight: r.suicide_risk >= 2 ? 700 : 400 }}>{RISK_LABELS[r.suicide_risk]}</td>
                    <td style={{ padding: '5px 9px', border: '1px solid #ddd', fontWeight: r.self_harm_risk >= 2 ? 700 : 400 }}>{RISK_LABELS[r.self_harm_risk]}</td>
                    <td style={{ padding: '5px 9px', border: '1px solid #ddd', fontWeight: r.harm_to_others >= 2 ? 700 : 400 }}>{RISK_LABELS[r.harm_to_others]}</td>
                    <td style={{ padding: '5px 9px', border: '1px solid #ddd' }}>{r.abuse_report ? '해당' : '—'}</td>
                    <td style={{ padding: '5px 9px', border: '1px solid #ddd', color: '#444' }}>{r.action_taken || '—'}</td>
                    <td style={{ padding: '5px 9px', border: '1px solid #ddd', color: '#666' }}>{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DocSection>
        )}

        {/* ── 서명란 / 푸터 ── */}
        <div style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid #aaa' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 28 }}>
            {[['담당 상담사', 'Counselor'], ['슈퍼바이저', 'Supervisor'], ['기관장', 'Director']].map(([role, en]) => (
              <div key={role} style={{ textAlign: 'center' }}>
                <div style={{ height: 40, borderBottom: '1px solid #999', marginBottom: 6 }} />
                <div style={{ fontSize: 8.5, color: '#555' }}>{role}</div>
                <div style={{ fontSize: 7.5, color: '#bbb', letterSpacing: '0.06em' }}>{en}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '2px solid #111', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 7.5, color: '#999', lineHeight: 1.8 }}>
              본 보고서는 임상 목적으로 작성된 비밀 문서입니다. 무단 복제 및 배포를 금합니다.<br />
              This report is a confidential clinical document. Unauthorized reproduction is prohibited.
            </div>
            <div style={{ fontSize: 7.5, color: '#bbb', textAlign: 'right', marginLeft: 20, whiteSpace: 'nowrap' }}>
              <div>MindLink Clinical System</div>
              <div>작성일: {today}</div>
            </div>
          </div>
        </div>

      </div>{/* /print-page */}
      </div>{/* /print-page-area */}
    </>
  );
}

// ── Layout sub-components ─────────────────────────────────────────────
function DocSection({ num, title, sub, children }: {
  num: string; title: string; sub: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12, paddingBottom: 7, borderBottom: '2px solid #111' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>{num}.</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{title}</span>
        <span style={{ fontSize: 8.5, color: '#999', fontStyle: 'italic', letterSpacing: '0.04em' }}>{sub}</span>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, label2, value2 }: {
  label: string; value: React.ReactNode; label2: string; value2: React.ReactNode;
}) {
  const cellBase: React.CSSProperties = { padding: '7px 10px', border: '1px solid #ccc', verticalAlign: 'top', fontSize: 9.5 };
  const thBase: React.CSSProperties = { ...cellBase, background: '#f5f5f5', fontWeight: 600, fontSize: 8.5, color: '#555', width: '13%', whiteSpace: 'nowrap' };
  return (
    <tr>
      <td style={thBase}>{label}</td>
      <td style={{ ...cellBase, color: '#111' }}>{value}</td>
      <td style={thBase}>{label2}</td>
      <td style={{ ...cellBase, color: '#111' }}>{value2}</td>
    </tr>
  );
}

function InfoRowFull({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr>
      <td style={{ padding: '7px 10px', border: '1px solid #ccc', background: '#f5f5f5', fontWeight: 600, fontSize: 8.5, color: '#555', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{label}</td>
      <td colSpan={3} style={{ padding: '7px 10px', border: '1px solid #ccc', color: '#222', lineHeight: 1.8, fontSize: 9.5, whiteSpace: 'pre-wrap' }}>{value}</td>
    </tr>
  );
}
