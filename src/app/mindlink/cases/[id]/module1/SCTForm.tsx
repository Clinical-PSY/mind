'use client';
import { useState, useMemo } from 'react';

// ── 성인용 SCT 50문항 ─────────────────────────────────────────
const SCT_ITEMS = [
  '나에게 이상한 일이 생겼을 때',
  '내 생각에 가끔 아버지는',
  '우리 윗사람들은',
  '나의 장래는',
  '어리석게도 내가 두려워하는 것은',
  '내 생각에 참다운 친구는',
  '내가 어렸을 때는',
  '남자에 대해서 무엇보다 좋지 않게 생각하는 것은',
  '내가 바라는 여인상(女人像)은',
  '남녀가 같이 있는 것을 볼 때',
  '내가 늘 원하기는',
  '다른 가정과 비교해서 우리 집안은',
  '나의 어머니는',
  '무슨 일을 해서라도 잊고 싶은 것은',
  '내가 믿고 있는 내 능력은',
  '내가 정말 행복할 수 있으려면',
  '어렸을 때 잘못했다고 느끼는 것은',
  '내가 보는 나의 앞날은',
  '대개 아버지들이란',
  '내 생각에 남자들이란',
  '다른 친구들이 모르는 나만의 두려움은',
  '내가 싫어하는 사람은',
  '결혼 생활에 대한 나의 생각은',
  '우리 가족이 나에 대해서',
  '내 생각에 여자들이란',
  '어머니와 나는',
  '내가 저지른 가장 큰 잘못은',
  '언젠가 나는',
  '내가 바라기에 아버지는',
  '나의 야망은',
  '윗사람이 오는 것을 보면 나는',
  '내가 제일 좋아하는 사람은',
  '내가 다시 젊어진다면',
  '나의 가장 큰 결점은',
  '내가 아는 대부분의 집안은',
  '완전한 남성상(男性像)은',
  '내가 성교를 했다면',
  '행운이 나를 외면했을 때',
  '대개 어머니들이란',
  '내가 잊고 싶은 두려움은',
  '내가 평생 가장 하고 싶은 일은',
  '내가 늙으면',
  '때때로 두려운 생각이 나를 휩쌀 때',
  '내가 없을 때 친구들은',
  '생생한 어린 시절의 기억은',
  '무엇보다도 좋지 않게 여기는 것은',
  '나의 성 생활은',
  '내가 어렸을 때 우리 가족은',
  '나는 어머니를 좋아했지만',
  '아버지와 나는',
];

// 주제별 그룹 (채점 및 해석 시 활용)
const SCT_GROUPS = [
  { label: '가족 — 어머니',  color: '#ec4899', items: [13, 26, 39, 49, 50] },
  { label: '가족 — 아버지',  color: '#f97316', items: [2, 19, 29, 50] },
  { label: '가족 — 가정',    color: '#f59e0b', items: [12, 24, 35, 48] },
  { label: '성 (性)',         color: '#8b5cf6', items: [8, 9, 10, 20, 25, 36, 37, 47] },
  { label: '대인관계',       color: '#3b82f6', items: [3, 6, 22, 31, 32, 44] },
  { label: '자기 개념',      color: '#22c55e', items: [15, 34, 46] },
  { label: '포부 / 미래',    color: '#06b6d4', items: [4, 11, 18, 28, 30, 41, 42] },
  { label: '두려움 / 죄책감', color: '#ef4444', items: [5, 14, 17, 21, 27, 38, 40, 43] },
  { label: '과거',           color: '#6b7280', items: [7, 33, 45] },
  { label: '기타',           color: '#a3a3a3', items: [1, 16, 23] },
];

// ── 유틸 ─────────────────────────────────────────────────────
function parseResponses(raw: string): Record<number, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  } catch { /**/ }
  return {};
}

// ── 컴포넌트 ─────────────────────────────────────────────────
interface Props {
  rawData: string;
  onChange: (rawData: string) => void;
}

