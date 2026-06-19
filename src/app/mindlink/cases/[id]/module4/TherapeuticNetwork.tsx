'use client';

// ── 격자 상수 ─────────────────────────────────────────────────────────
const GW = 1080;
const GH = 690;
const CW  = GW / 3;   // 360px per cell
const CH  = GH / 3;   // 230px per cell
const NODE_W      = 124;
const INT_NODE_W  = 108;   // intervention node box width
const NODE_LINE_H = 17;
const NODE_PAD_V  = 10;
const CURVE       = 0.22;

const CELL_META: Record<string, { label: string; row: number; col: number; color: string }> = {
  attention:         { label: '주의',     row: 0, col: 0, color: '#60a5fa' },
  cognition:         { label: '인지',     row: 0, col: 1, color: '#a78bfa' },
  self:              { label: '자기',     row: 0, col: 2, color: '#22d3ee' },
  emotion:           { label: '정서',     row: 1, col: 0, color: '#f472b6' },
  behavior:          { label: '행동',     row: 1, col: 1, color: '#fbbf24' },
  motivation:        { label: '동기',     row: 1, col: 2, color: '#34d399' },
  bio_physiological: { label: '생물생리', row: 2, col: 0, color: '#f87171' },
  context:           { label: '맥락',     row: 2, col: 1, color: '#c084fc' },
  socio_cultural:    { label: '사회문화', row: 2, col: 2, color: '#fb923c' },
};

// 원래 부적응 엣지 스타일
const ORIG_EDGE_CFG: Record<string, { color: string; dash: string; width: number }> = {
  causes:     { color: '#f87171', dash: '',    width: 2.0 },
  maintains:  { color: '#fbbf24', dash: '',    width: 1.7 },
  correlates: { color: '#94a3b8', dash: '6 3', width: 1.3 },
  protects:   { color: '#4ade80', dash: '2 4', width: 1.7 },
};

// target connection 화살표 색
const TARGET_CFG: Record<string, { color: string; label: string }> = {
  targets:   { color: '#c084fc', label: '대상' },
  reduces:   { color: '#fb923c', label: '감소↓' },
  activates: { color: '#2dd4bf', label: '활성↑' },
};

// ── 타입 ─────────────────────────────────────────────────────────────
export interface OriginalEdge {
  from: string; from_concept?: string;
  to: string;   to_concept?:   string;
  type: string; bidirectional?: boolean;
}

export interface TherapeuticNetworkData {
  description?: string;
  overall_prognosis?: string;
  intervention_nodes?: Array<{ cell: string; label: string; dimension?: string }>;
  target_connections?: Array<{
    from_label: string; from_cell: string;
    to_concept: string; to_cell:   string;
    type: string; dimension?: string; reason?: string;
  }>;
  weakened_edges?: Array<{
    from: string; from_concept: string;
    to: string;   to_concept:   string;
    type: string; reason?: string; dimension?: string;
  }>;
  new_edges?: Array<{
    from: string; from_concept: string;
    to: string;   to_concept:   string;
    type: string; reason?: string; dimension?: string;
  }>;
  strengthened_nodes?: Array<{
    cell: string; concept: string;
    change_type: string; change?: string; dimension?: string;
  }>;
}

interface EemmGrid {
  [cell: string]: { key_concepts?: string[]; maladaptive_pattern?: string };
}

interface NodePos { x: number; y: number; lines: string[]; color: string; boxH: number; boxW: number; }

// ── 유틸 ─────────────────────────────────────────────────────────────
function wrapText(text: string, maxCh = 6): string[] {
  if (!text) return [''];
  const lines: string[] = [];
  for (let i = 0; i < text.length; i += maxCh) lines.push(text.slice(i, i + maxCh));
  return lines;
}

