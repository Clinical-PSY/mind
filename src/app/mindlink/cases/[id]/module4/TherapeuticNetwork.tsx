'use client';

// ── 격자 상수 (EEMMNetwork와 동일) ─────────────────────────────────
const GW = 1080;
const GH = 690;
const CW  = GW / 3;
const CH  = GH / 3;
const NODE_W      = 128;
const NODE_LINE_H = 17;
const NODE_PAD_V  = 10;
const CURVE       = 0.24;

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

// ── 타입 ────────────────────────────────────────────────────────────
interface TherapeuticNetworkData {
  description?: string;
  weakened_edges?: WeakenedEdge[];
  new_edges?: NewEdge[];
  strengthened_nodes?: StrengthenedNode[];
  overall_prognosis?: string;
}
interface WeakenedEdge {
  from: string; from_concept: string;
  to: string;   to_concept:   string;
  type: string;
  reason?: string;
}
interface NewEdge {
  from: string; from_concept: string;
  to: string;   to_concept:   string;
  type: string;
  reason?: string;
}
interface StrengthenedNode {
  cell: string;
  concept: string;
  change_type: string;
  change?: string;
}
interface EemmGrid {
  [cell: string]: {
    key_concepts?: string[];
    maladaptive_pattern?: string;
  };
}

interface NodePos { x: number; y: number; lines: string[]; color: string; boxH: number; }

function wrapText(text: string, maxCh = 6): string[] {
  if (!text) return [''];
  const lines: string[] = [];
  for (let i = 0; i < text.length; i += maxCh) lines.push(text.slice(i, i + maxCh));
  return lines;
}

function conceptPositions(cellKey: string, count: number): { x: number; y: number }[] {
  const m = CELL_META[cellKey];
  if (!m) return [];
  const cx = m.col * CW + CW / 2;
  const cy = m.row * CH + CH / 2;
  const offX = CW * 0.22;
  const offY = CH * 0.27;
  if (count === 1) return [{ x: cx, y: cy }];
  if (count === 2) return [{ x: cx - offX, y: cy }, { x: cx + offX, y: cy }];
  return [
    { x: cx, y: cy - offY * 0.9 },
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
      map.set(`${cellKey}::${concept}`, { x: pos.x, y: pos.y, lines, color: meta.color, boxH });
    });
  });
  return map;
}

function findNodePos(nodeMap: Map<string, NodePos>, cellKey: string, conceptName: string): NodePos | null {
  // exact match first
  const exact = nodeMap.get(`${cellKey}::${conceptName}`);
  if (exact) return exact;
  // fuzzy: any node in the cell whose key partially matches
  for (const [k, v] of nodeMap) {
    if (k.startsWith(`${cellKey}::`) && k.includes(conceptName.slice(0, 2))) return v;
  }
  // fallback: center of cell
  const m = CELL_META[cellKey];
  if (!m) return null;
  return { x: m.col * CW + CW / 2, y: m.row * CH + CH / 2, lines: [conceptName], color: m.color, boxH: NODE_LINE_H + NODE_PAD_V * 2 };
}

interface CurveResult { path: string; midX: number; midY: number; }
function curvedPath(x1: number, y1: number, x2: number, y2: number): CurveResult {
  const dx = x2 - x1; const dy = y2 - y1;
  const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2;
  const cpx = mx - dy * CURVE; const cpy = my + dx * CURVE;
  const t = 0.5;
  const qx = (1-t)*(1-t)*x1 + 2*(1-t)*t*cpx + t*t*x2;
  const qy = (1-t)*(1-t)*y1 + 2*(1-t)*t*cpy + t*t*y2;
  return { path: `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`, midX: qx, midY: qy };
}

// ── Props ────────────────────────────────────────────────────────────
interface Props {
  eemmGrid: EemmGrid;
  therapeuticNetwork: TherapeuticNetworkData;
}

