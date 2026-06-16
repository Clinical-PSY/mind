'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { calculateStructuralSummary, summaryToScores, RorschachResponse } from '@/lib/rorschach-calc';

// ── 옵션 목록 ──────────────────────────────────────────────────
const CARDS    = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
const LOCS     = ['W','D','Dd','WS','DS','DdS'];
const DQ_LIST  = ['+','o','v/+','v'];
const DETS     = [
  'F',
  'Ma','Mp','Ma-p',
  'FMa','FMp','FMa-p',
  'ma','mp','ma-p',
  'FC','CF','C','Cn',
  "FC'","C'F","C'",
  'FT','TF','T',
  'FV','VF','V',
  'FY','YF','Y',
  'FD','Fr','rF',
];
const FQ_LIST  = ['+','o','u','-','none'];
const CONTS    = [
  'H','(H)','Hd','(Hd)','Hx',
  'A','(A)','Ad','(Ad)',
  'An','Art','Ay','Bl','Bt','Cg','Cl','Ex',
  'Fd','Fi','Ge','Hh','Ls','Na','Sc','Sx','Xy','Id',
];
const Z_TYPES  = ['ZW','ZA','ZD','ZS'];
const SS_LIST  = [
  'DV1','INCOM1','DR1','FABCOM1','ALOG','CONTAM',
  'DV2','INCOM2','DR2','FABCOM2',
  'AB','AG','COP','CP','MOR','PER','PSV',
];

function newResponse(id: string): RorschachResponse {
  return { id, card: '', location: 'W', dq: 'o', determinants: ['F'], fq: 'o', pair: false, contents: [], popular: false, zScore: '', specialScores: [] };
}