function conceptPositions(cellKey: string, count: number): { x: number; y: number }[] {
  const m = CELL_META[cellKey];
  if (!m || count === 0) return [];
  const cx = m.col * CW + CW / 2;
  const cy = m.row * CH + CH / 2;
  const offX = CW * 0.22;
  const offY = CH * 0.27;
  if (count === 1) return [{ x: cx, y: cy }];
  if (count === 2) return [{ x: cx - offX, y: cy }, { x: cx + offX, y: cy }];
  return [
    { x: cx,        y: cy - offY * 0.9 },
    { x: cx - offX, y: cy + offY * 0.6 },
    { x: cx + offX, y: cy + offY * 0.6 },
  ];
}

function buildNodeMap(eemmGrid: EemmGrid): Map<string, NodePos> {
  const map = new Map<string, NodePos>();
  Object.entries(CELL_META).forEach(([cellKey, meta]) => {
    const cell = eemmGrid[cellKey] ?? {};
    const concepts = (cell.key_concepts ?? []).slice(0, 3);
    const positions = conceptPositions(cellKey, concepts.length);
    concepts.forEach((concept, i) => {
      const pos = positions[i];
      if (!pos) return;
      const lines = wrapText(concept, 6);
      const boxH = lines.length * NODE_LINE_H + NODE_PAD_V * 2;
      map.set(`${cellKey}::${concept}`, { x: pos.x, y: pos.y, lines, color: meta.color, boxH, boxW: NODE_W });
    });
  });
  return map;
}

function findNodePos(nodeMap: Map<string, NodePos>, cellKey: string, conceptName: string): NodePos | null {
  const exact = nodeMap.get(`${cellKey}::${conceptName}`);
  if (exact) return exact;
  for (const [k, v] of nodeMap) {
    if (k.startsWith(`${cellKey}::`) && conceptName.length >= 2 && k.includes(conceptName.slice(0, 2))) return v;
  }
  const m = CELL_META[cellKey];
  if (!m) return null;
  return { x: m.col * CW + CW / 2, y: m.row * CH + CH / 2, lines: [conceptName], color: m.color, boxH: NODE_LINE_H + NODE_PAD_V * 2, boxW: NODE_W };
}

// 개입 노드 위치 맵 (셀 하단 구역 배치)
function buildInterventionMap(
  nodes: Array<{ cell: string; label: string; dimension?: string }>,
  selectedDim: string,
): Map<string, NodePos> {
  const map = new Map<string, NodePos>();
  const dimNodes = nodes.filter(n => n.dimension === selectedDim || !n.dimension);

  // group by cell
  const byCellKey: Record<string, string[]> = {};
  dimNodes.forEach(n => {
    if (!byCellKey[n.cell]) byCellKey[n.cell] = [];
    byCellKey[n.cell].push(n.label);
  });

  Object.entries(byCellKey).forEach(([cellKey, labels]) => {
    const m = CELL_META[cellKey];
    if (!m) return;
    const cellX = m.col * CW;
    const cellY = m.row * CH;
    const count = labels.length;
    labels.forEach((label, i) => {
      const x = count === 1 ? cellX + CW / 2 : cellX + CW * (i + 1) / (count + 1);
      // Place at bottom of cell, above the cell bottom border
      const y = cellY + CH - 34;
      const lines = wrapText(label, 7);
      const boxH = lines.length * NODE_LINE_H + NODE_PAD_V * 2;
      map.set(label, { x, y, lines, color: '#4ade80', boxH, boxW: INT_NODE_W });
    });
  });

  return map;
}

function norm(ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy);
  return len < 1 ? { dx: 0, dy: 0, len: 0 } : { dx: dx / len, dy: dy / len, len };
}
function toward(ax: number, ay: number, bx: number, by: number, d: number) {
  const { dx, dy, len } = norm(ax, ay, bx, by);
  if (len < 1) return { x: ax, y: ay };
  return { x: ax + dx * d, y: ay + dy * d };
}

