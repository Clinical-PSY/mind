'use client';

// ── 격자 상수 ──────────────────────────────────────────────────
const GW = 900;          // SVG 전체 너비
const GH = 600;          // SVG 전체 높이
const CW = GW / 3;       // 칸 너비 = 300
const CH = GH / 3;       // 칸 높이 = 200
const BOX_W = 116;       // 개념 박스 너비
const BOX_LINE_H = 17;   // 박스 내 텍스트 줄 높이
const BOX_PAD_V = 10;    // 박스 상하 내부 패딩

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

const EDGE_COLORS: Record<string, string> = {
  causes:     '#ef4444',
  maintains:  '#f59e0b',
  correlates: '#94a3b8',
  protects:   '#22c55e',
};
const EDGE_LABELS: Record<string, string> = {
  causes: '유발', maintains: '유지', correlates: '상관', protects: '보호',
};

// ── 타입 ──────────────────────────────────────────────────────
interface GridCell {
  key_concepts?: string[];
  maladaptive_pattern?: string;
  clinical_indicators?: string;
}

interface Edge {
  from: string;
  from_concept?: string;
  to: string;
  to_concept?: string;
  type: string;
  bidirectional?: boolean;
}

interface NodePos {
  x: number;
  y: number;
  lines: string[];
  color: string;
  boxH: number;
}

// ── 유틸 ──────────────────────────────────────────────────────
function wrapKorean(text: string, maxChars = 7): string[] {
  if (!text) return [''];
  const lines: string[] = [];
  for (let i = 0; i < text.length; i += maxChars) lines.push(text.slice(i, i + maxChars));
  return lines;
}

function cellConceptPositions(cellKey: string, count: number): Array<{ x: number; y: number }> {
  const m = CELL_META[cellKey];
  if (!m) return [];
  const cx = m.col * CW + CW / 2;
  const cy = m.row * CH + CH / 2;
  if (count === 0) return [];
  if (count === 1) return [{ x: cx, y: cy }];
  if (count === 2) return [{ x: cx, y: cy - CH * 0.22 }, { x: cx, y: cy + CH * 0.22 }];
  return [{ x: cx, y: cy - CH * 0.27 }, { x: cx, y: cy }, { x: cx, y: cy + CH * 0.27 }];
}

function moveToward(
  ax: number, ay: number,
  bx: number, by: number,
  margin: number,
): { x: number; y: number } {
  const dx = bx - ax, dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return { x: ax, y: ay };
  return { x: ax + (dx / len) * margin, y: ay + (dy / len) * margin };
}

