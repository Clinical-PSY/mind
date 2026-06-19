'use client';

// ── 격자 상수 ─────────────────────────────────────────────────────────
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

// 원래 부적응 엣지 스타일 (EEMMNetwork와 동일)
const ORIG_EDGE_CFG: Record<string, { color: string; dash: string; width: number }> = {
  causes:     { color: '#f87171', dash: '',    width: 2.2 },
  maintains:  { color: '#fbbf24', dash: '',    width: 1.8 },
  correlates: { color: '#94a3b8', dash: '6 3', width: 1.4 },
  protects:   { color: '#4ade80', dash: '2 4', width: 1.8 },
};

// ── 타입 ─────────────────────────────────────────────────────────────
export interface OriginalEdge {
  from: string; from_concept?: string;
  to: string;   to_concept?:   string;
  type: string; bidirectional?: boolean;
}
export interface TherapeuticNetworkData {
  description?: string;
  weakened_edges?: Array<{ from: string; from_concept: string; to: string; to_concept: string; type: string; reason?: string; dimension?: string }>;
  new_edges?:      Array<{ from: string; from_concept: string; to: string; to_concept: string; type: string; reason?: string; dimension?: string }>;
  strengthened_nodes?: Array<{ cell: string; concept: string; change_type: string; change?: string; dimension?: string }>;
  overall_prognosis?: string;
}
interface EemmGrid {
  [cell: string]: { key_concepts?: string[]; maladaptive_pattern?: string };
}
interface NodePos { x: number; y: number; lines: string[]; color: string; boxH: number; }

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
  return [{ x: cx, y: cy - offY * 0.9 }, { x: cx - offX, y: cy + offY * 0.6 }, { x: cx + offX, y: cy + offY * 0.6 }];
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
  const exact = nodeMap.get(`${cellKey}::${conceptName}`);
  if (exact) return exact;
  for (const [k, v] of nodeMap) {
    if (k.startsWith(`${cellKey}::`) && k.includes(conceptName.slice(0, 2))) return v;
  }
  const m = CELL_META[cellKey];
  if (!m) return null;
  return { x: m.col * CW + CW / 2, y: m.row * CH + CH / 2, lines: [conceptName], color: m.color, boxH: NODE_LINE_H + NODE_PAD_V * 2 };
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
function curvedPath(x1: number, y1: number, x2: number, y2: number, offsetDir = 1): CurveResult {
  const dx = x2 - x1; const dy = y2 - y1;
  const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2;
  const cpx = mx - dy * CURVE * offsetDir;
  const cpy = my + dx * CURVE * offsetDir;
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

  // 현재 선택된 차원의 변화만 필터링
  const activeWeakened = (therapeuticNetwork.weakened_edges ?? []).filter(
    e => !selectedDimension || e.dimension === selectedDimension
  );
  const activeNew = (therapeuticNetwork.new_edges ?? []).filter(
    e => !selectedDimension || e.dimension === selectedDimension
  );
  const activeStrengthened = (therapeuticNetwork.strengthened_nodes ?? []).filter(
    n => !selectedDimension || n.dimension === selectedDimension
  );

  // 약화될 원래 엣지 식별 (현재 필터 기준)
  const weakenedKeys = new Set(activeWeakened.map(e => `${e.from}::${e.from_concept}→${e.to}::${e.to_concept}`));
  const strengthenedSet = new Set(activeStrengthened.map(n => `${n.cell}::${n.concept}`));

  const dimMeta = selectedDimension ? CELL_META[selectedDimension] : null;

  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
      <svg viewBox={`0 0 ${GW} ${GH}`} width="100%" style={{ minWidth: 700, display: 'block', background: '#090f1e' }}>
        <defs>
          {/* 원래 엣지 마커 */}
          {['causes', 'maintains', 'correlates', 'protects'].map(t => (
            <marker key={`orig-${t}`} id={`arr-orig-${t}`} markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill={ORIG_EDGE_CFG[t]?.color ?? '#999'} opacity="0.55" />
            </marker>
          ))}
          {/* 치료 변화 마커 */}
          {[
            { id: 'arr-weakened', color: '#ef4444' },
            { id: 'arr-new-protects', color: '#4ade80' },
            { id: 'arr-new-correlates', color: '#38bdf8' },
          ].map(({ id, color }) => (
            <marker key={id} id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={color} opacity="0.85" />
            </marker>
          ))}
          {/* 필터 */}
          <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-dim" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* 셀 radial 배경 */}
          {Object.entries(CELL_META).map(([key, m]) => (
            <radialGradient key={key} id={`rbg-th-${key}`} cx="50%" cy="50%" r="60%">
              <stop offset="0%"   stopColor={m.color} stopOpacity="0.07" />
              <stop offset="100%" stopColor={m.color} stopOpacity="0.01" />
            </radialGradient>
          ))}
          {/* 선택된 셀 강조 gradient */}
          {dimMeta && (
            <radialGradient id="rbg-selected" cx="50%" cy="50%" r="60%">
              <stop offset="0%"   stopColor={dimMeta.color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={dimMeta.color} stopOpacity="0.04" />
            </radialGradient>
          )}
        </defs>

        {/* ── 격자 배경 ── */}
        {Object.entries(CELL_META).map(([key, m]) => {
          const x = m.col * CW; const y = m.row * CH;
          const isSelected = selectedDimension === key;
          const isDimmed = selectedDimension && !isSelected;
          return (
            <g key={key}>
              <rect x={x} y={y} width={CW} height={CH}
                fill={isSelected ? 'url(#rbg-selected)' : `url(#rbg-th-${key})`}
                opacity={isDimmed ? 0.4 : 1} />
              <rect x={x} y={y} width={CW} height={CH} fill="none"
                stroke={m.color}
                strokeWidth={isSelected ? 1.5 : 0.5}
                strokeOpacity={isSelected ? 0.6 : 0.12} />
              {isSelected && (
                <rect x={x+1} y={y+1} width={CW-2} height={CH-2} fill="none"
                  stroke={m.color} strokeWidth="1" strokeOpacity="0.25"
                  strokeDasharray="6 4" />
              )}
              <text x={x + 10} y={y + 18} fontSize="11" fontWeight="600"
                fill={m.color} fillOpacity={isDimmed ? 0.25 : isSelected ? 0.9 : 0.5}>
                {m.label}
              </text>
            </g>
          );
        })}

        {/* ── 원래 부적응 엣지 (베이스) ── */}
        {originalEdges.map((edge, i) => {
          const fromN = findNodePos(nodeMap, edge.from, edge.from_concept ?? '');
          const toN   = findNodePos(nodeMap, edge.to,   edge.to_concept ?? '');
          if (!fromN || !toN) return null;
          const cfg = ORIG_EDGE_CFG[edge.type] ?? { color: '#64748b', dash: '', width: 1.5 };
          const edgeKey = `${edge.from}::${edge.from_concept ?? ''}→${edge.to}::${edge.to_concept ?? ''}`;
          const isWeakened = weakenedKeys.has(edgeKey);

          const s = toward(fromN.x, fromN.y, toN.x, toN.y, NODE_W / 2 + 2);
          const e = toward(toN.x, toN.y, fromN.x, fromN.y, NODE_W / 2 + 2);
          const { path, midX, midY } = curvedPath(s.x, s.y, e.x, e.y);

          const dimmed = selectedDimension !== null;
          const baseOpacity = dimmed ? (isWeakened ? 0.25 : 0.12) : 0.55;

          return (
            <g key={`orig-${i}`}>
              <path d={path} fill="none"
                stroke={isWeakened ? cfg.color : cfg.color}
                strokeWidth={cfg.width}
                strokeDasharray={isWeakened ? '5 4' : cfg.dash}
                strokeOpacity={baseOpacity}
                markerEnd={`url(#arr-orig-${edge.type})`} />
              {/* weakened cross indicator */}
              {isWeakened && (
                <>
                  <line x1={midX - 6} y1={midY - 6} x2={midX + 6} y2={midY + 6}
                    stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.7" />
                  <line x1={midX + 6} y1={midY - 6} x2={midX - 6} y2={midY + 6}
                    stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.7" />
                </>
              )}
            </g>
          );
        })}

        {/* ── 노드 (원래 개념들) ── */}
        {Array.from(nodeMap.entries()).map(([key, n]) => {
          const [cellKey] = key.split('::');
          const isSelectedCell = selectedDimension === cellKey;
          const isDimmedCell = selectedDimension && !isSelectedCell;
          const isStrengthened = strengthenedSet.has(key);
          const bx = n.x - NODE_W / 2; const by = n.y - n.boxH / 2;

          return (
            <g key={key}>
              {isStrengthened && (
                <rect x={bx - 4} y={by - 4} width={NODE_W + 8} height={n.boxH + 8}
                  rx="9" fill="none"
                  stroke="#4ade80" strokeWidth="2" strokeOpacity="0.65"
                  filter="url(#glow-green)" />
              )}
              <rect x={bx} y={by} width={NODE_W} height={n.boxH} rx="6"
                fill={isStrengthened ? 'rgba(52,211,153,0.10)' : isDimmedCell ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.04)'}
                stroke={isStrengthened ? '#4ade80' : n.color}
                strokeWidth={isStrengthened ? 1.4 : isSelectedCell ? 1.0 : 0.7}
                strokeOpacity={isStrengthened ? 0.85 : isDimmedCell ? 0.15 : isSelectedCell ? 0.55 : 0.35} />
              {n.lines.map((line, li) => (
                <text key={li} x={n.x} y={by + NODE_PAD_V + (li + 0.75) * NODE_LINE_H}
                  textAnchor="middle" fontSize="10.5" fontWeight="500"
                  fill={isStrengthened ? '#86efac' : n.color}
                  fillOpacity={isStrengthened ? 0.95 : isDimmedCell ? 0.18 : isSelectedCell ? 0.75 : 0.55}>
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {/* ── 치료적 변화: 약화 표시 엣지 ── */}
        {activeWeakened.map((edge, i) => {
          const fromN = findNodePos(nodeMap, edge.from, edge.from_concept);
          const toN   = findNodePos(nodeMap, edge.to,   edge.to_concept);
          if (!fromN || !toN) return null;
          const s = toward(fromN.x, fromN.y, toN.x, toN.y, NODE_W / 2 + 4);
          const e = toward(toN.x, toN.y, fromN.x, fromN.y, NODE_W / 2 + 4);
          const { path, midX, midY } = curvedPath(s.x, s.y, e.x, e.y, -1);
          return (
            <g key={`we-${i}`}>
              <path d={path} fill="none" stroke="#ef4444" strokeWidth="2"
                strokeDasharray="4 3" strokeOpacity="0.5"
                markerEnd="url(#arr-weakened)" />
              <rect x={midX - 22} y={midY - 9} width={44} height={14} rx="3"
                fill="#0f172a" fillOpacity="0.9" />
              <text x={midX} y={midY + 2.5} textAnchor="middle" fontSize="9" fill="#f87171" fillOpacity="0.8">
                약화↓
              </text>
            </g>
          );
        })}

        {/* ── 치료적 변화: 새 연결 ── */}
        {activeNew.map((edge, i) => {
          const fromN = findNodePos(nodeMap, edge.from, edge.from_concept);
          const toN   = findNodePos(nodeMap, edge.to,   edge.to_concept);
          if (!fromN || !toN) return null;
          const isProtects = edge.type === 'protects';
          const color = isProtects ? '#4ade80' : '#38bdf8';
          const markerId = isProtects ? 'arr-new-protects' : 'arr-new-correlates';
          const s = toward(fromN.x, fromN.y - 6, toN.x, toN.y - 6, NODE_W / 2 + 4);
          const e = toward(toN.x, toN.y - 6, fromN.x, fromN.y - 6, NODE_W / 2 + 4);
          const { path, midX, midY } = curvedPath(s.x, s.y, e.x, e.y, -1.5);
          return (
            <g key={`ne-${i}`}>
              <path d={path} fill="none" stroke={color} strokeWidth="2.4"
                strokeDasharray={isProtects ? '' : '4 3'} strokeOpacity="0.9"
                markerEnd={`url(#${markerId})`}
                filter={isProtects ? 'url(#glow-green)' : undefined} />
              <rect x={midX - 22} y={midY - 9} width={44} height={14} rx="3"
                fill="#0f172a" fillOpacity="0.9" />
              <text x={midX} y={midY + 2.5} textAnchor="middle" fontSize="9" fill={color} fillOpacity="0.95">
                {isProtects ? '보호↑' : '상관↑'}
              </text>
            </g>
          );
        })}

        {/* ── 강화 노드 (새로 부각) — emerge 타입 ── */}
        {activeStrengthened.filter(n => n.change_type === 'emerge').map((n, i) => {
          const pos = findNodePos(nodeMap, n.cell, n.concept);
          if (!pos) {
            // 셀 중앙 아래에 새 노드 표시
            const m = CELL_META[n.cell];
            if (!m) return null;
            const ex = m.col * CW + CW / 2;
            const ey = m.row * CH + CH - 30;
            const lines = wrapText(n.concept, 6);
            const bh = lines.length * NODE_LINE_H + NODE_PAD_V * 2;
            const bx = ex - NODE_W / 2; const by = ey - bh / 2;
            return (
              <g key={`em-${i}`}>
                <rect x={bx - 4} y={by - 4} width={NODE_W + 8} height={bh + 8}
                  rx="9" fill="none" stroke="#4ade80" strokeWidth="1.8" strokeOpacity="0.5"
                  filter="url(#glow-green)" />
                <rect x={bx} y={by} width={NODE_W} height={bh} rx="6"
                  fill="rgba(52,211,153,0.12)" stroke="#4ade80" strokeWidth="1.2" strokeOpacity="0.75"
                  strokeDasharray="4 2" />
                {lines.map((line, li) => (
                  <text key={li} x={ex} y={by + NODE_PAD_V + (li + 0.75) * NODE_LINE_H}
                    textAnchor="middle" fontSize="10" fill="#86efac" fillOpacity="0.9">{line}</text>
                ))}
              </g>
            );
          }
          return null;
        })}

        {/* 선택된 차원 없을 때 안내 */}
        {!selectedDimension && (
          <text x={GW / 2} y={GH - 14} textAnchor="middle" fontSize="11"
            fill="rgba(255,255,255,0.2)">
            좌측에서 차원을 선택하면 해당 개입의 네트워크 변화를 확인할 수 있습니다
          </text>
        )}
      </svg>
    </div>
  );
}