interface CurveResult { path: string; midX: number; midY: number; }
function curvedPath(x1: number, y1: number, x2: number, y2: number, flip = 1): CurveResult {
  const dx = x2 - x1; const dy = y2 - y1;
  const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2;
  const cpx = mx - dy * CURVE * flip;
  const cpy = my + dx * CURVE * flip;
  const t = 0.5;
  const qx = (1-t)*(1-t)*x1 + 2*(1-t)*t*cpx + t*t*x2;
  const qy = (1-t)*(1-t)*y1 + 2*(1-t)*t*cpy + t*t*y2;
  return { path: `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`, midX: qx, midY: qy };
}

// ── Props ─────────────────────────────────────────────────────────────
interface Props {
  eemmGrid: EemmGrid;
  originalEdges: OriginalEdge[];
  therapeuticNetwork: TherapeuticNetworkData;
  selectedDimension: string | null;
}

export default function TherapeuticNetwork({ eemmGrid, originalEdges, therapeuticNetwork, selectedDimension }: Props) {
  const nodeMap = buildNodeMap(eemmGrid);

  const interventionMap = selectedDimension
    ? buildInterventionMap(therapeuticNetwork.intervention_nodes ?? [], selectedDimension)
    : new Map<string, NodePos>();

  // 현재 선택 차원 필터
  function byDim<T extends { dimension?: string }>(arr: T[] | undefined) {
    return (arr ?? []).filter(e => !selectedDimension || e.dimension === selectedDimension);
  }
  const activeTargetConns  = byDim(therapeuticNetwork.target_connections);
  const activeWeakened     = byDim(therapeuticNetwork.weakened_edges);
  const activeNew          = byDim(therapeuticNetwork.new_edges);
  const activeStrengthened = byDim(therapeuticNetwork.strengthened_nodes);

  // 약화될 엣지 식별용 키 세트 (기존 엣지를 흐리게 표시하기 위함)
  const weakenedKeys = new Set(
    activeWeakened.map(e => `${e.from}::${e.from_concept}→${e.to}::${e.to_concept}`)
  );
  const strengthenedSet = new Set(activeStrengthened.map(n => `${n.cell}::${n.concept}`));

  const dimMeta = selectedDimension ? CELL_META[selectedDimension] : null;
  const isFiltering = selectedDimension !== null;

  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
      <svg viewBox={`0 0 ${GW} ${GH}`} width="100%" style={{ minWidth: 700, display: 'block', background: '#090f1e' }}>
        <defs>
          {/* 원래 엣지 마커 */}
          {['causes', 'maintains', 'correlates', 'protects'].map(t => (
            <marker key={`om-${t}`} id={`arr-orig-${t}`} markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill={ORIG_EDGE_CFG[t]?.color ?? '#888'} opacity="0.6" />
            </marker>
          ))}
          {/* target connection 마커 */}
          {Object.entries(TARGET_CFG).map(([k, v]) => (
            <marker key={`tm-${k}`} id={`arr-target-${k}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={v.color} opacity="0.9" />
            </marker>
          ))}
          {/* 약화 마커 */}
          <marker id="arr-weakened" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#ef4444" opacity="0.8" />
          </marker>
          {/* 새 연결 마커 */}
          <marker id="arr-new-protects"   markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#4ade80" opacity="0.9" />
          </marker>
          <marker id="arr-new-correlates" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#38bdf8" opacity="0.9" />
          </marker>
          {/* 필터 */}
          <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-purple" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* 셀 radial 배경 */}
          {Object.entries(CELL_META).map(([key, m]) => (
            <radialGradient key={key} id={`rbg-th-${key}`} cx="50%" cy="50%" r="60%">
              <stop offset="0%"   stopColor={m.color} stopOpacity="0.07" />
              <stop offset="100%" stopColor={m.color} stopOpacity="0.01" />
            </radialGradient>
          ))}
          {dimMeta && (
            <radialGradient id="rbg-selected" cx="50%" cy="50%" r="60%">
              <stop offset="0%"   stopColor={dimMeta.color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={dimMeta.color} stopOpacity="0.04" />
            </radialGradient>
          )}
        </defs>

        {/* ── 1. 격자 배경 ── */}
        {Object.entries(CELL_META).map(([key, m]) => {
          const x = m.col * CW; const y = m.row * CH;
          const isSelected = selectedDimension === key;
          const isDimmed = isFiltering && !isSelected;
          return (
            <g key={key}>
              <rect x={x} y={y} width={CW} height={CH}
                fill={isSelected ? 'url(#rbg-selected)' : `url(#rbg-th-${key})`}
                opacity={isDimmed ? 0.35 : 1} />
              <rect x={x} y={y} width={CW} height={CH} fill="none"
                stroke={m.color}
                strokeWidth={isSelected ? 1.5 : 0.5}
                strokeOpacity={isSelected ? 0.55 : isDimmed ? 0.06 : 0.12} />
              {isSelected && (
                <rect x={x+1} y={y+1} width={CW-2} height={CH-2} fill="none"
                  stroke={m.color} strokeWidth="1" strokeOpacity="0.2" strokeDasharray="7 4" />
              )}
              <text x={x + 10} y={y + 18} fontSize="11" fontWeight="600"
                fill={m.color} fillOpacity={isDimmed ? 0.2 : isSelected ? 0.85 : 0.5}>
                {m.label}
              </text>
            </g>
          );
        })}

        {/* ── 2. 원래 부적응 엣지 (베이스) ── */}
        {originalEdges.map((edge, i) => {
          const fromN = findNodePos(nodeMap, edge.from, edge.from_concept ?? '');
          const toN   = findNodePos(nodeMap, edge.to,   edge.to_concept ?? '');
          if (!fromN || !toN) return null;
          const cfg = ORIG_EDGE_CFG[edge.type] ?? { color: '#64748b', dash: '', width: 1.5 };
          const edgeKey = `${edge.from}::${edge.from_concept ?? ''}→${edge.to}::${edge.to_concept ?? ''}`;
          const isWeakened = weakenedKeys.has(edgeKey);

          const s = toward(fromN.x, fromN.y, toN.x, toN.y, NODE_W / 2 + 2);
          const e2 = toward(toN.x, toN.y, fromN.x, fromN.y, NODE_W / 2 + 2);
          if (Math.abs(s.x - e2.x) < 2 && Math.abs(s.y - e2.y) < 2) return null;
          const { path } = curvedPath(s.x, s.y, e2.x, e2.y);

          const opacity = isFiltering ? (isWeakened ? 0.2 : 0.1) : 0.55;

          return (
            <g key={`orig-${i}`}>
              <path d={path} fill="none"
                stroke={cfg.color}
                strokeWidth={cfg.width}
                strokeDasharray={isWeakened ? '5 4' : cfg.dash}
                strokeOpacity={opacity}
                markerEnd={`url(#arr-orig-${edge.type})`} />
            </g>
          );
        })}

        {/* ── 3. 기존 개념 노드 ── */}
        {Array.from(nodeMap.entries()).map(([key, n]) => {
          const [cellKey] = key.split('::');
          const isSelectedCell = selectedDimension === cellKey;
          const isDimmedCell = isFiltering && !isSelectedCell;
          const isStrengthened = strengthenedSet.has(key);
          const bx = n.x - NODE_W / 2;
          const by = n.y - n.boxH / 2;

          return (
            <g key={`node-${key}`}>
              {isStrengthened && (
                <rect x={bx - 4} y={by - 4} width={NODE_W + 8} height={n.boxH + 8}
                  rx="9" fill="none" stroke="#4ade80" strokeWidth="2" strokeOpacity="0.6"
                  filter="url(#glow-green)" />
              )}
              <rect x={bx} y={by} width={NODE_W} height={n.boxH} rx="6"
                fill={isStrengthened ? 'rgba(52,211,153,0.10)' : isDimmedCell ? 'rgba(255,255,255,0.012)' : 'rgba(255,255,255,0.04)'}
                stroke={isStrengthened ? '#4ade80' : n.color}
                strokeWidth={isStrengthened ? 1.4 : 0.8}
                strokeOpacity={isStrengthened ? 0.85 : isDimmedCell ? 0.1 : isSelectedCell ? 0.55 : 0.38} />
              {n.lines.map((line, li) => (
                <text key={li} x={n.x} y={by + NODE_PAD_V + (li + 0.75) * NODE_LINE_H}
                  textAnchor="middle" fontSize="10.5" fontWeight="500"
                  fill={isStrengthened ? '#86efac' : n.color}
                  fillOpacity={isDimmedCell ? 0.15 : isStrengthened ? 0.95 : isSelectedCell ? 0.75 : 0.55}>
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {/* ── 4. 치료 개입 노드 (선택된 차원, 셀 하단) ── */}
        {Array.from(interventionMap.entries()).map(([label, n]) => {
          const bx = n.x - INT_NODE_W / 2;
          const by = n.y - n.boxH / 2;
          return (
            <g key={`int-${label}`}>
              {/* glow 배경 */}
              <rect x={bx - 5} y={by - 5} width={INT_NODE_W + 10} height={n.boxH + 10}
                rx="9" fill="rgba(74,222,128,0.06)"
                stroke="#4ade80" strokeWidth="1.5" strokeOpacity="0.35"
                filter="url(#glow-green)" />
              {/* 노드 박스 (dashed border) */}
              <rect x={bx} y={by} width={INT_NODE_W} height={n.boxH} rx="6"
                fill="rgba(74,222,128,0.10)"
                stroke="#4ade80" strokeWidth="1.4" strokeOpacity="0.8"
                strokeDasharray="4 2" />
              {/* "Tx" 뱃지 */}
              <rect x={bx + INT_NODE_W - 18} y={by - 1} width={16} height={11} rx="3"
                fill="#4ade80" fillOpacity="0.8" />
              <text x={bx + INT_NODE_W - 10} y={by + 7.5} textAnchor="middle" fontSize="7"
                fill="#052e16" fontWeight="700">Tx</text>
              {/* 레이블 텍스트 */}
              {n.lines.map((line, li) => (
                <text key={li} x={n.x} y={by + NODE_PAD_V + (li + 0.75) * NODE_LINE_H}
                  textAnchor="middle" fontSize="10.5" fontWeight="600"
                  fill="#4ade80" fillOpacity="0.95">
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {/* ── 5. target connections (개입노드 → 기존노드) ── */}
        {activeTargetConns.map((conn, i) => {
          const fromN = interventionMap.get(conn.from_label);
          const toN   = findNodePos(nodeMap, conn.to_cell, conn.to_concept);
          if (!fromN || !toN) return null;

          const cfg = TARGET_CFG[conn.type] ?? TARGET_CFG['targets'];
          // 개입 노드는 하단에 있으므로 위쪽 방향으로 출발
          const fromR = INT_NODE_W / 2 + 2;
          const s = toward(fromN.x, fromN.y, toN.x, toN.y, fromR);
          const e2 = toward(toN.x, toN.y, fromN.x, fromN.y, NODE_W / 2 + 2);
          if (Math.abs(s.x - e2.x) < 2 && Math.abs(s.y - e2.y) < 2) return null;
          const { path, midX, midY } = curvedPath(s.x, s.y, e2.x, e2.y, -1.2);

          return (
            <g key={`tc-${i}`}>
              <path d={path} fill="none" stroke={cfg.color} strokeWidth="2.0"
                strokeOpacity="0.85" strokeDasharray={conn.type === 'targets' ? '' : '5 3'}
                markerEnd={`url(#arr-target-${conn.type})`}
                filter={conn.type === 'activates' ? 'url(#glow-green)' : undefined} />
              {/* 라벨 */}
              <rect x={midX - 20} y={midY - 9} width={40} height={14} rx="3"
                fill="#0a0f1c" fillOpacity="0.9" />
              <text x={midX} y={midY + 2.5} textAnchor="middle" fontSize="9"
                fill={cfg.color} fillOpacity="0.95">
                {cfg.label}
              </text>
            </g>
          );
        })}

        {/* ── 6. 약화된 기존 연결 오버레이 ── */}
        {activeWeakened.map((edge, i) => {
          const fromN = findNodePos(nodeMap, edge.from, edge.from_concept);
          const toN   = findNodePos(nodeMap, edge.to,   edge.to_concept);
          if (!fromN || !toN) return null;
          const s  = toward(fromN.x, fromN.y, toN.x, toN.y, NODE_W / 2 + 4);
          const e2 = toward(toN.x, toN.y, fromN.x, fromN.y, NODE_W / 2 + 4);
          if (Math.abs(s.x - e2.x) < 2 && Math.abs(s.y - e2.y) < 2) return null;
          const { path, midX, midY } = curvedPath(s.x, s.y, e2.x, e2.y, 1.4);
          return (
            <g key={`we-${i}`}>
              <path d={path} fill="none" stroke="#ef4444" strokeWidth="1.8"
                strokeDasharray="4 3" strokeOpacity="0.55"
                markerEnd="url(#arr-weakened)" />
              {/* × 마크 */}
              <circle cx={midX} cy={midY} r="8" fill="#0a0f1c" fillOpacity="0.9" />
              <line x1={midX-4} y1={midY-4} x2={midX+4} y2={midY+4}
                stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.8" />
              <line x1={midX+4} y1={midY-4} x2={midX-4} y2={midY+4}
                stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.8" />
            </g>
          );
        })}

        {/* ── 7. 새 적응적 연결 ── */}
        {activeNew.map((edge, i) => {
          const fromN = findNodePos(nodeMap, edge.from, edge.from_concept);
          const toN   = findNodePos(nodeMap, edge.to,   edge.to_concept);
          if (!fromN || !toN) return null;
          const isProtects = edge.type === 'protects';
          const color    = isProtects ? '#4ade80' : '#38bdf8';
          const markerId = isProtects ? 'arr-new-protects' : 'arr-new-correlates';
          const s  = toward(fromN.x, fromN.y - 5, toN.x, toN.y - 5, NODE_W / 2 + 4);
          const e2 = toward(toN.x, toN.y - 5, fromN.x, fromN.y - 5, NODE_W / 2 + 4);
          if (Math.abs(s.x - e2.x) < 2 && Math.abs(s.y - e2.y) < 2) return null;
          const { path, midX, midY } = curvedPath(s.x, s.y, e2.x, e2.y, -1.5);
          return (
            <g key={`ne-${i}`}>
              <path d={path} fill="none" stroke={color} strokeWidth="2.2"
                strokeDasharray={isProtects ? '' : '4 3'} strokeOpacity="0.88"
                markerEnd={`url(#${markerId})`}
                filter={isProtects ? 'url(#glow-green)' : undefined} />
              <rect x={midX - 22} y={midY - 9} width={44} height={14} rx="3"
                fill="#0a0f1c" fillOpacity="0.9" />
              <text x={midX} y={midY + 2.5} textAnchor="middle" fontSize="9"
                fill={color} fillOpacity="0.95">
                {isProtects ? '보호↑' : '상관↑'}
              </text>
            </g>
          );
        })}

        {/* 안내 텍스트 (차원 미선택 시) */}
        {!selectedDimension && (
          <text x={GW / 2} y={GH - 12} textAnchor="middle" fontSize="11"
            fill="rgba(255,255,255,0.18)">
            좌측 차원을 클릭하면 해당 개입의 치료적 변화를 네트워크에서 확인할 수 있습니다
          </text>
        )}
      </svg>
    </div>
  );
}
