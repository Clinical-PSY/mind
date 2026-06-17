'use client';
import { useEffect, useState, use } from 'react';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

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
  id: string; assessed_at: string; session_id: string | null;
  suicide_risk: number; self_harm_risk: number; harm_to_others: number;
  abuse_report: boolean; action_taken: string; notes: string;
}
interface CaseData {
  id: string; client_alias: string; age: number; gender: string;
  presenting_problems: string; background: string; referral_source: string;
  status: string; created_at: string;
  sessions: Session[]; tests: TestResult[]; risks: Risk[];
}

const RISK_LABELS = ['없음', '낮음', '중간', '높음'];

export default function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<CaseData | null>(null);

  useEffect(() => {
    fetchWithAuth(`/api/mindlink/cases/${id}`)
      .then(r => r.json())
      .then((d: CaseData) => {
        setData(d);
        setTimeout(() => window.print(), 800);
      });
  }, [id]);

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#666' }}>
        <p>보고서 준비 중...</p>
      </div>
    );
  }

  const statusLabel: Record<string, string> = { active: '진행중', hold: '보류', closed: '종결', terminated: '중단' };

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 20mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
        }
        body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; margin: 0; background: #fff; color: #111; }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

        {/* 인쇄 버튼 (화면 전용) */}
        <div className="no-print" style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
          <button onClick={() => window.print()} style={{ padding: '8px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
            🖨️ 인쇄 / PDF 저장
          </button>
          <button onClick={() => window.close()} style={{ padding: '8px 16px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
            닫기
          </button>
        </div>

        {/* ── 표지 ── */}
        <div style={{ textAlign: 'center', paddingBottom: 32, borderBottom: '2px solid #111', marginBottom: 32 }}>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>심리상담 사례 기록</p>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>상담 기록 보고서</h1>
          <p style={{ fontSize: 13, color: '#555' }}>출력일: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* ── 내담자 기본정보 ── */}
        <Section title="내담자 기본정보">
          <InfoGrid>
            <InfoItem label="가명" value={data.client_alias} />
            <InfoItem label="나이/성별" value={`${data.age}세 ${data.gender}`} />
            <InfoItem label="사례 상태" value={statusLabel[data.status] ?? data.status} />
            <InfoItem label="등록일" value={new Date(data.created_at).toLocaleDateString('ko-KR')} />
            <InfoItem label="의뢰경로" value={data.referral_source || '—'} span />
            <InfoItem label="주호소" value={data.presenting_problems || '—'} span />
            {data.background && <InfoItem label="배경정보" value={data.background} span />}
          </InfoGrid>
        </Section>

        {/* ── 상담 회기 기록 ── */}
        {data.sessions.length > 0 && (
          <Section title={`상담 회기 기록 (총 ${data.sessions.length}회)`}>
            {data.sessions.map(s => {
              const soapO = s.soap_o || s.observations    || '';
              const soapA = s.soap_a || s.counselor_notes || '';
              const soapP = s.soap_p || s.homework        || '';
              return (
                <div key={s.id} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {s.session_num}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{s.session_date}</span>
                    {s.session_type && <span style={{ fontSize: 12, color: '#888', background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>{s.session_type}</span>}
                    {s.duration > 0 && <span style={{ fontSize: 12, color: '#888' }}>{s.duration}분</span>}
                    {(s.mood_before != null || s.mood_after != null) && (
                      <span style={{ fontSize: 12, color: '#888' }}>기분 {s.mood_before ?? '?'} → {s.mood_after ?? '?'}</span>
                    )}
                  </div>
                  <div style={{ paddingLeft: 40 }}>
                    {s.soap_s && <SoapRow label="S" color="#2563eb" text={s.soap_s} />}
                    {soapO    && <SoapRow label="O" color="#16a34a" text={soapO}    />}
                    {soapA    && <SoapRow label="A" color="#d97706" text={soapA}    />}
                    {soapP    && <SoapRow label="P" color="#7c3aed" text={soapP}    />}
                  </div>
                </div>
              );
            })}
          </Section>
        )}

        {/* ── 심리검사 결과 ── */}
        {data.tests.length > 0 && (
          <Section title={`심리검사 결과 (총 ${data.tests.length}건)`}>
            {data.tests.map(t => {
              let htpData: Record<string, string> | null = null;
              if (t.sub_type === 'HTP' && t.raw_data) { try { htpData = JSON.parse(t.raw_data); } catch { /**/ } }
              return (
                <div key={t.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px dashed #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{t.test_name}</span>
                    {t.sub_type && <span style={{ fontSize: 12, color: '#888', background: '#f3f4f6', padding: '2px 8px', borderRadius: 4 }}>{t.sub_type}</span>}
                    <span style={{ fontSize: 12, color: '#888' }}>{t.test_date}</span>
                  </div>
                  {Object.keys(t.scores || {}).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                      {Object.entries(t.scores).slice(0, 30).map(([k, v]) => (
                        <span key={k} style={{ fontSize: 12, padding: '2px 8px', background: '#f3f4f6', borderRadius: 4, color: '#374151' }}>
                          {k}: <strong>{v}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                  {htpData && (
                    <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>
                      {htpData.house  && <p style={{ margin: '2px 0' }}>🏠 {htpData.house}</p>}
                      {htpData.tree   && <p style={{ margin: '2px 0' }}>🌳 {htpData.tree}</p>}
                      {htpData.person && <p style={{ margin: '2px 0' }}>🧍 {htpData.person}</p>}
                    </div>
                  )}
                  {!htpData && t.raw_data && t.sub_type !== '로르샤하' && (
                    <p style={{ fontSize: 12, color: '#555', margin: '4px 0', whiteSpace: 'pre-wrap' }}>{t.raw_data}</p>
                  )}
                  {t.interpretation && (
                    <p style={{ fontSize: 13, color: '#374151', marginTop: 4, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{t.interpretation}</p>
                  )}
                </div>
              );
            })}
          </Section>
        )}

        {/* ── 위험관리 ── */}
        {data.risks && data.risks.length > 0 && (
          <Section title="위험관리 기록">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['날짜', '자살위험', '자해위험', '타해위험', '학대신고', '취해진 조치'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.risks.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px 10px' }}>{r.assessed_at}</td>
                    <td style={{ padding: '6px 10px' }}>{RISK_LABELS[r.suicide_risk]}</td>
                    <td style={{ padding: '6px 10px' }}>{RISK_LABELS[r.self_harm_risk]}</td>
                    <td style={{ padding: '6px 10px' }}>{RISK_LABELS[r.harm_to_others]}</td>
                    <td style={{ padding: '6px 10px' }}>{r.abuse_report ? '예' : '아니오'}</td>
                    <td style={{ padding: '6px 10px', color: '#555' }}>{r.action_taken || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {/* 면책 */}
        <div style={{ marginTop: 40, paddingTop: 16, borderTop: '1px solid #e5e7eb', fontSize: 11, color: '#aaa', textAlign: 'center' }}>
          본 기록은 임상 목적으로 작성된 비밀 문서입니다. 무단 복제 및 배포를 금합니다.
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, paddingBottom: 8, borderBottom: '1.5px solid #6366f1', color: '#111' }}>{title}</h2>
      {children}
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>{children}</div>;
}

function InfoItem({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div style={{ gridColumn: span ? '1 / -1' : undefined }}>
      <span style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 2 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#111' }}>{value}</span>
    </div>
  );
}

function SoapRow({ label, color, text }: { label: string; color: string; text: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
      <span style={{ fontWeight: 700, fontSize: 12, color, flexShrink: 0, width: 16 }}>{label}</span>
      <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', flex: 1 }}>{text}</p>
    </div>
  );
}
