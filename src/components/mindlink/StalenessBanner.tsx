'use client';

interface Props {
  sources: string[];
  onRegenerate?: () => void;
}

export default function StalenessBanner({ sources, onRegenerate }: Props) {
  if (!sources.length) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 mb-5 rounded-xl border border-amber-500/25"
      style={{ background: 'rgba(245,158,11,0.07)' }}>
      <span className="text-amber-400 shrink-0" style={{ fontSize: 15 }}>⚡</span>
      <p className="flex-1 text-xs leading-relaxed" style={{ color: 'rgba(251,191,36,0.75)' }}>
        <span className="font-semibold" style={{ color: '#fbbf24' }}>{sources.join(' · ')}</span>
        {' '}— 이전 생성 이후 변경이 있었습니다. 재생성하면 최신 데이터가 반영됩니다.
      </p>
      {onRegenerate && (
        <button onClick={onRegenerate}
          className="shrink-0 px-3 py-1 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
          style={{ background: '#fbbf24', color: '#422006' }}>
          지금 재생성
        </button>
      )}
    </div>
  );
}