export default function SCTForm({ rawData, onChange }: Props) {
  const [tab, setTab] = useState<'input' | 'group' | 'preview'>('input');
  const [responses, setResponses] = useState<Record<number, string>>(() => parseResponses(rawData));
  const [filter, setFilter] = useState('');

  function update(num: number, value: string) {
    const next = { ...responses, [num]: value };
    setResponses(next);
    onChange(JSON.stringify(next));
  }

  const filledCount = useMemo(() => Object.values(responses).filter(v => v.trim()).length, [responses]);

  const filteredItems = useMemo(() =>
    SCT_ITEMS.map((stem, i) => ({ num: i + 1, stem }))
      .filter(({ num, stem }) =>
        !filter || stem.includes(filter) || (responses[num] ?? '').includes(filter)
      ),
    [filter, responses]
  );

  return (
    <div className="flex flex-col" style={{ minHeight: 0 }}>
      {/* 탭 헤더 */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#0f172a' }}>
          {([
            { key: 'input',   label: '✏️ 문항 입력' },
            { key: 'group',   label: '🏷️ 주제별 보기' },
            { key: 'preview', label: '📄 전체 미리보기' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${tab === t.key ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              style={tab === t.key ? { background: '#3b82f6' } : {}}>
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-white/30 text-xs">{filledCount} / {SCT_ITEMS.length}문항 작성</span>
      </div>

      {/* ── 문항 입력 탭 ── */}
      {tab === 'input' && (
        <div className="flex flex-col min-h-0">
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="문항 검색..."
            className="w-full rounded-lg px-3 py-1.5 text-white text-xs bg-white/5 border border-white/10 outline-none focus:border-indigo-400 mb-3 shrink-0"
          />
          <div className="overflow-y-auto space-y-1.5 pr-1" style={{ maxHeight: '420px' }}>
            {filteredItems.map(({ num, stem }) => (
              <div key={num} className="flex gap-2 items-start group rounded-lg px-3 py-2 border border-white/5 hover:border-white/10 transition-colors"
                style={{ background: responses[num]?.trim() ? 'rgba(59,130,246,0.04)' : 'rgba(255,255,255,0.02)' }}>
                <span className="text-white/25 text-xs font-mono w-5 shrink-0 mt-1.5 text-right">{num}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-xs mb-1 leading-relaxed">{stem}</p>
                  <input
                    type="text"
                    value={responses[num] ?? ''}
                    onChange={e => update(num, e.target.value)}
                    placeholder="반응을 입력하세요..."
                    className="w-full rounded-md px-2.5 py-1.5 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-blue-400 placeholder:text-white/15"
                  />
                </div>
                {responses[num]?.trim() && (
                  <button onClick={() => update(num, '')} className="text-white/15 hover:text-red-400 text-xs mt-1.5 shrink-0 opacity-0 group-hover:opacity-100">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 주제별 보기 탭 ── */}
      {tab === 'group' && (
        <div className="overflow-y-auto space-y-3 pr-1" style={{ maxHeight: '460px' }}>
          {SCT_GROUPS.map(g => {
            const filled = g.items.filter(n => responses[n]?.trim()).length;
            return (
              <div key={g.label} className="rounded-xl border border-white/10 overflow-hidden" style={{ background: '#0f172a' }}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: g.color }} />
                  <span className="text-xs font-semibold" style={{ color: g.color }}>{g.label}</span>
                  <span className="text-white/20 text-xs ml-auto">{filled}/{g.items.length}</span>
                </div>
                <div className="divide-y divide-white/5">
                  {g.items.map(num => (
                    <div key={num} className="px-4 py-2 flex gap-2 items-start">
                      <span className="text-white/20 text-xs font-mono w-5 shrink-0 mt-1">{num}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/40 text-xs mb-0.5">{SCT_ITEMS[num - 1]}</p>
                        <input
                          type="text"
                          value={responses[num] ?? ''}
                          onChange={e => update(num, e.target.value)}
                          placeholder="반응 입력..."
                          className="w-full rounded-md px-2.5 py-1 text-white text-sm bg-white/5 border border-white/10 outline-none focus:border-blue-400 placeholder:text-white/15"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 전체 미리보기 탭 ── */}
      {tab === 'preview' && (
        <div className="overflow-y-auto pr-1 space-y-0.5" style={{ maxHeight: '460px' }}>
          <div className="rounded-xl border border-white/10 overflow-hidden divide-y divide-white/5" style={{ background: '#0f172a' }}>
            {SCT_ITEMS.map((stem, i) => {
              const num = i + 1;
              const resp = responses[num] ?? '';
              return (
                <div key={num} className={`px-4 py-2 flex gap-3 text-xs ${resp.trim() ? '' : 'opacity-40'}`}>
                  <span className="text-white/30 font-mono w-5 shrink-0">{num}</span>
                  <span className="text-white/50 shrink-0 min-w-0" style={{ maxWidth: '45%' }}>{stem}</span>
                  <span className="text-white flex-1">{resp || <span className="text-white/20 italic">미작성</span>}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