export default function TherapeuticNetwork({ eemmGrid, therapeuticNetwork }: Props) {
  const nodeMap = buildNodeMap(eemmGrid);
  const weakened = therapeuticNetwork.weakened_edges ?? [];
  const newEdges = therapeuticNetwork.new_edges ?? [];
  const strengthened = therapeuticNetwork.strengthened_nodes ?? [];

  // collect all unique cell keys for strengthened nodes
  const strengthenedSet = new Set(strengthened.map(n => `${n.cell}::${n.concept}`));

  return (
    <div className="space-y-3">
      {/* legend */}
      <div className="flex flex-wrap gap-4 text-xs text-white/50 px-1">
        <span className="flex items-center gap-1.5">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 3" /></svg>
          약화된 유발
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 3" /></svg>
          약화된 유지
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#4ade80" strokeWidth="2.5" /></svg>
          새 보호 연결
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" /></svg>
          새 상관 연결
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm border border-emerald-400" style={{ background: 'rgba(52,211,153,0.12)' }} />
          강화 노드
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <svg viewBox={`0 0 ${GW} ${GH}`} width="100%" style={{ minWidth: 700, display: 'block', background: '#090f1e' }}>
          <defs>
            {/* arrowhead markers */}
            {[
              { id: 'arr-weakened-causes',  color: '#ef4444' },
              { id: 'arr-weakened-maintains', color: '#fbbf24' },
              { id: 'arr-new-protects',    color: '#4ade80' },
              { id: 'arr-new-correlates',  color: '#38bdf8' },
            ].map(({ id, color }) => (
              <marker key={id} id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill={color} opacity="0.75" />
              </marker>
            ))}
            {/* glow filter */}
            <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* cell radial backgrounds */}
            {Object.entries(CELL_META).map(([key, m]) => (
              <radialGradient key={key} id={`rbg-t-${key}`} cx="50%" cy="50%" r="60%">
                <stop offset="0%"   stopColor={m.color} stopOpacity="0.07" />
                <stop offset="100%" stopColor={m.color} stopOpacity="0.01" />
              </radialGradient>
            ))}
          </defs>

          {/* ── 격자 배경 ── */}
          {Object.entries(CELL_META).map(([key, m]) => {
            const x = m.col * CW; const y = m.row * CH;
            return (
              <g key={key}>
                <rect x={x} y={y} width={CW} height={CH} fill={`url(#rbg-t-${key})`} />
                <rect x={x} y={y} width={CW} height={CH} fill="none" stroke={m.color} strokeWidth="0.5" strokeOpacity="0.12" />
                {/* cell label */}
                <text x={x + 10} y={y + 18} fontSize="11" fill={m.color} fillOpacity="0.5" fontWeight="600">{m.label}</text>
              </g>
            );
          })}

          {/* ── 원래 노드 (muted) ── */}
          {Array.from(nodeMap.entries()).map(([key, n]) => {
            const isStrengthened = strengthenedSet.has(key);
            const boxW = NODE_W;
            const bx = n.x - boxW / 2; const by = n.y - n.boxH / 2;
            return (
              <g key={key}>
                {/* strengthened glow ring */}
                {isStrengthened && (
                  <rect x={bx - 3} y={by - 3} width={boxW + 6} height={n.boxH + 6}
                    rx="8" ry="8" fill="none"
                    stroke="#4ade80" strokeWidth="1.8" strokeOpacity="0.6"
                    filter="url(#glow-green)" />
                )}
                {/* node box */}
                <rect x={bx} y={by} width={boxW} height={n.boxH}
                  rx="6" ry="6"
                  fill={isStrengthened ? 'rgba(52,211,153,0.10)' : 'rgba(255,255,255,0.03)'}
                  stroke={isStrengthened ? '#4ade80' : n.color}
                  strokeWidth={isStrengthened ? 1.2 : 0.7}
                  strokeOpacity={isStrengthened ? 0.8 : 0.35}
                />
                {n.lines.map((line, li) => (
                  <text key={li}
                    x={n.x} y={by + NODE_PAD_V + (li + 0.75) * NODE_LINE_H}
                    textAnchor="middle" fontSize="10.5" fontWeight="500"
                    fill={isStrengthened ? '#86efac' : n.color}
                    fillOpacity={isStrengthened ? 0.95 : 0.5}>
                    {line}
                  </text>
                ))}
              </g>
            );
          })}

          {/* ── 약화된 엣지 ── */}
          {weakened.map((edge, i) => {
            const fromN = findNodePos(nodeMap, edge.from, edge.from_concept);
            const toN   = findNodePos(nodeMap, edge.to,   edge.to_concept);
            if (!fromN || !toN) return null;
            const color = edge.type === 'causes' ? '#ef4444' : '#fbbf24';
            const markerId = edge.type === 'causes' ? 'arr-weakened-causes' : 'arr-weakened-maintains';
            const { path, midX, midY } = curvedPath(fromN.x, fromN.y, toN.x, toN.y);
            return (
              <g key={`we-${i}`}>
                <path d={path} fill="none" stroke={color} strokeWidth="1.8"
                  strokeDasharray="6 4" strokeOpacity="0.45"
                  markerEnd={`url(#${markerId})`} />
                {/* label */}
                <rect x={midX - 18} y={midY - 9} width={36} height={14} rx="3"
                  fill="#0f172a" fillOpacity="0.85" />
                <text x={midX} y={midY + 2} textAnchor="middle" fontSize="9"
                  fill={color} fillOpacity="0.6">약화</text>
              </g>
            );
          })}

          {/* ── 새 연결 ── */}
          {newEdges.map((edge, i) => {
            const fromN = findNodePos(nodeMap, edge.from, edge.from_concept);
            const toN   = findNodePos(nodeMap, edge.to,   edge.to_concept);
            if (!fromN || !toN) return null;
            const isProtects = edge.type === 'protects';
            const color = isProtects ? '#4ade80' : '#38bdf8';
            const markerId = isProtects ? 'arr-new-protects' : 'arr-new-correlates';
            const dash = isProtects ? '' : '4 3';
            const { path, midX, midY } = curvedPath(fromN.x, fromN.y - 8, toN.x, toN.y - 8);
            return (
              <g key={`ne-${i}`}>
                <path d={path} fill="none" stroke={color} strokeWidth="2.2"
                  strokeDasharray={dash} strokeOpacity="0.85"
                  markerEnd={`url(#${markerId})`}
                  filter={isProtects ? 'url(#glow-green)' : undefined} />
                {/* label */}
                <rect x={midX - 20} y={midY - 9} width={40} height={14} rx="3"
                  fill="#0f172a" fillOpacity="0.85" />
                <text x={midX} y={midY + 2} textAnchor="middle" fontSize="9"
                  fill={color} fillOpacity="0.9">
                  {isProtects ? '보호↑' : '상관↑'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
