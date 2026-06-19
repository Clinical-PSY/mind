'use client';
import { useEffect, useState, use } from 'react';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

// ── 타입 ─────────────────────────────────────────────────────────────
interface Session {
  id: string; session_num: number; session_date: string;
  session_type: string; duration: number;
  mood_before: number | null; mood_after: number | null;
  observations: string; counselor_notes: string; homework: string;
  soap_s: string; soap_o: string; soap_a: string; soap_p: string;
}
interface TestResult {
  id: string; test_name: string; test_date: string;
  scores: Record<string, number | string>; interpretation: string;
  raw_data: string; category: string; sub_type: string;
}
interface Risk {
  id: string; assessed_at: string;
  suicide_risk: number; self_harm_risk: number; harm_to_others: number;
  abuse_report: boolean; action_taken: string; notes: string;
}
interface PsychReport {
  referral_background: string; test_results_summary: string;
  cognitive_function: string; emotional_personality: string;
  interpersonal: string; expected_diagnosis: string;
  treatment_recommendations: string; summary: string;
}
interface GridCell {
  key_concepts: string[]; maladaptive_pattern: string; clinical_indicators: string;
}
interface Conceptualization {
  summary?: string; strengths?: string[]; vulnerabilities?: string[];
  risk_factors?: string[]; protective_factors?: string[];
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

// ── 상수 ─────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = { active: '진행중', hold: '보류', closed: '종결', terminated: '중단' };
const RISK_LABELS = ['없음', '낮음', '중간', '높음'];

const PSYCH_SECTIONS: { key: keyof PsychReport; label: string; num: string }[] = [
  { key: 'referral_background',    label: '의뢰 배경 및 주호소',   num: '1' },
  { key: 'test_results_summary',   label: '검사 결과 개요',         num: '2' },
  { key: 'cognitive_function',     label: '인지기능',               num: '3' },
  { key: 'emotional_personality',  label: '정서 및 성격',           num: '4' },
  { key: 'interpersonal',          label: '대인관계',               num: '5' },
  { key: 'expected_diagnosis',     label: '예상 진단',              num: '6' },
  { key: 'treatment_recommendations', label: '치료 권고사항',       num: '7' },
  { key: 'summary',                label: '종합 요약',              num: '8' },
];

const EEMM_GRID = [
  {
    layer: '심리 과정', layerEn: 'Psychological Process',
    cells: [
      { key: 'attention',  label: '주의',  labelEn: 'Attention' },
      { key: 'cognition',  label: '인지',  labelEn: 'Cognition' },
      { key: 'self',       label: '자기',  labelEn: 'Self' },
    ],
  },
  {
    layer: '행동 조절', layerEn: 'Behavioral Regulation',
    cells: [
      { key: 'emotion',    label: '정서',     labelEn: 'Emotion' },
      { key: 'behavior',   label: '행동',     labelEn: 'Behavior' },
      { key: 'motivation', label: '동기',     labelEn: 'Motivation' },
    ],
  },
  {
    layer: '환경 맥락', layerEn: 'Contextual Factors',
    cells: [
      { key: 'bio_physiological', label: '생물생리', labelEn: 'Bio-physiological' },
      { key: 'context',           label: '맥락',     labelEn: 'Context' },
      { key: 'socio_cultural',    label: '사회문화', labelEn: 'Socio-cultural' },
    ],
  },
];

// ── 메인 ─────────────────────────────────────────────────────────────
export default function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<CaseData | null>(null);

