'use client';

// ── 격자 상수 ───────────────────────────────────────────────────────
const GW = 1080;
const GH = 690;
const CW  = GW / 3;   // 360 px per cell
const CH  = GH / 3;   // 230 px per cell
const NODE_W      = 128;  // concept box width
const NODE_LINE_H = 17;   // per text line
const NODE_PAD_V  = 10;   // vertical inner padding
const CURVE       = 0.24; // bezier curvature factor

// ── 9차원 메타 ──────────────────────────────────────────────────────
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

// ── 엣지 스타일 ────────────────────────────────────────────────────
const EDGE_CFG: Record<string, { color: string; dash: string; width: number }> = {
  causes:     { color: '#f87171', dash: '',      width: 2.4 },
  maintains:  { color: '#fbbf24', dash: '',      width: 2.0 },
  correlates: { color: '#94a3b8', dash: '6 3',   width: 1.6 },
  protects:   { color: '#4ade80', dash: '2 4',   width: 2.0 },
};
const EDGE_LABEL: Record<string, string> = {
  causes: '유발', maintains: '유지', correlates: '상관', protects: '보호',
};

// ── 타입 ────────────────────────────────────────────────────────────
interface GridCell {
  key_concepts?: string[];
  maladaptive_pattern?: string;
  clinical_indicators?: string;
}
interface Edge {
  from: string; from_concept?: string;
  to:   string; to_concept?:   string;
  type: string; bidirectional?: boolean;
}
interface NodePos { x: number; y: number; lines: string[]; color: string; boxH: number; }

// ── 유틸 ────────────────────────────────────────────────────────────
function wrapText(text: string, maxCh = 6): string[] {
  if (!text) return [''];
  const lines: string[] = [];
  for (let i = 0; i < text.length; i += maxCh) lines.push(text.slice(i, i + maxCh));
  return lines;
}

/** 3가지 배치: 1→중앙 / 2→좌우 / 3→삼각 */
function conceptPositions(cellKey: string, count: number): { x: number; y: number }[] {
  const m = CELL_META[cellKey];
  if (!m || count === 0) return [];
  const cx = m.col * CW + CW / 2;
  const cy = m.row * CH + CH / 2;
  const offX = CW  * 0.22;   // ~80 px
  const offY = CH  * 0.27;   // ~62 px
  if (count === 1) return [{ x: cx, y: cy }];
  if (count === 2) return [{ x: cx - offX, y: cy }, { x: cx + offX, y: cy }];
  return [
    { x: cx,        y: cy - offY * 0.9 },
    { x: cx - offX, y: cy + offY * 0.6 },
    { x: cx + offX, y: cy + offY * 0.6 },
  ];
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

function qPath(x1: number, y1: number, x2: number, y2: number, side: number): string {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const { dx, dy, len } = norm(x1, y1, x2, y2);
  if (len < 1) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const bend = len * CURVE * side;
  return `M ${x1} ${y1} Q ${mx - dy * bend} ${my + dx * bend} ${x2} ${y2}`;
}

/** 2차 베지어 t=0.5 지점 */
function qMid(x1: number, y1: number, x2: number, y2: number, side: number) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const { dx, dy, len } = norm(x1, y1, x2, y2);
  if (len < 1) return { x: mx, y: my };
  const bend = len * CURVE * side;
  const qcx = mx - dy * bend, qcy = my + dx * bend;
  return { x: 0.25 * x1 + 0.5 * qcx + 0.25 * x2, y: 0.25 * y1 + 0.5 * qcy + 0.25 * y2 };
}

