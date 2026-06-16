'use client';

type S = Record<string, string>;
interface Props { scores: S; setScores: (k: string, v: string) => void; }

// ── 기본 입력 컴포넌트 (모듈 레벨 → 리렌더링 시 포커스 유지) ──
function Inp({ f, s, cb, w = 'w-10' }: { f: string; s: S; cb: (k: string, v: string) => void; w?: string }) {
  return (
    <input type="text" value={s[f] ?? ''} onChange={e => cb(f, e.target.value)}
      className={`${w} text-center rounded px-1 py-0.5 text-white text-xs bg-slate-700/80 border border-white/15 outline-none focus:border-indigo-400`} />
  );
}

function SH({ title, color }: { title: string; color: string }) {
  return (
    <div className="text-center text-xs font-bold py-1 rounded-md mb-1.5"
      style={{ background: color + '28', color, border: `1px solid ${color}44` }}>
      {title}
    </div>
  );
}

const C = () => <span className="text-white/35 text-xs mx-0.5">:</span>;
const EQ = () => <span className="text-white/25 text-xs mx-0.5">=</span>;

function Row({ label, children, w = 'flex-1' }: { label: string; children: React.ReactNode; w?: string }) {
  return (
    <div className="flex items-center gap-0.5 py-[2px] min-h-[20px]">
      <span className={`text-white/55 text-xs ${w} leading-none`}>{label}</span>
      <EQ />
      <div className="flex items-center gap-0.5">{children}</div>
    </div>
  );
}

function Box({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-2 border border-white/8" style={{ background: '#1a2744' }}>
      <SH title={title} color={color} />
      <div className="space-y-0">{children}</div>
    </div>
  );
}

