'use client';
import { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/fetch-with-auth';
import { computeStaleness, type CaseBundle } from '@/lib/staleness';
import { notifyUpdate, listenForUpdates } from '@/lib/case-sync';
import StalenessBanner from '@/components/mindlink/StalenessBanner';

interface Report {
  referral_background: string; test_results_summary: string; cognitive_function: string;
  emotional_personality: string; interpersonal: string; expected_diagnosis: string;
  treatment_recommendations: string; summary: string;
}

const sectionLabels: { key: keyof Report; label: string; icon: string }[] = [
  { key: 'referral_background', label: '의뢰 배경 및 주호소', icon: '📋' },
  { key: 'test_results_summary', label: '검사 결과 개요', icon: '📊' },
  { key: 'cognitive_function', label: '인지기능', icon: '🧩' },
  { key: 'emotional_personality', label: '정서 및 성격', icon: '💛' },
  { key: 'interpersonal', label: '대인관계', icon: '👥' },
  { key: 'expected_diagnosis', label: '예상 진단', icon: '🔍' },
  { key: 'treatment_recommendations', label: '치료 권고사항', icon: '🎯' },
  { key: 'summary', label: '종합 요약', icon: '📝' },
];

export default function Module2({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [bundle, setBundle] = useState<CaseBundle>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const generateRef = useRef<HTMLButtonElement>(null);

  async function loadData() {
    const res = await fetchWithAuth(`/api/mindlink/cases/${id}`);
    if (!res.ok) return;
    const d = await res.json();
    if (d.psych_report) setReport(d.psych_report);
    setBundle({ sessions: d.sessions, tests: d.tests, psych_report: d.psych_report, conceptualization: d.conceptualization, intervention: d.intervention, outcomes: d.outcomes });
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    const cleanup = listenForUpdates(id, loadData);
    const timer = setInterval(loadData, 60_000);
    return () => { cleanup(); clearInterval(timer); };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function generate() {
    setGenerating(true); setError('');
    const res = await fetchWithAuth('/api/mindlink/ai/report', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: id }),
    });
    if (res.ok) {
      const d = await res.json();
      setReport(d.report);
      notifyUpdate(id);
      await loadData();
    } else {
      const d = await res.json(); setError(d.error ?? 'AI 오류');
    }
    setGenerating(false);
  }

  const staleness = computeStaleness(bundle);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
        <Link href="/mindlink" className="hover:text-white/70 transition-colors">사례 관리</Link>
        <span>›</span>
        <Link href={`/mindlink/cases/${id}`} className="hover:text-white">사례</Link>
        <span>›</span>
        <span className="text-white/70">심리검사 보고서</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">심리검사 보고서</h1>
          <p className="text-white/40 text-xs mt-1">GPT-4o 기반 통합 심리평가 보고서</p>
        </div>
        <button ref={generateRef} onClick={generate} disabled={generating}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 disabled:opacity-60 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
          {generating ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>생성 중...</span></> : <span>{report ? '재생성' : 'AI 보고서 생성'}</span>}
        </button>
      </div>

      {staleness.m2 && (
        <StalenessBanner
          sources={staleness.m2Sources}
          onRegenerate={() => { generateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); generate(); }}
        />
      )}

      {error && <div className="rounded-xl p-4 mb-4 border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>}

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: '#1e293b' }} />)}</div>
      ) : !report ? (
        <div className="text-center py-20 text-white/30">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-sm">보고서가 없습니다</p>
          <p className="text-xs mt-1">회기 기록과 심리검사 결과를 입력한 후 AI 보고서를 생성하세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sectionLabels.map(({ key, label, icon }) => report[key] && (
            <div key={key} className="rounded-xl p-5 border border-white/10" style={{ background: '#1e293b' }}>
              <h3 className="text-white/60 text-xs font-medium mb-2">{icon} {label}</h3>
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{report[key]}</p>
            </div>
          ))}
          <div className="text-right text-white/20 text-xs">AI Generated — 임상가의 검토 및 수정 필요</div>
        </div>
      )}
    </div>
  );
}
