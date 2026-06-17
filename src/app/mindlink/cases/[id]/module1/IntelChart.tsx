'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell, LabelList,
} from 'recharts';

// ── 분류 ─────────────────────────────────────────────────────
export function classifyIndex(score: number): { label: string; color: string } {
  if (score >= 130) return { label: '최우수',  color: '#6366f1' };
  if (score >= 120) return { label: '우수',    color: '#3b82f6' };
  if (score >= 110) return { label: '평균상',  color: '#22c55e' };
  if (score >= 90)  return { label: '평균',    color: '#a3e635' };
  if (score >= 80)  return { label: '평균하',  color: '#f59e0b' };
  if (score >= 70)  return { label: '경계선',  color: '#f97316' };
  return              { label: '매우낮음', color: '#ef4444' };
}

export function classifyScaled(score: number): { label: string; color: string } {
  if (score >= 16) return { label: '최우수',  color: '#6366f1' };
  if (score >= 13) return { label: '평균상',  color: '#3b82f6' };
  if (score >= 8)  return { label: '평균',    color: '#22c55e' };
  if (score >= 6)  return { label: '평균하',  color: '#f59e0b' };
  if (score >= 4)  return { label: '낮음',    color: '#f97316' };
  return             { label: '매우낮음', color: '#ef4444' };
}

// ── 커스텀 툴팁 ───────────────────────────────────────────────
function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { name: string; score: number; classify: string; color: string } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg px-3 py-2 text-sm border border-white/10" style={{ background: '#0f172a' }}>
      <p className="text-white font-semibold">{d.name}</p>
      <p className="text-white/60">점수: <span className="text-white font-bold">{d.score}</span></p>
      <p style={{ color: d.color }}>{d.classify}</p>
    </div>
  );
}

// ── 지수점수 차트 ─────────────────────────────────────────────
interface IndexEntry { name: string; score: number; classify: string; color: string }

export function IndexScoreChart({ scores, intelName }: { scores: Record<string, string>; intelName: string }) {
  const indexKeys =
    intelName === 'K-WAIS-IV' ? [
      { key: 'VCI', label: '언어이해' }, { key: 'PRI', label: '지각추론' },
      { key: 'WMI', label: '작업기억' }, { key: 'PSI', label: '처리속도' },
      { key: 'FSIQ', label: '전체IQ' },
    ] :
    intelName === 'K-WISC-V' ? [
      { key: 'VCI', label: '언어이해' }, { key: 'VSI', label: '시공간' },
      { key: 'FRI', label: '유동추론' }, { key: 'WMI', label: '작업기억' },
      { key: 'PSI', label: '처리속도' }, { key: 'FSIQ', label: '전체IQ' },
    ] : [
      { key: 'FSIQ', label: '전체IQ' },
    ];

  const data: IndexEntry[] = indexKeys
    .map(({ key, label }) => {
      const v = Number(scores[key]);
      if (!v || isNaN(v)) return null;
      const { label: classify, color } = classifyIndex(v);
      return { name: label, score: v, classify, color };
    })
    .filter(Boolean) as IndexEntry[];

  if (data.length === 0) return <p className="text-white/30 text-xs text-center py-6">점수를 입력하면 그래프가 표시됩니다.</p>;

  return (
    <div>
      <p className="text-white/50 text-xs mb-2 text-center">지수점수 (평균=100, SD=15)</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 48, right: 60, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" domain={[40, 160]} tick={{ fill: '#64748b', fontSize: 10 }} tickCount={7} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={44} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <ReferenceLine x={100} stroke="#6366f1" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: '100', fill: '#6366f1', fontSize: 10, position: 'top' }} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}
            <LabelList dataKey="score" position="right" style={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 700 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* 범례 */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
        {data.map(d => (
          <span key={d.name} className="text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: d.color }} />
            <span className="text-white/50">{d.name}</span>
            <span className="font-semibold" style={{ color: d.color }}>{d.classify}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── 소검사 환산점수 차트 ──────────────────────────────────────
interface ScaledEntry { name: string; score: number; classify: string; color: string; domain: string }

const WAIS4_DOMAIN_KEYS: Record<string, string[]> = {
  '언어이해': ['SI','VC','IN','CO'],
  '지각추론': ['BD','MR','VP','FW','PCm'],
  '작업기억': ['DS','AR','LN'],
  '처리속도': ['SS','CD','CA'],
};
const WISC5_DOMAIN_KEYS: Record<string, string[]> = {
  '언어이해': ['SI','VC','IN','CO'],
  '시공간':   ['BD','VP'],
  '유동추론': ['MR','FW','PCn','AR'],
  '작업기억': ['DS','PS','LN'],
  '처리속도': ['CD','SS','CA'],
};

const DOMAIN_COLORS: Record<string, string> = {
  '언어이해': '#3b82f6', '지각추론': '#8b5cf6',
  '시공간':   '#ec4899', '유동추론': '#f59e0b',
  '작업기억': '#22c55e', '처리속도': '#06b6d4',
};

export function SubtestChart({ scores, intelName }: { scores: Record<string, string>; intelName: string }) {
  const domainMap = intelName === 'K-WISC-V' ? WISC5_DOMAIN_KEYS : WAIS4_DOMAIN_KEYS;

  const data: ScaledEntry[] = Object.entries(domainMap).flatMap(([domain, keys]) =>
    keys.map(key => {
      const v = Number(scores[key]);
      if (!v || isNaN(v)) return null;
      const { label: classify, color } = classifyScaled(v);
      return { name: key, score: v, classify, color, domain };
    }).filter(Boolean) as ScaledEntry[]
  );

  if (data.length === 0) return <p className="text-white/30 text-xs text-center py-6">소검사 점수를 입력하면 그래프가 표시됩니다.</p>;

  return (
    <div>
      <p className="text-white/50 text-xs mb-2 text-center">소검사 환산점수 (평균=10, SD=3)</p>
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 28 + 30)}>
        <BarChart data={data} layout="vertical" margin={{ left: 32, right: 52, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" domain={[1, 19]} ticks={[1,4,7,10,13,16,19]} tick={{ fill: '#64748b', fontSize: 10 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={30} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <ReferenceLine x={10} stroke="#6366f1" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: '10', fill: '#6366f1', fontSize: 10, position: 'top' }} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {data.map((d, i) => <Cell key={i} fill={DOMAIN_COLORS[d.domain] ?? '#6b7280'} fillOpacity={0.85} />)}
            <LabelList dataKey="score" position="right" style={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 700 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* 도메인 범례 */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
        {Object.entries(DOMAIN_COLORS).filter(([d]) => data.some(e => e.domain === d)).map(([domain, color]) => (
          <span key={domain} className="text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
            <span style={{ color }}>{domain}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