export default function RorschachForm({ scores: s, setScores: sc }: Props) {
  const n = (f: string, w?: string) => <Inp f={f} s={s} cb={sc} w={w} />;

  return (
    <div className="space-y-2">
      <div className="text-center text-white/40 text-xs font-semibold py-1 border border-white/10 rounded-md">
        Structural Summary — Ratio, Percentages, and Derivations
      </div>

      {/* ── 상단 4섹션 ── */}
      <div className="grid grid-cols-4 gap-2">

        {/* Core */}
        <Box title="Core" color="#fcd34d">
          <Row label="R">{n('R')}<span className="text-white/25 text-xs mx-1">Lambda</span><EQ />{n('Lambda')}</Row>
          <Row label="EB">{n('EB_M')}<C />{n('EB_WSumC')}<span className="text-white/25 text-xs mx-1">EA</span><EQ />{n('EA')}</Row>
          <div className="text-white/25 text-xs pl-2 py-[1px] italic">EBPer {n('EBPer','w-12')}</div>
          <Row label="eb">{n('eb_L')}<C />{n('eb_R')}<span className="text-white/25 text-xs mx-1">es</span><EQ />{n('es')}</Row>
          <Row label="Adj es">{n('AdjEs')}<span className="text-white/25 text-xs mx-1">D</span><EQ />{n('D_score')}</Row>
          <Row label="Adj D">{n('AdjD')}</Row>
          <div className="border-t border-white/10 my-1" />
          <Row label="FM">{n('FM')}<span className="text-white/25 text-xs mx-1">SumC'</span><EQ />{n('SumCp')}</Row>
          <Row label="m">{n('m')}<span className="text-white/25 text-xs mx-1">SumV</span><EQ />{n('SumV_core')}</Row>
          <Row label="SumT">{n('SumT')}<span className="text-white/25 text-xs mx-1">SumY</span><EQ />{n('SumY')}</Row>
        </Box>

        {/* Affection */}
        <Box title="Affection" color="#f9a8d4">
          <Row label="FC:CF+C">{n('FC')}<C />{n('CFplusC')}</Row>
          <Row label="Pure C">{n('PureC')}</Row>
          <Row label="SumC':WsumC">{n('SumCp_Afr')}<C />{n('WSumC')}</Row>
          <Row label="Afr">{n('Afr')}</Row>
          <Row label="S">{n('S')}</Row>
          <Row label="Blends:R">{n('Blends')}<C />{n('R_Afr')}</Row>
          <Row label="CP">{n('CP')}</Row>
        </Box>

        {/* Interpersonal */}
        <Box title="Interpersonal" color="#86efac">
          <Row label="COP">{n('COP')}<span className="text-white/25 text-xs mx-1">AG</span><EQ />{n('AG')}</Row>
          <Row label="GHR:PHR">{n('GHR')}<C />{n('PHR')}</Row>
          <Row label="a:p">{n('a_int')}<C />{n('p_int')}</Row>
          <Row label="Food">{n('Food')}<span className="text-white/25 text-xs mx-1">SumT</span><EQ />{n('SumT_int')}</Row>
          <Row label="Human Cont">{n('HumanCont')}</Row>
          <Row label="PureH">{n('PureH')}<span className="text-white/25 text-xs mx-1">PER</span><EQ />{n('PER')}</Row>
          <Row label="ISO Index">{n('ISOIndex')}</Row>
        </Box>

        {/* Special Indices */}
        <Box title="Special Indices" color="#c4b5fd">
          {(['PTI','DEPI','CDI','S-CON','HVI','OBS'] as const).map(label => {
            const k = label.replace('-','');
            return (
              <div key={k} className="flex items-center justify-between py-[2px]">
                <span className="text-white/60 text-xs font-medium w-12">{label}</span>
                {n(k)}
              </div>
            );
          })}
        </Box>
      </div>

      {/* ── 하단 4섹션 ── */}
      <div className="grid grid-cols-4 gap-2">

        {/* Ideation */}
        <Box title="Ideation" color="#93c5fd">
          <Row label="a:p">{n('a_ide')}<C />{n('p_ide')}</Row>
          <Row label="Ma:Mp">{n('Ma')}<C />{n('Mp')}</Row>
          <Row label="2AB+Art+Ay">{n('TwoABArtAy')}</Row>
          <Row label="MOR">{n('MOR_ide')}</Row>
          <div className="border-t border-white/10 my-1" />
          <Row label="Sum6">{n('Sum6')}<span className="text-white/25 text-xs mx-1">Lv2</span><EQ />{n('Lv2')}</Row>
          <Row label="WSum6">{n('WSum6')}</Row>
          <Row label="M-">{n('Mminus')}<span className="text-white/25 text-xs mx-1">Mnone</span><EQ />{n('Mnone')}</Row>
        </Box>

        {/* Cognitive Mediation */}
        <Box title="Cognitive Mediation" color="#fde68a">
          <Row label="XA%">{n('XApct')}</Row>
          <Row label="WDA%">{n('WDApct')}</Row>
          <Row label="X-%">{n('Xminuspct')}</Row>
          <Row label="S-">{n('Sminus')}</Row>
          <Row label="P">{n('P')}</Row>
          <Row label="X+%">{n('Xpluspct')}</Row>
          <Row label="Xu%">{n('Xupct')}</Row>
        </Box>

        {/* Information Processing */}
        <Box title="Information Processing" color="#6ee7b7">
          <Row label="Zf">{n('Zf')}</Row>
          <Row label="W:D:Dd">{n('W_proc')}<C />{n('D_proc')}<C />{n('Dd')}</Row>
          <Row label="W:M">{n('W_M_l')}<C />{n('W_M_r')}</Row>
          <Row label="Zd">{n('Zd')}</Row>
          <Row label="PSV">{n('PSV')}</Row>
          <Row label="DQ+">{n('DQplus')}</Row>
          <Row label="DQv">{n('DQv')}</Row>
        </Box>

        {/* Self-Perception */}
        <Box title="Self-Perception" color="#fca5a5">
          <Row label="3r+(2)/R">{n('ThreeRatio')}</Row>
          <Row label="Fr+rF">{n('FrplusrF')}</Row>
          <Row label="SumV">{n('SumV_self')}</Row>
          <Row label="FD">{n('FD')}</Row>
          <Row label="An+Xy">{n('AnplusXy')}</Row>
          <Row label="MOR">{n('MOR_self')}</Row>
          <Row label="H:(H)+Hd">{n('H_full')}<C />{n('H_paren')}</Row>
        </Box>
      </div>
    </div>
  );
}