// ── 다중 태그 선택기 ────────────────────────────────────────────
function TagSelect({ values, options, onChange, maxItems = 6, placeholder = '+ 추가' }: {
  values: string[]; options: string[]; onChange: (v: string[]) => void;
  maxItems?: number; placeholder?: string;
}) {
  const avail = options.filter(o => !values.includes(o));
  return (
    <div className="flex flex-wrap gap-0.5 min-w-[56px] max-w-[160px]">
      {values.map(v => (
        <button key={v} type="button"
          onClick={() => onChange(values.filter(x => x !== v))}
          className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] bg-indigo-600/50 text-white/85 hover:bg-red-600/50 leading-tight">
          {v}<span className="opacity-50">×</span>
        </button>
      ))}
      {avail.length > 0 && values.length < maxItems && (
        <select
          className="text-[9px] h-[18px] rounded bg-white/5 text-white/40 outline-none cursor-pointer px-0.5 leading-tight"
          value="" onChange={e => { if (e.target.value) onChange([...values, e.target.value]); }}>
          <option value="">{placeholder}</option>
          {avail.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
    </div>
  );
}

interface Props {
  onDataChange: (scores: Record<string, string>, rawData: string) => void;
  initialRawData?: string;
}

export default function RorschachCoding({ onDataChange, initialRawData }: Props) {
  const [responses, setResponses] = useState<RorschachResponse[]>(() => {
    if (initialRawData) {
      try { return JSON.parse(initialRawData) as RorschachResponse[]; } catch { /* */ }
    }
    return [newResponse('1')];
  });

  const summary = useMemo(() => calculateStructuralSummary(responses), [responses]);
  const scores  = useMemo(() => summaryToScores(summary), [summary]);

  useEffect(() => {
    onDataChange(scores, JSON.stringify(responses));
  }, [scores, responses, onDataChange]);

  const updateResp = useCallback((id: string, patch: Partial<RorschachResponse>) => {
    setResponses(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }, []);

  const addRow = () => {
    setResponses(prev => [...prev, newResponse(String(Date.now()))]);
  };

  const removeRow = (id: string) => {
    setResponses(prev => prev.length === 1 ? prev : prev.filter(r => r.id !== id));
  };

  const sel = 'h-[22px] text-[10px] rounded bg-slate-700/80 text-white border border-white/10 outline-none focus:border-indigo-400 px-0.5';
  const chk = 'w-3.5 h-3.5 rounded accent-indigo-500 cursor-pointer';

  return (
    <div className="space-y-4">
      {/* 입력 테이블 */}
      <div className="rounded-lg border border-white/10 overflow-hidden" style={{ background: '#111827' }}>
        <div className="px-3 py-2 border-b border-white/8 flex items-center justify-between">
          <span className="text-white/60 text-xs font-semibold">반응 코딩 입력</span>
          <span className="text-white/30 text-[10px]">R = {summary.R}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[10px]" style={{ minWidth: '760px' }}>
            <thead>
              <tr className="border-b border-white/8">
                {['#','카드','위치','DQ','결정인','FQ','쌍','내용','P','Z','특수점수',''].map((h, i) => (
                  <th key={i} className="px-1.5 py-1.5 text-white/35 font-medium text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((resp, idx) => (
                <tr key={resp.id} className="border-b border-white/5 hover:bg-white/2">
                  {/* # */}
                  <td className="px-1.5 py-1 text-white/30 w-5 text-center">{idx + 1}</td>

                  {/* Card */}
                  <td className="px-1 py-1">
                    <select value={resp.card} onChange={e => updateResp(resp.id, { card: e.target.value })} className={sel}>
                      <option value="">—</option>
                      {CARDS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </td>

                  {/* Location */}
                  <td className="px-1 py-1">
                    <select value={resp.location} onChange={e => updateResp(resp.id, { location: e.target.value })} className={sel}>
                      {LOCS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </td>

                  {/* DQ */}
                  <td className="px-1 py-1">
                    <select value={resp.dq} onChange={e => updateResp(resp.id, { dq: e.target.value })} className={sel}>
                      {DQ_LIST.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </td>

                  {/* Determinants */}
                  <td className="px-1 py-1 min-w-[100px]">
                    <TagSelect
                      values={resp.determinants}
                      options={DETS}
                      onChange={v => updateResp(resp.id, { determinants: v })}
                      placeholder="+ 결정인"
                    />
                  </td>

                  {/* FQ */}
                  <td className="px-1 py-1">
                    <select value={resp.fq} onChange={e => updateResp(resp.id, { fq: e.target.value })} className={sel}>
                      {FQ_LIST.map(q => <option key={q}>{q}</option>)}
                    </select>
                  </td>

                  {/* Pair */}
                  <td className="px-1 py-1 text-center">
                    <input type="checkbox" checked={resp.pair}
                      onChange={e => updateResp(resp.id, { pair: e.target.checked })} className={chk} />
                  </td>

                  {/* Contents */}
                  <td className="px-1 py-1 min-w-[90px]">
                    <TagSelect
                      values={resp.contents}
                      options={CONTS}
                      onChange={v => updateResp(resp.id, { contents: v })}
                      placeholder="+ 내용"
                    />
                  </td>

                  {/* Popular */}
                  <td className="px-1 py-1 text-center">
                    <input type="checkbox" checked={resp.popular}
                      onChange={e => updateResp(resp.id, { popular: e.target.checked })} className={chk} />
                  </td>

                  {/* Z */}
                  <td className="px-1 py-1">
                    <select value={resp.zScore} onChange={e => updateResp(resp.id, { zScore: e.target.value })} className={sel}>
                      <option value="">—</option>
                      {Z_TYPES.map(z => <option key={z}>{z}</option>)}
                    </select>
                  </td>

                  {/* Special Scores */}
                  <td className="px-1 py-1 min-w-[90px]">
                    <TagSelect
                      values={resp.specialScores}
                      options={SS_LIST}
                      onChange={v => updateResp(resp.id, { specialScores: v })}
                      placeholder="+ 특수"
                      maxItems={6}
                    />
                  </td>

                  {/* Delete */}
                  <td className="px-1 py-1 text-center">
                    <button type="button" onClick={() => removeRow(resp.id)}
                      className="w-4 h-4 rounded text-white/25 hover:text-red-400 hover:bg-red-400/10 text-[10px] leading-none transition-colors">
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-3 py-2 border-t border-white/8">
          <button type="button" onClick={addRow}
            className="px-3 py-1 rounded-lg text-white/60 text-xs border border-white/10 hover:bg-white/5 hover:text-white/80 transition-colors">
            + 반응 추가
          </button>
        </div>
      </div>

      {/* 자동 계산된 구조적 요약 */}
      {summary.R > 0 && (
        <div className="rounded-lg border border-indigo-500/20 overflow-hidden" style={{ background: '#111827' }}>
          <div className="px-3 py-2 border-b border-white/8 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block"></span>
            <span className="text-white/60 text-xs font-semibold">자동 계산된 구조적 요약</span>
            <span className="text-white/25 text-[10px]ml-auto">코딩 입력 시 실시간 반영</span>
          </div>
          <div className="p-3">
            <SummaryGrid s={summary} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── 구조적 요약 읽기 전용 그리드 ──────────────────────────────────
function SummaryGrid({ s }: { s: ReturnType<typeof calculateStructuralSummary> }) {
  const n = (v: number | string | boolean, dec = 0) => {
    if (typeof v === 'boolean') return v ? 'Y' : 'N';
    if (typeof v === 'string') return v;
    if (!isFinite(v) || isNaN(v)) return '—';
    return dec > 0 ? v.toFixed(dec) : String(Math.round(v));
  };
  const pct = (v: number) => isNaN(v) || !isFinite(v) ? '—' : (v * 100).toFixed(1) + '%';

  type BoxItem = [string, string | number];
  function Box({ title, color, items }: { title: string; color: string; items: BoxItem[] }) {
    return (
      <div className="rounded-lg p-2.5 border border-white/8" style={{ background: '#1a2744' }}>
        <div className="text-center text-[10px] font-bold py-0.5 rounded mb-2"
          style={{ background: color + '22', color, border: `1px solid ${color}33` }}>
          {title}
        </div>
        <div className="space-y-0.5">
          {items.map(([label, val]) => (
            <div key={label} className="flex items-center justify-between gap-1 min-h-[16px]">
              <span className="text-white/40 text-[10px] leading-tight">{label}</span>
              <span className="text-white text-[10px] font-mono tabular-nums">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const adjD_val = parseInt(s.AdjD);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        <Box title="Core" color="#fcd34d" items={[
          ['R', n(s.R)], ['Lambda', typeof s.Lambda === 'number' ? n(s.Lambda,2) : s.Lambda as string],
          ['EB', `${n(s.M)} : ${n(s.WSumC,1)}`], ['EA', n(s.EA,1)],
          ['EBPer', typeof s.EBPer === 'number' ? n(s.EBPer,1) : s.EBPer as string],
          ['eb', `${n(s.eb_left)} : ${n(s.eb_right)}`], ['es', n(s.es)],
          ['Adj es', n(s.AdjEs)], ['D', s.D_score], ['Adj D', s.AdjD],
          ['FM', n(s.FM)], ['m', n(s.m)],
          ["SumC'", n(s.SumCp)], ['SumT', n(s.SumT)], ['SumV', n(s.SumV)], ['SumY', n(s.SumY)],
        ]} />
        <Box title="Affection" color="#f9a8d4" items={[
          ['FC:CF+C', `${n(s.FC)} : ${n(s.CF+s.C)}`],
          ['Pure C', n(s.C)],
          ["SumC':WSumC", `${n(s.SumCp)} : ${n(s.WSumC,1)}`],
          ['Afr', n(s.Afr,2)],
          ['S', n(s.S)],
          ['Blends:R', `${n(s.Blends)} : ${n(s.R)}`],
          ['CP', n(s.CP_ss)],
        ]} />
        <Box title="Interpersonal" color="#86efac" items={[
          ['COP', n(s.COP)], ['AG', n(s.AG)],
          ['GHR:PHR', `${n(s.GHR)} : ${n(s.PHR)}`],
          ['a:p', `${n(s.a)} : ${n(s.p)}`],
          ['Food', n(s.Fd)], ['SumT', n(s.SumT)],
          ['Human Cont', n(s.HumanCont)],
          ['PureH', n(s.H)], ['PER', n(s.PER)],
          ['ISO Idx', n(s.ISOIndex,2)],
        ]} />
        <Box title="Special Indices" color="#c4b5fd" items={[
          ['PTI', n(s.PTI)],
          ['DEPI', n(s.DEPI)],
          ['CDI', n(s.CDI)],
          ['S-CON', n(s.SCON)],
          ['HVI', n(s.HVI)],
          ['OBS', n(s.OBS)],
          ['—', ''],
          ['Sum6', n(s.Sum6)],
          ['WSum6', n(s.WSum6)],
          ['Lv2', n(s.Lv2)],
        ]} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Box title="Ideation" color="#93c5fd" items={[
          ['a:p', `${n(s.a)} : ${n(s.p)}`],
          ['Ma:Mp', `${n(s.Ma_count)} : ${n(s.Mp_count)}`],
          ['2AB+Art+Ay', n(s.twoABArtAy)],
          ['MOR', n(s.MOR)],
          ['Sum6', n(s.Sum6)], ['Lv2', n(s.Lv2)],
          ['WSum6', n(s.WSum6)],
          ['M-', n(s.Mminus)], ['Mnone', n(s.Mnone)],
        ]} />
        <Box title="Cognitive Mediation" color="#fde68a" items={[
          ['XA%', pct(s.XApct)],
          ['WDA%', pct(s.WDApct)],
          ['X-%', pct(s.Xminuspct)],
          ['S-', n(s.Sminus)],
          ['P', n(s.P)],
          ['X+%', pct(s.Xpluspct)],
          ['Xu%', pct(s.Xupct)],
        ]} />
        <Box title="Info Processing" color="#6ee7b7" items={[
          ['Zf', n(s.Zf)],
          ['ZSum', n(s.ZSum,1)],
          ['ZEst', n(s.ZEst,1)],
          ['Zd', n(s.Zd,1)],
          ['W:D:Dd', `${n(s.W)}:${n(s.D)}:${n(s.Dd)}`],
          ['W:M', `${n(s.W)} : ${n(s.M)}`],
          ['PSV', n(s.PSV)],
          ['DQ+', n(s.DQplus)], ['DQv', n(s.DQv)],
        ]} />
        <Box title="Self-Perception" color="#fca5a5" items={[
          ['3r+(2)/R', n(s.egocentricity,2)],
          ['Fr+rF', n(s.FrplusrF)],
          ['SumV', n(s.SumV)],
          ['FD', n(s.FD)],
          ['An+Xy', n(s.An + s.Xy)],
          ['MOR', n(s.MOR)],
          ['H:(H)+Hd+(Hd)', `${n(s.H)} : ${n(s.Hparen+s.Hd+s.Hdparen)}`],
        ]} />
      </div>
    </div>
  );
}