  useEffect(() => {
    fetchWithAuth(`/api/mindlink/cases/${id}`)
      .then(r => r.json())
      .then((d: CaseData) => {
        setData(d);
        setTimeout(() => window.print(), 900);
      });
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
  const totalSessions = data.sessions.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&display=swap');
        @page { size: A4; margin: 18mm 20mm 20mm 22mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; break-before: page; }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
          font-size: 10pt;
          line-height: 1.75;
          background: #ffffff;
          color: #111111;
        }
        table { border-collapse: collapse; width: 100%; }
        p { margin: 0; }
      `}</style>

      {/* ── 인쇄 컨트롤 (화면 전용) ── */}
      <div className="no-print" style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, display: 'flex', gap: 8 }}>
        <button onClick={() => window.print()}
          style={{ padding: '8px 18px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          🖨 인쇄 / PDF 저장
        </button>
        <button onClick={() => window.history.back()}
          style={{ padding: '8px 14px', background: '#f0f0f0', color: '#333', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          ← 뒤로
        </button>
      </div>

      <div style={{ maxWidth: 794, margin: '0 auto', padding: '32px 0' }}>

        {/* ══════════════════════════════════════════════════════════
            레터헤드 / 문서 헤더
            ══════════════════════════════════════════════════════════ */}
        <div style={{ borderTop: '3px solid #111', borderBottom: '1px solid #aaa', paddingBottom: 14, marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 12 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.12em', color: '#555', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>
                Clinical Psychology · MindLink
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>
                심리상담 사례보고서
              </div>
              <div style={{ fontSize: 9.5, color: '#777', marginTop: 2 }}>
                Case Report in Clinical Psychology
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 9, color: '#555', lineHeight: 1.9 }}>
              <div><span style={{ color: '#999' }}>문서번호</span> {docNo}</div>
              <div><span style={{ color: '#999' }}>작성일</span>   {today}</div>
              <div><span style={{ color: '#999' }}>상태</span>     {STATUS_LABEL[data.status] ?? data.status}</div>
              <div><span style={{ color: '#999' }}>총 회기</span>  {totalSessions}회</div>
            </div>
          </div>
        </div>

        {/* 문서 부제 라인 */}
        <div style={{ background: '#111', color: '#fff', fontSize: 9, letterSpacing: '0.25em', textAlign: 'center', padding: '5px 0', marginBottom: 28 }}>
          CONFIDENTIAL — 본 문서는 임상 목적으로 작성된 비밀 문서이며, 무단 복제·배포를 금합니다
        </div>

        {/* ══════════════════════════════════════════════════════════
            Ⅰ. 내담자 기본정보
            ══════════════════════════════════════════════════════════ */}
        <DocSection num="Ⅰ" title="내담자 기본정보" subtitle="Client Information">
          <table style={{ width: '100%', fontSize: 9.5, borderTop: '1px solid #aaa', borderLeft: '1px solid #aaa' }}>
            <tbody>
              <tr>
                <Th>가명 (Alias)</Th>
                <Td><strong>{data.client_alias}</strong></Td>
                <Th>나이 / 성별</Th>
                <Td>{data.age}세&nbsp;&nbsp;{data.gender}</Td>
              </tr>
              <tr>
                <Th>등록일</Th>
                <Td>{new Date(data.created_at).toLocaleDateString('ko-KR')}</Td>
                <Th>의뢰경로</Th>
                <Td>{data.referral_source || '—'}</Td>
              </tr>
              <tr>
                <Th>주호소</Th>
                <Td colSpan={3} style={{ borderRight: '1px solid #aaa', padding: '7px 10px', lineHeight: 1.7 }}>
                  {data.presenting_problems || '—'}
                </Td>
              </tr>
              {data.background && (
                <tr>
                  <Th>배경정보</Th>
                  <Td colSpan={3} style={{ borderRight: '1px solid #aaa', padding: '7px 10px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {data.background}
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </DocSection>

        {/* ══════════════════════════════════════════════════════════
            Ⅱ. 심리검사 보고서 (Module 2)
            ══════════════════════════════════════════════════════════ */}
        {pr && (
          <DocSection num="Ⅱ" title="심리검사 보고서" subtitle="Psychological Assessment Report">

            {/* 검사 종류 목록 */}
            {data.tests.length > 0 && (
              <div style={{ marginBottom: 14 }} className="avoid-break">
                <FieldLabel>실시 검사</FieldLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
                  {data.tests.map(t => (
                    <span key={t.id} style={{ fontSize: 9, padding: '2px 9px', border: '1px solid #999', borderRadius: 2, color: '#333' }}>
                      {t.test_name} <span style={{ color: '#888' }}>({t.test_date})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid #ddd' }}>
              {PSYCH_SECTIONS.map(({ key, label, num }) => {
                const val = pr[key];
                if (!val?.trim()) return null;
                return (
                  <div key={key} className="avoid-break"
                    style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e8e8e8' }}>
                    {/* 번호 + 항목명 */}
                    <div style={{
                      minWidth: 130, padding: '9px 12px',
                      background: '#f7f7f7', borderRight: '1px solid #ddd',
                      flexShrink: 0,
                    }}>
                      <div style={{ fontSize: 8.5, color: '#999', letterSpacing: '0.05em' }}>§ {num}</div>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: '#222', marginTop: 1 }}>{label}</div>
                    </div>
                    {/* 내용 */}
                    <div style={{ padding: '9px 14px', fontSize: 9.5, color: '#222', lineHeight: 1.8, whiteSpace: 'pre-wrap', flex: 1 }}>
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </DocSection>
        )}

        {/* ══════════════════════════════════════════════════════════
            Ⅲ. EEMM 사례개념화 9차원 격자 (Module 3)
            ══════════════════════════════════════════════════════════ */}
        {eemmGrid && (
          <div className="page-break">
            <DocSection num="Ⅲ" title="EEMM 사례개념화" subtitle="Extended Evolutionary Meta-Model · 9-Dimension Grid">

              {/* 설명 */}
              <p style={{ fontSize: 9, color: '#666', marginBottom: 12, lineHeight: 1.6 }}>
                Hayes &amp; Hofmann (2018) 확장진화메타모델(EEMM) 기반 9차원 사례개념화 격자.
                각 셀은 해당 차원의 핵심 개념, 부적응 패턴, 임상적 지표를 포함합니다.
              </p>

              {/* 강점 / 취약점 요약 */}
              {(concept?.strengths?.length || concept?.vulnerabilities?.length) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  {concept?.strengths?.length ? (
                    <div className="avoid-break" style={{ border: '1px solid #bbb', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ background: '#222', color: '#fff', fontSize: 8.5, fontWeight: 700, padding: '5px 10px', letterSpacing: '0.08em' }}>강점 및 자원</div>
                      <ul style={{ listStyle: 'none', padding: '8px 10px', margin: 0 }}>
                        {concept.strengths.map((s, i) => (
                          <li key={i} style={{ fontSize: 9, color: '#333', lineHeight: 1.7, display: 'flex', gap: 5 }}>
                            <span style={{ color: '#777', flexShrink: 0 }}>·</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {concept?.vulnerabilities?.length ? (
                    <div className="avoid-break" style={{ border: '1px solid #bbb', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ background: '#555', color: '#fff', fontSize: 8.5, fontWeight: 700, padding: '5px 10px', letterSpacing: '0.08em' }}>취약점</div>
                      <ul style={{ listStyle: 'none', padding: '8px 10px', margin: 0 }}>
                        {concept.vulnerabilities.map((v, i) => (
                          <li key={i} style={{ fontSize: 9, color: '#333', lineHeight: 1.7, display: 'flex', gap: 5 }}>
                            <span style={{ color: '#777', flexShrink: 0 }}>·</span>{v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}

              {/* 9차원 격자 */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9, border: '1.5px solid #555' }}>
                <thead>
                  <tr>
                    <th style={{ width: '11%', background: '#111', color: '#fff', padding: '7px 8px', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.06em', border: '1px solid #555', textAlign: 'center', verticalAlign: 'middle' }}>
                      영역
                    </th>
                    {EEMM_GRID[0].cells.map(c => (
                      <th key={c.key} style={{ width: '29.6%', background: '#111', color: '#fff', padding: '7px 10px', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.06em', border: '1px solid #555', textAlign: 'center' }}>
                        {c.label}
                        <div style={{ fontWeight: 400, fontSize: 7.5, color: '#aaa', letterSpacing: '0.04em' }}>{c.labelEn}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EEMM_GRID.map((layer, li) => {
                    const rowBg = li % 2 === 0 ? '#ffffff' : '#fafafa';
                    return (
                      <tr key={layer.layer}>
                        {/* 레이어 헤더 */}
                        <td style={{
                          background: '#333', color: '#fff',
                          padding: '8px 6px', fontSize: 8.5, fontWeight: 700,
                          textAlign: 'center', verticalAlign: 'middle',
                          border: '1px solid #555', lineHeight: 1.5,
                          writingMode: 'vertical-rl', textOrientation: 'mixed',
                          letterSpacing: '0.1em',
                        }}>
                          {layer.layer}
                        </td>
                        {/* 각 차원 셀 */}
                        {layer.cells.map(cell => {
                          const d = eemmGrid[cell.key] as GridCell | undefined;
                          return (
                            <td key={cell.key} style={{ background: rowBg, border: '1px solid #ccc', padding: '8px 10px', verticalAlign: 'top' }}>
                              {d ? (
                                <>
                                  {/* 핵심 개념 */}
                                  {d.key_concepts?.length > 0 && (
                                    <div style={{ marginBottom: 5 }}>
                                      {d.key_concepts.map((c, ci) => (
                                        <span key={ci} style={{ display: 'inline-block', fontSize: 8, padding: '1px 6px', border: '1px solid #999', borderRadius: 1, color: '#222', marginRight: 3, marginBottom: 3, background: '#f0f0f0', fontWeight: 600 }}>
                                          {c}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {/* 부적응 패턴 */}
                                  {d.maladaptive_pattern && (
                                    <p style={{ fontSize: 8.5, color: '#222', lineHeight: 1.7, marginBottom: 4 }}>
                                      {d.maladaptive_pattern}
                                    </p>
                                  )}
                                  {/* 임상 지표 */}
                                  {d.clinical_indicators && (
                                    <p style={{ fontSize: 8, color: '#666', lineHeight: 1.6, borderTop: '1px dashed #ddd', paddingTop: 4, marginTop: 4 }}>
                                      {d.clinical_indicators}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <span style={{ fontSize: 8, color: '#ccc' }}>—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* 상담 목표 / 전략 */}
              {(concept?.counseling_goals || concept?.counseling_strategy) && (
                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {concept?.counseling_goals && (
                    <div className="avoid-break" style={{ border: '1px solid #ccc' }}>
                      <div style={{ background: '#333', color: '#fff', fontSize: 8.5, fontWeight: 700, padding: '5px 10px' }}>상담 목표</div>
                      <p style={{ fontSize: 9, color: '#333', lineHeight: 1.8, padding: '8px 10px', whiteSpace: 'pre-wrap' }}>{concept.counseling_goals}</p>
                    </div>
                  )}
                  {concept?.counseling_strategy && (
                    <div className="avoid-break" style={{ border: '1px solid #ccc' }}>
                      <div style={{ background: '#333', color: '#fff', fontSize: 8.5, fontWeight: 700, padding: '5px 10px' }}>상담 전략</div>
                      <p style={{ fontSize: 9, color: '#333', lineHeight: 1.8, padding: '8px 10px', whiteSpace: 'pre-wrap' }}>{concept.counseling_strategy}</p>
                    </div>
                  )}
                </div>
              )}
            </DocSection>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            Ⅳ. 심리검사 원데이터 요약
            ══════════════════════════════════════════════════════════ */}
        {data.tests.length > 0 && (
          <div className="page-break">
            <DocSection num="Ⅳ" title="심리검사 원데이터 요약" subtitle="Test Score Summary">
              {data.tests.map((t, ti) => {
                let htpData: Record<string, string> | null = null;
                if (t.sub_type === 'HTP' && t.raw_data) { try { htpData = JSON.parse(t.raw_data); } catch { /**/ } }
                const hasScores = Object.keys(t.scores || {}).length > 0;
                return (
                  <div key={t.id} className="avoid-break" style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e5e5e5' }}>
                    {/* 검사명 헤더 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: '#333', color: '#fff', fontSize: 8.5, fontWeight: 700, flexShrink: 0 }}>
                        {ti + 1}
                      </span>
                      <strong style={{ fontSize: 10.5, color: '#111' }}>{t.test_name}</strong>
                      {t.sub_type && <span style={{ fontSize: 8.5, color: '#777', border: '1px solid #ccc', padding: '1px 7px', borderRadius: 2 }}>{t.sub_type}</span>}
                      <span style={{ fontSize: 8.5, color: '#999', marginLeft: 'auto' }}>{t.test_date}</span>
                    </div>

                    {/* 점수 태그 */}
                    {hasScores && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8, paddingLeft: 30 }}>
                        {Object.entries(t.scores).slice(0, 40).map(([k, v]) => (
                          <span key={k} style={{ fontSize: 8.5, padding: '2px 7px', background: '#f3f3f3', border: '1px solid #ddd', borderRadius: 2, color: '#333' }}>
                            {k}: <strong style={{ color: '#111' }}>{v}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* HTP */}
                    {htpData && (
                      <div style={{ paddingLeft: 30, fontSize: 9, color: '#444', lineHeight: 1.7, marginBottom: 6 }}>
                        {htpData.house  && <p>집(H): {htpData.house}</p>}
                        {htpData.tree   && <p>나무(T): {htpData.tree}</p>}
                        {htpData.person && <p>사람(P): {htpData.person}</p>}
                      </div>
                    )}

                    {/* Raw data */}
                    {!htpData && t.raw_data && t.sub_type !== '로르샤하' && (
                      <p style={{ paddingLeft: 30, fontSize: 9, color: '#555', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 6 }}>{t.raw_data}</p>
                    )}

                    {/* 해석 */}
                    {t.interpretation && (
                      <p style={{ paddingLeft: 30, fontSize: 9.5, color: '#222', lineHeight: 1.8, whiteSpace: 'pre-wrap', borderLeft: '2px solid #999', marginLeft: 30, paddingTop: 4, paddingBottom: 4 }}>
                        {t.interpretation}
                      </p>
                    )}
                  </div>
                );
              })}
            </DocSection>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            Ⅴ. 상담 회기 기록
            ══════════════════════════════════════════════════════════ */}
        {data.sessions.length > 0 && (
          <div className="page-break">
            <DocSection num="Ⅴ" title={`상담 회기 기록 (총 ${totalSessions}회)`} subtitle="Session Records">

              {/* 회기 요약 테이블 */}
              <table style={{ fontSize: 8.5, marginBottom: 20, border: '1px solid #bbb' }}>
                <thead>
                  <tr style={{ background: '#222' }}>
                    {['회기', '날짜', '유형', '시간(분)', '기분 전', '기분 후'].map(h => (
                      <th key={h} style={{ color: '#fff', padding: '5px 9px', textAlign: 'center', fontWeight: 600, border: '1px solid #444', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.sessions.map((s, si) => (
                    <tr key={s.id} style={{ background: si % 2 === 0 ? '#fff' : '#f8f8f8' }}>
                      <td style={{ padding: '4px 9px', textAlign: 'center', border: '1px solid #ddd', fontWeight: 700 }}>{s.session_num}</td>
                      <td style={{ padding: '4px 9px', textAlign: 'center', border: '1px solid #ddd' }}>{s.session_date}</td>
                      <td style={{ padding: '4px 9px', textAlign: 'center', border: '1px solid #ddd', color: '#555' }}>{s.session_type || '—'}</td>
                      <td style={{ padding: '4px 9px', textAlign: 'center', border: '1px solid #ddd' }}>{s.duration || '—'}</td>
                      <td style={{ padding: '4px 9px', textAlign: 'center', border: '1px solid #ddd' }}>{s.mood_before ?? '—'}</td>
                      <td style={{ padding: '4px 9px', textAlign: 'center', border: '1px solid #ddd' }}>{s.mood_after ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 회기별 SOAP 상세 */}
              {data.sessions.map(s => {
                const soapO = s.soap_o || s.observations    || '';
                const soapA = s.soap_a || s.counselor_notes || '';
                const soapP = s.soap_p || s.homework        || '';
                const hasSoap = s.soap_s || soapO || soapA || soapP;
                if (!hasSoap) return null;
                return (
                  <div key={s.id} className="avoid-break" style={{ marginBottom: 18, border: '1px solid #ddd', borderRadius: 2 }}>
                    {/* 회기 헤더 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0f0f0', borderBottom: '1px solid #ddd', padding: '6px 12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: '#333', color: '#fff', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                        {s.session_num}
                      </span>
                      <strong style={{ fontSize: 10, color: '#111' }}>{s.session_date}</strong>
                      {s.session_type && <span style={{ fontSize: 8.5, color: '#666', border: '1px solid #bbb', padding: '1px 6px', borderRadius: 2, background: '#fff' }}>{s.session_type}</span>}
                      {s.duration > 0 && <span style={{ fontSize: 8.5, color: '#888' }}>{s.duration}분</span>}
                      {(s.mood_before != null || s.mood_after != null) && (
                        <span style={{ fontSize: 8.5, color: '#888', marginLeft: 'auto' }}>기분 변화: {s.mood_before ?? '?'} → {s.mood_after ?? '?'}</span>
                      )}
                    </div>

                    {/* SOAP */}
                    <div style={{ padding: '0' }}>
                      {[
                        { key: 'S', text: s.soap_s, label: 'Subjective · 주관적 호소' },
                        { key: 'O', text: soapO,    label: 'Objective · 관찰 내용' },
                        { key: 'A', text: soapA,    label: 'Assessment · 임상적 평가' },
                        { key: 'P', text: soapP,    label: 'Plan · 계획' },
                      ].filter(r => r.text).map((r, ri) => (
                        <div key={r.key} style={{ display: 'flex', borderBottom: ri < 3 ? '1px solid #eee' : 'none' }}>
                          <div style={{ width: 36, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 9, background: r.key === 'S' ? '#f8f8f8' : r.key === 'O' ? '#f5f5f5' : r.key === 'A' ? '#f2f2f2' : '#efefef' }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#333' }}>{r.key}</span>
                          </div>
                          <div style={{ flex: 1, padding: '8px 12px' }}>
                            <div style={{ fontSize: 7.5, color: '#999', letterSpacing: '0.06em', marginBottom: 3 }}>{r.label}</div>
                            <p style={{ fontSize: 9.5, color: '#222', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{r.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </DocSection>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            Ⅵ. 위험관리 기록
            ══════════════════════════════════════════════════════════ */}
        {data.risks && data.risks.length > 0 && (
          <DocSection num="Ⅵ" title="위험관리 기록" subtitle="Risk Management Records">
            <table style={{ fontSize: 9, border: '1px solid #bbb' }}>
              <thead>
                <tr style={{ background: '#222' }}>
                  {['평가일', '자살위험', '자해위험', '타해위험', '학대신고', '취해진 조치', '비고'].map(h => (
                    <th key={h} style={{ color: '#fff', padding: '5px 9px', textAlign: 'left', fontWeight: 600, border: '1px solid #444', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.risks.map((r, ri) => (
                  <tr key={r.id} style={{ background: ri % 2 === 0 ? '#fff' : '#f8f8f8' }}>
                    <td style={{ padding: '5px 9px', border: '1px solid #ddd' }}>{r.assessed_at}</td>
                    <td style={{ padding: '5px 9px', border: '1px solid #ddd', fontWeight: r.suicide_risk >= 2 ? 700 : 400 }}>{RISK_LABELS[r.suicide_risk]}</td>
                    <td style={{ padding: '5px 9px', border: '1px solid #ddd', fontWeight: r.self_harm_risk >= 2 ? 700 : 400 }}>{RISK_LABELS[r.self_harm_risk]}</td>
                    <td style={{ padding: '5px 9px', border: '1px solid #ddd', fontWeight: r.harm_to_others >= 2 ? 700 : 400 }}>{RISK_LABELS[r.harm_to_others]}</td>
                    <td style={{ padding: '5px 9px', border: '1px solid #ddd' }}>{r.abuse_report ? '해당' : '아니오'}</td>
                    <td style={{ padding: '5px 9px', border: '1px solid #ddd', color: '#444' }}>{r.action_taken || '—'}</td>
                    <td style={{ padding: '5px 9px', border: '1px solid #ddd', color: '#666' }}>{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DocSection>
        )}

        {/* ══════════════════════════════════════════════════════════
            서명란 / 푸터
            ══════════════════════════════════════════════════════════ */}
        <div style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid #999' }}>
          {/* 서명 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 28 }}>
            {[
              { role: '담당 상담사', label: 'Counselor' },
              { role: '슈퍼바이저',  label: 'Supervisor' },
              { role: '기관장',      label: 'Director' },
            ].map(s => (
              <div key={s.role} style={{ textAlign: 'center' }}>
                <div style={{ height: 42, borderBottom: '1px solid #999', marginBottom: 6 }} />
                <div style={{ fontSize: 8.5, color: '#555' }}>{s.role}</div>
                <div style={{ fontSize: 7.5, color: '#aaa', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* 면책 */}
          <div style={{ borderTop: '2px solid #111', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 7.5, color: '#888', letterSpacing: '0.04em' }}>
              본 보고서는 임상 목적으로 작성된 비밀 문서입니다. 무단 복제 및 배포를 금합니다.<br />
              This report is a confidential clinical document. Unauthorized reproduction or distribution is strictly prohibited.
            </div>
            <div style={{ fontSize: 7.5, color: '#aaa', textAlign: 'right', whiteSpace: 'nowrap', marginLeft: 20 }}>
              <div>MindLink Clinical System</div>
              <div>작성일: {today}</div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

// ── 서브 컴포넌트 ─────────────────────────────────────────────────────
function DocSection({ num, title, subtitle, children }: {
  num: string; title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      {/* 섹션 헤더 */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12, borderBottom: '2px solid #111', paddingBottom: 7 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#111', letterSpacing: '-0.01em' }}>{num}.</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>{title}</span>
        <span style={{ fontSize: 9, color: '#888', letterSpacing: '0.06em', fontStyle: 'italic' }}>{subtitle}</span>
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 8.5, color: '#888', letterSpacing: '0.06em', marginBottom: 2 }}>{children}</div>;
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <td style={{
      background: '#f0f0f0', fontWeight: 600, fontSize: 8.5,
      color: '#444', padding: '7px 10px', width: '14%',
      border: '1px solid #aaa', whiteSpace: 'nowrap', verticalAlign: 'top',
    }}>{children}</td>
  );
}

function Td({ children, colSpan, style }: { children: React.ReactNode; colSpan?: number; style?: React.CSSProperties }) {
  return (
    <td colSpan={colSpan} style={{ padding: '7px 10px', fontSize: 9.5, color: '#222', border: '1px solid #aaa', lineHeight: 1.7, ...style }}>
      {children}
    </td>
  );
}