function quadPath(
  x1: number, y1: number,
  x2: number, y2: number,
  curveSide: number, // +1 or -1
): string {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const curvature = len * 0.18 * curveSide;
  const cx = mx + (-dy / len) * curvature;
  const cy = my + (dx / len) * curvature;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

// ── 컴포넌트 ──────────────────────────────────────────────────
export default function EEMMNetwork({
  grid,
  edges,
}: {
  grid: Record<string, GridCell>;
  edges: Edge[];
}) {
  // 1. 노드 위치 계산
  const nodeMap = new Map<string, NodePos>();

  Object.entries(CELL_META).forEach(([cellKey, meta]) => {
    const concepts = (grid?.[cellKey]?.key_concepts ?? []).filter(Boolean).slice(0, 3);
    const positions = cellConceptPositions(cellKey, concepts.length);
    concepts.forEach((concept, i) => {
      const pos = positions[i];
      if (!pos) return;
      const lines = wrapKorean(concept);
      const boxH = lines.length * BOX_LINE_H + BOX_PAD_V * 2;
      nodeMap.set(`${cellKey}::${concept}`, { x: pos.x, y: pos.y, lines, color: meta.color, boxH });
    });
  });

  // 2. 개념 → 노드 위치 조회 (정확 일치 → 셀 내 첫 노드 → 셀 중심 폴백)
  function getPos(cellKey: string, concept?: string): { x: number; y: number; boxH: number } {
    if (concept) {
      const exact = nodeMap.get(`${cellKey}::${concept}`);
      if (exact) return exact;
      for (const [k, v] of nodeMap) {
        if (k.startsWith(`${cellKey}::`) && (concept.length >= 3) && k.includes(concept.slice(0, 3))) return v;
      }
    }
    for (const [k, v] of nodeMap) {
      if (k.startsWith(`${cellKey}::`)) return v;
    }
    const m = CELL_META[cellKey];
    if (!m) return { x: GW / 2, y: GH / 2, boxH: 36 };
    return { x: m.col * CW + CW / 2, y: m.row * CH + CH / 2, boxH: 36 };
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${GW} ${GH}`}
        style={{ width: '100%', maxWidth: GW, display: 'block', fontFamily: 'system-ui,sans-serif' }}
      >
        {/* ── 마커 정의 ── */}
        <defs>
          {Object.entries(EDGE_COLORS).map(([type, color]) => (
            <marker key={`fwd-${type}`} id={`ah-${type}`}
              markerWidth="9" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M 0 0 L 9 4 L 0 8 z" fill={color} opacity="0.9" />
            </marker>
          ))}
          {Object.entries(EDGE_COLORS).map(([type, color]) => (
            <marker key={`rev-${type}`} id={`ah-rev-${type}`}
              markerWidth="9" markerHeight="8" refX="2" refY="4" orient="auto-start-reverse">
              <path d="M 9 0 L 0 4 L 9 8 z" fill={color} opacity="0.9" />
            </marker>
          ))}
        </defs>

        {/* ── 격자 배경 칸 ── */}
        {Object.entries(CELL_META).map(([key, meta]) => (
          <rect key={key}
            x={meta.col * CW + 1} y={meta.row * CH + 1}
            width={CW - 2} height={CH - 2}
            rx={6}
            fill={meta.color + '09'}
            stroke={meta.color + '30'}
            strokeWidth={1}
          />
        ))}

        {/* ── 격자 라벨 ── */}
        {Object.entries(CELL_META).map(([key, meta]) => (
          <text key={key}
            x={meta.col * CW + 10} y={meta.row * CH + 19}
            fontSize={12} fontWeight="700"
            fill={meta.color} opacity={0.55}
            style={{ userSelect: 'none' }}
          >{meta.label}</text>
        ))}

        {/* ── 화살표 ── */}
        {(edges ?? []).map((edge, i) => {
          const fm = CELL_META[edge.from], tm = CELL_META[edge.to];
          if (!fm || !tm) return null;

          const fp = getPos(edge.from, edge.from_concept);
          const tp = getPos(edge.to, edge.to_concept);
          if (fp.x === tp.x && fp.y === tp.y) return null;

          const color = EDGE_COLORS[edge.type] ?? '#94a3b8';
          const fMargin = fp.boxH / 2 + 4;
          const tMargin = tp.boxH / 2 + 4;

          const fs = moveToward(fp.x, fp.y, tp.x, tp.y, fMargin);
          const fe = moveToward(tp.x, tp.y, fp.x, fp.y, tMargin);

          if (edge.bidirectional) {
            return (
              <g key={i}>
                <path d={quadPath(fs.x, fs.y, fe.x, fe.y, +1)}
                  fill="none" stroke={color} strokeWidth={1.8} opacity={0.85}
                  markerEnd={`url(#ah-${edge.type})`} />
                <path d={quadPath(fe.x, fe.y, fs.x, fs.y, +1)}
                  fill="none" stroke={color} strokeWidth={1.8} opacity={0.85}
                  markerEnd={`url(#ah-${edge.type})`} />
              </g>
            );
          }

          return (
            <path key={i}
              d={quadPath(fs.x, fs.y, fe.x, fe.y, +1)}
              fill="none" stroke={color} strokeWidth={1.8} opacity={0.85}
              markerEnd={`url(#ah-${edge.type})`}
            />
          );
        })}

        {/* ── 개념 박스 ── */}
        {Array.from(nodeMap.entries()).map(([key, node]) => (
          <g key={key}>
            {/* 그림자 효과 */}
            <rect
              x={node.x - BOX_W / 2 + 2} y={node.y - node.boxH / 2 + 2}
              width={BOX_W} height={node.boxH} rx={7}
              fill="rgba(0,0,0,0.4)"
            />
            {/* 박스 본체 */}
            <rect
              x={node.x - BOX_W / 2} y={node.y - node.boxH / 2}
              width={BOX_W} height={node.boxH} rx={7}
              fill="#0f172a"
              stroke={node.color}
              strokeWidth={1.8}
            />
            {/* 텍스트 */}
            {node.lines.map((line, li) => {
              const totalH = node.lines.length * BOX_LINE_H;
              const startY = node.y - totalH / 2 + BOX_LINE_H / 2;
              return (
                <text key={li}
                  x={node.x} y={startY + li * BOX_LINE_H}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={12.5} fontWeight="600"
                  fill="rgba(255,255,255,0.92)"
                  style={{ userSelect: 'none' }}
                >{line}</text>
              );
            })}
          </g>
        ))}
      </svg>

      {/* ── 범례 ── */}
      <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap' }}>
        {Object.entries(EDGE_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={32} height={14} style={{ overflow: 'visible' }}>
              <defs>
                <marker id={`leg-${type}`} markerWidth="7" markerHeight="6" refX="6" refY="3" orient="auto">
                  <path d="M 0 0 L 7 3 L 0 6 z" fill={color} />
                </marker>
              </defs>
              <line x1={0} y1={7} x2={26} y2={7} stroke={color} strokeWidth={1.6} markerEnd={`url(#leg-${type})`} />
            </svg>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{EDGE_LABELS[type]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
