'use client';
import { useRef, useEffect, useState } from 'react';

// 9-cell grid layout: [row, col]
const CELL_META: Record<string, { label: string; row: number; col: number; color: string }> = {
  attention:         { label: '주의',     row: 0, col: 0, color: '#3b82f6' },
  cognition:         { label: '인지',     row: 0, col: 1, color: '#8b5cf6' },
  self:              { label: '자기',     row: 0, col: 2, color: '#06b6d4' },
  emotion:           { label: '정서',     row: 1, col: 0, color: '#ec4899' },
  behavior:          { label: '행동',     row: 1, col: 1, color: '#f59e0b' },
  motivation:        { label: '동기',     row: 1, col: 2, color: '#10b981' },
  bio_physiological: { label: '생물생리', row: 2, col: 0, color: '#ef4444' },
  context:           { label: '맥락',     row: 2, col: 1, color: '#a78bfa' },
  socio_cultural:    { label: '사회문화', row: 2, col: 2, color: '#fb923c' },
};

const EDGE_COLORS = {
  causes:     '#ef4444',
  maintains:  '#f59e0b',
  correlates: '#94a3b8',
  protects:   '#22c55e',
};

interface GridCell {
  key_concepts: string[];
  maladaptive_pattern: string;
  clinical_indicators: string;
}

interface Edge {
  from: string;
  to: string;
  type: keyof typeof EDGE_COLORS;
  label: string;
}

interface Props {
  grid: Record<string, GridCell>;
  edges: Edge[];
}

function getCellCenter(key: string, W: number, H: number) {
  const meta = CELL_META[key];
  if (!meta) return { x: W / 2, y: H / 2 };
  const cw = W / 3, ch = H / 3;
  return { x: meta.col * cw + cw / 2, y: meta.row * ch + ch / 2 };
}

function shorten(x1: number, y1: number, x2: number, y2: number, margin: number) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < margin * 2) return { x1, y1, x2, y2 };
  return {
    x1: x1 + (dx / len) * margin,
    y1: y1 + (dy / len) * margin,
    x2: x2 - (dx / len) * margin,
    y2: y2 - (dy / len) * margin,
  };
}

export default function EEMMNetwork({ grid, edges }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 900, h: 540 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDims({ w: width, h: Math.round(width * 0.6) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const { w, h } = dims;
  const cellW = w / 3, cellH = h / 3;
  const margin = Math.min(cellW, cellH) * 0.38;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      {/* 3×3 grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: `repeat(3, ${Math.round(h / 3)}px)`,
        gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 12, overflow: 'hidden',
      }}>
        {Object.entries(CELL_META).map(([key, meta]) => {
          const cell = grid?.[key];
          return (
            <div key={key} style={{
              background: '#0f172a',
              border: `1px solid ${meta.color}25`,
              padding: '10px 12px',
              display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden',
            }}>
              {/* header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: meta.color }}>{meta.label}</span>
              </div>
              {/* concepts */}
              {cell?.key_concepts?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {cell.key_concepts.slice(0, 3).map((c, i) => (
                    <span key={i} style={{
                      fontSize: 9, padding: '2px 6px', borderRadius: 4,
                      background: meta.color + '20', color: meta.color,
                      whiteSpace: 'nowrap', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{c}</span>
                  ))}
                </div>
              ) : null}
              {/* pattern */}
              {cell?.maladaptive_pattern ? (
                <p style={{
                  fontSize: 10, color: 'rgba(255,255,255,0.55)', lineHeight: 1.45,
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                  margin: 0,
                }}>{cell.maladaptive_pattern}</p>
              ) : (
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', margin: 0 }}>자료 없음</p>
              )}
            </div>
          );
        })}
      </div>

      {/* SVG arrow overlay */}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          {Object.entries(EDGE_COLORS).map(([type, color]) => (
            <marker key={type} id={`arrow-${type}`} markerWidth="7" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 7 3, 0 6" fill={color} opacity="0.8" />
            </marker>
          ))}
        </defs>
        {(edges ?? []).map((edge, i) => {
          if (!CELL_META[edge.from] || !CELL_META[edge.to]) return null;
          if (edge.from === edge.to) return null;
          const c1 = getCellCenter(edge.from, w, h);
          const c2 = getCellCenter(edge.to, w, h);
          const { x1, y1, x2, y2 } = shorten(c1.x, c1.y, c2.x, c2.y, margin);
          const color = EDGE_COLORS[edge.type] ?? '#94a3b8';
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          return (
            <g key={i}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={color} strokeWidth="1.5" opacity="0.7"
                markerEnd={`url(#arrow-${edge.type})`}
              />
              {/* label background */}
              <rect
                x={mx - 34} y={my - 8} width={68} height={14} rx={3}
                fill="#0f172a" opacity="0.85"
              />
              <text x={mx} y={my + 4} textAnchor="middle"
                style={{ fontSize: 9, fill: color, opacity: 0.9, fontWeight: 600 }}>
                {edge.label?.slice(0, 14)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
        {Object.entries(EDGE_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width={28} height={10}>
              <line x1={0} y1={5} x2={22} y2={5} stroke={color} strokeWidth={1.5} markerEnd={`url(#arrow-${type})`} />
            </svg>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
              {{ causes: '유발', maintains: '유지', correlates: '상관', protects: '보호' }[type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