// ── 컴포넌트 ─────────────────────────────────────────────────────────
export default function EEMMNetwork({
  grid, edges,
}: {
  grid:  Record<string, GridCell>;
  edges: Edge[];
}) {
  // ① 노드 맵 구성
  const nodeMap = new Map<string, NodePos>();
  Object.entries(CELL_META).forEach(([key, meta]) => {
    const concepts = (grid?.[key]?.key_concepts ?? []).filter(Boolean).slice(0, 3);
    const positions = conceptPositions(key, concepts.length);
    concepts.forEach((c, i) => {
      const pos = positions[i];
      if (!pos) return;
      const lines = wrapText(c);
      const boxH  = lines.length * NODE_LINE_H + NODE_PAD_V * 2;
      nodeMap.set(`${key}::${c}`, { x: pos.x, y: pos.y, lines, color: meta.color, boxH });
    });
  });

  // ② 노드 위치 조회 (퍼지 매칭 포함)
  function getPos(cellKey: string, concept?: string): { x: number; y: number; boxH: number } {
    if (concept) {
      const exact = nodeMap.get(`${cellKey}::${concept}`);
      if (exact) return exact;
      for (const [k, v] of nodeMap)
        if (k.startsWith(`${cellKey}::`) && concept.length >= 2 && k.includes(concept.slice(0, 2))) return v;
    }
    for (const [k, v] of nodeMap) if (k.startsWith(`${cellKey}::`)) return v;
    const m = CELL_META[cellKey];
    if (!m) return { x: GW / 2, y: GH / 2, boxH: 36 };
    return { x: m.col * CW + CW / 2, y: m.row * CH + CH / 2, boxH: 36 };
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${GW} ${GH}`}
        style={{ width: '100%', maxWidth: GW, display: 'block', fontFamily: 'system-ui, sans-serif' }}
      >
        {/* ── defs ── */}
        <defs>
          {/* 드롭 섀도우 */}
          <filter id="ns" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.6)" />
          </filter>

          {/* 화살촉 마커 (forward) */}
          {Object.entries(EDGE_CFG).map(([type, cfg]) => (
            <marker key={`f-${type}`} id={`af-${type}`}
              markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
              <path d="M0 0L10 4L0 8z" fill={cfg.color} opacity="0.95" />
            </marker>
          ))}
          {/* 화살촉 마커 (reverse) */}
          {Object.entries(EDGE_CFG).map(([type, cfg]) => (
            <marker key={`r-${type}`} id={`ar-${type}`}
              markerWidth="10" markerHeight="8" refX="1" refY="4" orient="auto-start-reverse">
              <path d="M10 0L0 4L10 8z" fill={cfg.color} opacity="0.95" />
            </marker>
          ))}

          {/* 셀별 배경 그라디언트 */}
          {Object.entries(CELL_META).map(([key, m]) => (
            <radialGradient key={key} id={`bg-${key}`}
              cx="50%" cy="50%" r="60%" fx="50%" fy="50%">
              <stop offset="0%"   stopColor={m.color} stopOpacity="0.12" />
              <stop offset="100%" stopColor={m.color} stopOpacity="0.03" />
            </radialGradient>
          ))}
        </defs>

        {/* ── 셀 배경 ── */}
        {Object.entries(CELL_META).map(([key, m]) => (
          <rect key={key}
            x={m.col * CW + 1} y={m.row * CH + 1}
            width={CW - 2}     height={CH - 2}
            rx={10}
            fill={`url(#bg-${key})`}
            stroke={m.color + '30'}
            strokeWidth={1}
          />
        ))}

        {/* ── 격자 구분선 ── */}
        {[1, 2].map(i => (
          <line key={`vc${i}`}
            x1={i * CW} y1={4} x2={i * CW} y2={GH - 4}
            stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        ))}
        {[1, 2].map(i => (
          <line key={`hc${i}`}
            x1={4} y1={i * CH} x2={GW - 4} y2={i * CH}
            stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
        ))}

        {/* ── 셀 레이블 ── */}
        {Object.entries(CELL_META).map(([key, m]) => (
          <g key={key}>
            <circle cx={m.col * CW + 14} cy={m.row * CH + 18} r={3.5} fill={m.color} opacity={0.9} />
            <text
              x={m.col * CW + 22} y={m.row * CH + 23}
              fontSize={11.5} fontWeight="700"
              fill={m.color} opacity={0.75}
              style={{ userSelect: 'none' }}
            >{m.label}</text>
          </g>
        ))}

        {/* ── 엣지 ── */}
        {(edges ?? []).map((edge, i) => {
          if (!CELL_META[edge.from] || !CELL_META[edge.to]) return null;
          const cfg = EDGE_CFG[edge.type] ?? EDGE_CFG.correlates;
          const fp  = getPos(edge.from, edge.from_concept);
          const tp  = getPos(edge.to,   edge.to_concept);
          if (fp.x === tp.x && fp.y === tp.y) return null;

          const fm  = fp.boxH / 2 + 7;
          const tm  = tp.boxH / 2 + 7;
          const fs  = toward(fp.x, fp.y, tp.x, tp.y, fm);
          const fe  = toward(tp.x, tp.y, fp.x, fp.y, tm);
          const mid = qMid(fs.x, fs.y, fe.x, fe.y, 1);
          const lbl = EDGE_LABEL[edge.type] ?? '';

          if (edge.bidirectional) {
            const mid2 = qMid(fe.x, fe.y, fs.x, fs.y, 1);
            return (
              <g key={i}>
                <path d={qPath(fs.x, fs.y, fe.x, fe.y, +1)}
                  fill="none" stroke={cfg.color} strokeWidth={cfg.width}
                  strokeDasharray={cfg.dash} opacity={0.85}
                  markerEnd={`url(#af-${edge.type})`} />
                <path d={qPath(fe.x, fe.y, fs.x, fs.y, +1)}
                  fill="none" stroke={cfg.color} strokeWidth={cfg.width}
                  strokeDasharray={cfg.dash} opacity={0.85}
                  markerEnd={`url(#af-${edge.type})`} />
                <rect x={mid.x - 14} y={mid.y - 10} width={28} height={14} rx={4}
                  fill="rgba(7,12,24,0.75)" />
                <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="middle"
                  fontSize={9} fontWeight="600" fill={cfg.color} opacity={0.85}
                  style={{ userSelect: 'none' }}>{lbl}↔</text>
              </g>
            );
          }

          return (
            <g key={i}>
              <path d={qPath(fs.x, fs.y, fe.x, fe.y, +1)}
                fill="none" stroke={cfg.color} strokeWidth={cfg.width}
                strokeDasharray={cfg.dash} opacity={0.85}
                markerEnd={`url(#af-${edge.type})`} />
              {lbl && (
                <>
                  <rect x={mid.x - 12} y={mid.y - 9} width={24} height={13} rx={4}
                    fill="rgba(7,12,24,0.75)" />
                  <text x={mid.x} y={mid.y - 2} textAnchor="middle" dominantBaseline="middle"
                    fontSize={9} fontWeight="600" fill={cfg.color} opacity={0.85}
                    style={{ userSelect: 'none' }}>{lbl}</text>
                </>
              )}
            </g>
          );
        })}

        {/* ── 개념 노드 ── */}
        {Array.from(nodeMap.entries()).map(([key, nd]) => {
          const rx = nd.lines.length === 1 ? nd.boxH / 2 : 10;
          return (
            <g key={key} filter="url(#ns)">
              {/* 글로우 halo */}
              <rect
                x={nd.x - NODE_W / 2 - 2} y={nd.y - nd.boxH / 2 - 2}
                width={NODE_W + 4}         height={nd.boxH + 4}
                rx={rx + 2}
                fill="none"
                stroke={nd.color} strokeWidth={3} opacity={0.18}
              />
              {/* 박스 */}
              <rect
                x={nd.x - NODE_W / 2} y={nd.y - nd.boxH / 2}
                width={NODE_W}        height={nd.boxH}
                rx={rx}
                fill="#080e1c"
                stroke={nd.color} strokeWidth={1.8}
              />
              {/* 텍스트 */}
              {nd.lines.map((line, li) => {
                const totalH = nd.lines.length * NODE_LINE_H;
                const sy     = nd.y - totalH / 2 + NODE_LINE_H / 2;
                return (
                  <text key={li}
                    x={nd.x} y={sy + li * NODE_LINE_H}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={12.5} fontWeight="650"
                    fill="rgba(255,255,255,0.92)"
                    style={{ userSelect: 'none' }}
                  >{line}</text>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* ── 범례 ── */}
      <div style={{ display: 'flex', gap: 24, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center', paddingBottom: 4 }}>
        {Object.entries(EDGE_CFG).map(([type, cfg]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width={40} height={16} style={{ overflow: 'visible' }}>
              <defs>
                <marker id={`lg-${type}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <path d="M0 0L8 3L0 6z" fill={cfg.color} />
                </marker>
              </defs>
              <line x1={0} y1={8} x2={30} y2={8}
                stroke={cfg.color} strokeWidth={cfg.width}
                strokeDasharray={cfg.dash}
                markerEnd={`url(#lg-${type})`} />
            </svg>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
              {EDGE_LABEL[type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
