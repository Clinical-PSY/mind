export interface RorschachResponse {
  id: string;
  card: string;     // I-X
  location: string; // W, D, Dd, WS, DS, DdS
  dq: string;       // +, o, v/+, v
  determinants: string[]; // Ma, Mp, FMa, FC, etc.
  fq: string;       // +, o, u, -, none
  pair: boolean;
  contents: string[]; // H, (H), Hd, A, etc.
  popular: boolean;
  zScore: string;   // ZW, ZA, ZD, ZS, or ''
  specialScores: string[]; // DV1, INCOM1, AG, COP, etc.
}

// Exner CS Z-score table (Card × ZType → value)
const Z_SCORES: Record<string, Record<string, number>> = {
  'I':   { ZW: 1.0, ZA: 4.0, ZD: 6.0, ZS: 3.5 },
  'II':  { ZW: 4.5, ZA: 3.0, ZD: 5.5, ZS: 4.5 },
  'III': { ZW: 5.5, ZA: 3.0, ZD: 4.0, ZS: 4.5 },
  'IV':  { ZW: 2.0, ZA: 4.0, ZD: 3.5, ZS: 5.0 },
  'V':   { ZW: 1.0, ZA: 2.5, ZD: 5.0, ZS: 4.0 },
  'VI':  { ZW: 2.5, ZA: 2.5, ZD: 6.0, ZS: 6.5 },
  'VII': { ZW: 2.5, ZA: 1.0, ZD: 3.0, ZS: 4.0 },
  'VIII':{ ZW: 4.5, ZA: 3.0, ZD: 3.0, ZS: 4.0 },
  'IX':  { ZW: 5.5, ZA: 2.5, ZD: 4.5, ZS: 5.0 },
  'X':   { ZW: 5.5, ZA: 4.0, ZD: 4.5, ZS: 6.0 },
};

// Zf → ZEst lookup table
const Z_EST: Record<number, number> = {
  2: 2.5,  3: 6.0,   4: 10.0,  5: 13.5,  6: 17.0,  7: 20.5,  8: 24.0,  9: 27.5,
  10: 31.0, 11: 34.5, 12: 38.0, 13: 41.5, 14: 45.5, 15: 49.0, 16: 52.5, 17: 56.0,
  18: 59.5, 19: 63.0, 20: 66.5, 21: 70.0, 22: 73.5, 23: 77.0, 24: 81.0, 25: 84.5,
  26: 88.0, 27: 91.5, 28: 95.0, 29: 98.5, 30: 102.5, 31: 105.5, 32: 109.5, 33: 112.5,
  34: 116.5, 35: 120.0, 36: 123.5, 37: 127.0, 38: 130.5, 39: 134.0, 40: 137.5,
  41: 141.0, 42: 144.5, 43: 148.0, 45: 155.5, 46: 159.0, 47: 162.5, 48: 166.0,
  49: 169.5, 50: 173.0,
};

function dScore(ea: number, es: number): string {
  const d = ea - es;
  if (d > 12.5) return '+5'; if (d > 10) return '+4'; if (d > 7.5) return '+3';
  if (d > 5)    return '+2'; if (d > 2.5) return '+1'; if (d > -3) return '0';
  if (d > -5.5) return '-1'; if (d > -8)  return '-2'; if (d > -10.5) return '-3';
  if (d > -13)  return '-4'; return '-5';
}

export interface StructuralSummary {
  // Location
  W: number; D: number; Dd: number; S: number;
  // DQ
  DQplus: number; DQo: number; DQvplus: number; DQv: number;
  // Determinants (raw)
  M: number; FM: number; m: number;
  FC: number; CF: number; C: number; Cn: number;
  FCp: number; CpF: number; Cp: number;
  FT: number; TF: number; T: number;
  FV: number; VF: number; V: number;
  FY: number; YF: number; Y: number;
  FD: number; Fr: number; rF: number; F: number;
  // Determinant sums
  SumCp: number; SumT: number; SumV: number; SumY: number; WSumC: number;
  // Core
  R: number;
  Lambda: number | string;
  EA: number; EBPer: number | string;
  eb_left: number; eb_right: number; es: number; AdjEs: number;
  D_score: string; AdjD: string;
  // FQ
  FQx_plus: number; FQx_o: number; FQx_u: number; FQx_minus: number; FQx_none: number;
  Mminus: number; Mnone: number;
  WD_plus: number; WD_o: number; WD_u: number; WD_minus: number;
  // Contents
  H: number; Hparen: number; Hd: number; Hdparen: number; Hx: number;
  A: number; Aparen: number; Ad: number; Adparen: number;
  An: number; Art: number; Ay: number; Bl: number; Bt: number;
  Cg: number; Cl: number; Ex: number; Fd: number; Fi: number;
  Ge: number; Hh: number; Ls: number; Na: number; Sc: number;
  Sx: number; Xy: number; Id: number;
  // Special scores
  DV1: number; INCOM1: number; DR1: number; FABCOM1: number; ALOG: number; CONTAM: number;
  DV2: number; INCOM2: number; DR2: number; FABCOM2: number;
  AB: number; AG: number; COP: number; CP_ss: number; MOR: number; PER: number; PSV: number;
  Sum6: number; WSum6: number; Lv2: number;
  // Misc
  pair_count: number; P: number;
  Zf: number; ZSum: number; ZEst: number; Zd: number;
  Blends: number; colorShadingBlends: number;
  // Derived ratios
  a: number; p: number; Ma_count: number; Mp_count: number;
  GHR: number; PHR: number;
  Afr: number; Sminus: number;
  XApct: number; WDApct: number; Xminuspct: number; Xpluspct: number; Xupct: number;
  HumanCont: number; ISOIndex: number; FrplusrF: number; egocentricity: number;
  twoABArtAy: number;
  // Special indices
  PTI: number; DEPI: number; CDI: number; SCON: number; HVI: boolean; OBS: boolean;
}

export function calculateStructuralSummary(responses: RorschachResponse[]): StructuralSummary {
  const r = responses.filter(x => x.card !== '');
  const R = r.length;

  const cntD  = (types: string[]) => r.reduce((n, x) => n + x.determinants.filter(d => types.includes(d)).length, 0);
  const cntC  = (type: string)    => r.reduce((n, x) => n + x.contents.filter(c => c === type).length, 0);
  const cntSS = (type: string)    => r.reduce((n, x) => n + x.specialScores.filter(s => s === type).length, 0);

  // Location
  const W  = r.filter(x => x.location.startsWith('W')).length;
  const D  = r.filter(x => x.location === 'D' || x.location === 'DS').length;
  const Dd = r.filter(x => x.location.startsWith('Dd')).length;
  const S  = r.filter(x => x.location.endsWith('S')).length;

  // DQ
  const DQplus  = r.filter(x => x.dq === '+').length;
  const DQo     = r.filter(x => x.dq === 'o').length;
  const DQvplus = r.filter(x => x.dq === 'v/+').length;
  const DQv     = r.filter(x => x.dq === 'v').length;

  // Determinants
  const M  = cntD(['Ma', 'Mp', 'Ma-p']);
  const FM = cntD(['FMa', 'FMp', 'FMa-p']);
  const m  = cntD(['ma', 'mp', 'ma-p']);
  const FC = cntD(['FC']); const CF = cntD(['CF']); const C = cntD(['C']); const Cn = cntD(['Cn']);
  const FCp = cntD(["FC'"]); const CpF = cntD(["C'F"]); const Cp = cntD(["C'"]);
  const FT = cntD(['FT']); const TF = cntD(['TF']); const T = cntD(['T']);
  const FV = cntD(['FV']); const VF = cntD(['VF']); const V = cntD(['V']);
  const FY = cntD(['FY']); const YF = cntD(['YF']); const Y = cntD(['Y']);
  const FD = cntD(['FD']); const Fr = cntD(['Fr']); const rF = cntD(['rF']); const F = cntD(['F']);

  const SumCp = FCp + CpF + Cp;
  const SumT  = FT + TF + T;
  const SumV  = FV + VF + V;
  const SumY  = FY + YF + Y;
  const WSumC = FC * 0.5 + CF + C * 1.5;

  // Core ratios
  const Lambda = R - F === 0
    ? (F === 0 ? 'Very Low' : 'Very High')
    : parseFloat((F / (R - F)).toFixed(2));
  const EA = M + WSumC;
  const EBPer: number | string = (M === 0 || WSumC === 0) ? 'N/A'
    : parseFloat((Math.max(M, WSumC) / Math.min(M, WSumC)).toFixed(1));
  const eb_left  = FM + m;
  const eb_right = SumCp + SumV + SumT + SumY;
  const es   = eb_left + eb_right;
  const AdjEs = es - Math.max(0, SumY - 1) - Math.max(0, m - 1);
  const D_score = dScore(EA, es);
  const AdjD    = dScore(EA, AdjEs);

  // FQ
  const FQx_plus  = r.filter(x => x.fq === '+').length;
  const FQx_o     = r.filter(x => x.fq === 'o').length;
  const FQx_u     = r.filter(x => x.fq === 'u').length;
  const FQx_minus = r.filter(x => x.fq === '-').length;
  const FQx_none  = r.filter(x => x.fq === 'none').length;
  const isWD = (x: RorschachResponse) => x.location.startsWith('W') || x.location === 'D' || x.location === 'DS';
  const WD_plus  = r.filter(x => x.fq === '+' && isWD(x)).length;
  const WD_o     = r.filter(x => x.fq === 'o' && isWD(x)).length;
  const WD_u     = r.filter(x => x.fq === 'u' && isWD(x)).length;
  const WD_minus = r.filter(x => x.fq === '-' && isWD(x)).length;
  const hasM_fn  = (x: RorschachResponse) => x.determinants.some(d => ['Ma','Mp','Ma-p'].includes(d));
  const Mminus = r.filter(x => x.fq === '-'    && hasM_fn(x)).length;
  const Mnone  = r.filter(x => x.fq === 'none' && hasM_fn(x)).length;

  // Contents
  const H = cntC('H'); const Hparen = cntC('(H)'); const Hd = cntC('Hd'); const Hdparen = cntC('(Hd)');
  const Hx = cntC('Hx'); const A = cntC('A'); const Aparen = cntC('(A)'); const Ad = cntC('Ad');
  const Adparen = cntC('(Ad)'); const An = cntC('An'); const Art = cntC('Art'); const Ay = cntC('Ay');
  const Bl = cntC('Bl'); const Bt = cntC('Bt'); const Cg = cntC('Cg'); const Cl = cntC('Cl');
  const Ex = cntC('Ex'); const Fd = cntC('Fd'); const Fi = cntC('Fi'); const Ge = cntC('Ge');
  const Hh = cntC('Hh'); const Ls = cntC('Ls'); const Na = cntC('Na'); const Sc = cntC('Sc');
  const Sx = cntC('Sx'); const Xy = cntC('Xy'); const Id = cntC('Id');

  // Special scores
  const DV1 = cntSS('DV1'); const INCOM1 = cntSS('INCOM1'); const DR1 = cntSS('DR1');
  const FABCOM1 = cntSS('FABCOM1'); const ALOG = cntSS('ALOG'); const CONTAM = cntSS('CONTAM');
  const DV2 = cntSS('DV2'); const INCOM2 = cntSS('INCOM2'); const DR2 = cntSS('DR2');
  const FABCOM2 = cntSS('FABCOM2');
  const AB = cntSS('AB'); const AG = cntSS('AG'); const COP = cntSS('COP');
  const CP_ss = cntSS('CP'); const MOR = cntSS('MOR'); const PER = cntSS('PER'); const PSV = cntSS('PSV');
  const Sum6  = DV1 + INCOM1 + DR1 + FABCOM1 + ALOG + CONTAM + DV2 + INCOM2 + DR2 + FABCOM2;
  const WSum6 = DV1*1 + INCOM1*2 + DR1*3 + FABCOM1*4 + ALOG*5 + CONTAM*7 + DV2*2 + INCOM2*4 + DR2*6 + FABCOM2*7;
  const Lv2   = DV2 + INCOM2 + DR2 + FABCOM2;

  // Z scores
  const Zf  = r.filter(x => x.zScore !== '' && x.zScore !== '-').length;
  const ZSum = r.reduce((s, x) => s + (Z_SCORES[x.card]?.[x.zScore] ?? 0), 0);
  const ZEst = Z_EST[Zf] ?? 0;
  const Zd   = parseFloat((ZSum - ZEst).toFixed(1));

  // Blends
  const Blends = r.filter(x => x.determinants.length >= 2).length;
  const COLOR_DETS   = ['FC','CF','C','Cn'];
  const SHADING_DETS = ["FC'","C'F","C'","FT","TF","T","FV","VF","V","FY","YF","Y","FD"];
  const colorShadingBlends = r.filter(x =>
    x.determinants.some(d => COLOR_DETS.includes(d)) &&
    x.determinants.some(d => SHADING_DETS.includes(d))
  ).length;

  // pair & P
  const pair_count = r.filter(x => x.pair).length;
  const P = r.filter(x => x.popular).length;

  // a:p
  const a = r.reduce((n, x) => n + x.determinants.filter(d => ['Ma','FMa','ma','Ma-p','FMa-p','ma-p'].includes(d)).length, 0);
  const p = r.reduce((n, x) => n + x.determinants.filter(d => ['Mp','FMp','mp','Ma-p','FMa-p','ma-p'].includes(d)).length, 0);
  const Ma_count = r.reduce((n, x) => n + x.determinants.filter(d => ['Ma','Ma-p'].includes(d)).length, 0);
  const Mp_count = r.reduce((n, x) => n + x.determinants.filter(d => ['Mp','Ma-p'].includes(d)).length, 0);

  // GHR / PHR
  let GHR = 0, PHR = 0;
  for (const x of r) {
    const humanCont = x.contents.some(c => ['H','(H)','Hd','(Hd)','Hx'].includes(c));
    const hasM_r    = x.determinants.some(d => ['Ma','Mp','Ma-p'].includes(d));
    const hasFM_r   = x.determinants.some(d => ['FMa','FMp','FMa-p'].includes(d));
    const hasCOP_r  = x.specialScores.includes('COP');
    const hasAG_r   = x.specialScores.includes('AG');
    if (!humanCont && !hasM_r && !(hasFM_r && (hasCOP_r || hasAG_r))) continue;

    const fqGood    = ['+','o','u'].includes(x.fq);
    const hasDR_r   = x.specialScores.some(s => ['DR1','DR2'].includes(s));
    const hasINCOM_r= x.specialScores.some(s => ['INCOM1','INCOM2'].includes(s));
    const hasFAB_r  = x.specialScores.some(s => ['FABCOM1','FABCOM2'].includes(s));
    const hasMOR_r  = x.specialScores.includes('MOR');
    const hasBadL2  = x.specialScores.some(s => ['ALOG','CONTAM','DV2','INCOM2','DR2','FABCOM2'].includes(s));

    if (x.contents.includes('H') && fqGood && !hasDR_r && !hasINCOM_r && !hasFAB_r &&
        !x.specialScores.includes('ALOG') && !hasAG_r && !hasMOR_r && !x.specialScores.includes('CONTAM'))
      { GHR++; continue; }
    if (!fqGood || hasBadL2) { PHR++; continue; }
    if (hasCOP_r && !hasAG_r) { GHR++; continue; }
    if (hasFAB_r || hasMOR_r || x.contents.includes('An')) { PHR++; continue; }
    if (['III','IV','VII','IX'].includes(x.card) && x.popular) { GHR++; continue; }
    if (hasAG_r || hasINCOM_r || hasDR_r || x.contents.includes('Hd')) { PHR++; continue; }
    GHR++;
  }

  // Percentages
  const cardsColor = r.filter(x => ['VIII','IX','X'].includes(x.card)).length;
  const cardsAch   = r.filter(x => ['I','II','III','IV','V','VI','VII'].includes(x.card)).length;
  const Afr    = cardsAch > 0 ? parseFloat((cardsColor / cardsAch).toFixed(2)) : 0;
  const Sminus = r.filter(x => x.fq === '-' && x.location.endsWith('S')).length;
  const WD_total = W + D;
  const XApct     = R > 0 ? parseFloat(((FQx_plus + FQx_o + FQx_u) / R).toFixed(2)) : 0;
  const WDApct    = WD_total > 0 ? parseFloat(((WD_plus + WD_o + WD_u) / WD_total).toFixed(2)) : 0;
  const Xminuspct = R > 0 ? parseFloat((FQx_minus / R).toFixed(2)) : 0;
  const Xpluspct  = R > 0 ? parseFloat(((FQx_plus + FQx_o) / R).toFixed(2)) : 0;
  const Xupct     = R > 0 ? parseFloat((FQx_u / R).toFixed(2)) : 0;
  const HumanCont = H + Hparen + Hd + Hdparen;
  const ISOIndex  = R > 0 ? parseFloat(((2*Na + 2*Cl + Bt + Ls + Ge) / R).toFixed(2)) : 0;
  const FrplusrF  = Fr + rF;
  const egocentricity = R > 0 ? parseFloat(((FrplusrF * 3 + pair_count) / R).toFixed(2)) : 0;
  const twoABArtAy = AB * 2 + Art + Ay;

  // ── Special Indices ────────────────────────────────────────────
  const PTI = (
    (XApct < 0.70 && WDApct < 0.75 ? 1 : 0) +
    (Xminuspct > 0.29 ? 1 : 0) +
    (Lv2 > 2 && FABCOM2 > 0 ? 1 : 0) +
    ((R < 17 && WSum6 > 12) || (R >= 17 && WSum6 > 17) ? 1 : 0) +
    (Mminus > 1 || Xminuspct > 0.40 ? 1 : 0)
  );

  const DEPI = (
    (SumV > 0 || FD > 2 ? 1 : 0) +
    (colorShadingBlends > 0 || S > 2 ? 1 : 0) +
    ((egocentricity > 0.44 && FrplusrF === 0) || egocentricity < 0.33 ? 1 : 0) +
    (Afr < 0.46 || Blends < 4 ? 1 : 0) +
    (eb_right > eb_left || SumCp > 2 ? 1 : 0) +
    (MOR > 2 || twoABArtAy > 3 ? 1 : 0) +
    (COP < 2 || ISOIndex > 0.24 ? 1 : 0)
  );

  const adjD_num = parseInt(AdjD);
  const CDI = (
    (EA < 6 || adjD_num < 0 ? 1 : 0) +
    (COP < 2 && AG < 2 ? 1 : 0) +
    (WSumC < 2.5 || Afr < 0.46 ? 1 : 0) +
    (p > a + 1 || H < 2 ? 1 : 0) +
    (SumT > 1 || ISOIndex > 0.24 || Fd > 0 ? 1 : 0)
  );

  const SCON = (
    (SumV + FD > 2 ? 1 : 0) +
    (colorShadingBlends > 0 ? 1 : 0) +
    (egocentricity < 0.33 || egocentricity > 0.44 ? 1 : 0) +
    (MOR > 3 ? 1 : 0) +
    (Math.abs(Zd) > 3.5 ? 1 : 0) +
    (es > EA ? 1 : 0) +
    (CF + C > FC ? 1 : 0) +
    (Xpluspct < 0.70 ? 1 : 0) +
    (S > 3 ? 1 : 0) +
    (P < 3 || P > 8 ? 1 : 0) +
    (H < 2 ? 1 : 0) +
    (R < 17 ? 1 : 0)
  );

  const hvi1 = SumT === 0;
  const hvi_sub = [
    Zf > 12, Zd > 3.5, S > 3, H + Hparen + Hd + Hdparen > 6,
    Hparen + Aparen + Hdparen + Adparen > 3,
    Hd + Ad > 0 ? (H + A) / (Hd + Ad) < 4 : false,
    Cg > 3,
  ].filter(Boolean).length;
  const HVI = hvi1 && hvi_sub >= 4;

  const obs1 = Dd > 3, obs2 = Zf > 12, obs3 = Zd > 3.0, obs4 = P > 7, obs5 = FQx_plus > 1;
  const cnt14 = [obs1,obs2,obs3,obs4].filter(Boolean).length;
  const cnt15 = [obs1,obs2,obs3,obs4,obs5].filter(Boolean).length;
  const OBS = cnt15 === 5 ||
    (cnt14 >= 2 && FQx_plus > 3) ||
    (cnt15 >= 3 && Xpluspct > 0.89) ||
    (FQx_plus > 3 && Xpluspct > 0.89);

  return {
    W, D, Dd, S, DQplus, DQo, DQvplus, DQv,
    M, FM, m, FC, CF, C, Cn, FCp, CpF, Cp, FT, TF, T, FV, VF, V, FY, YF, Y, FD, Fr, rF, F,
    SumCp, SumT, SumV, SumY, WSumC,
    R, Lambda, EA, EBPer, eb_left, eb_right, es, AdjEs, D_score, AdjD,
    FQx_plus, FQx_o, FQx_u, FQx_minus, FQx_none, Mminus, Mnone,
    WD_plus, WD_o, WD_u, WD_minus,
    H, Hparen, Hd, Hdparen, Hx, A, Aparen, Ad, Adparen, An, Art, Ay, Bl, Bt,
    Cg, Cl, Ex, Fd, Fi, Ge, Hh, Ls, Na, Sc, Sx, Xy, Id,
    DV1, INCOM1, DR1, FABCOM1, ALOG, CONTAM, DV2, INCOM2, DR2, FABCOM2,
    AB, AG, COP, CP_ss, MOR, PER, PSV, Sum6, WSum6, Lv2,
    pair_count, P, Zf, ZSum, ZEst, Zd, Blends, colorShadingBlends,
    a, p, Ma_count, Mp_count, GHR, PHR,
    Afr, Sminus, XApct, WDApct, Xminuspct, Xpluspct, Xupct,
    HumanCont, ISOIndex, FrplusrF, egocentricity, twoABArtAy,
    PTI, DEPI, CDI, SCON, HVI, OBS,
  };
}

// Convert StructuralSummary to the scores Record<string,string> used by RorschachForm
export function summaryToScores(s: StructuralSummary): Record<string, string> {
  const n = (v: number | string | boolean, dec = 0): string => {
    if (typeof v === 'boolean') return v ? 'Y' : 'N';
    if (typeof v === 'string') return v;
    if (!isFinite(v) || isNaN(v)) return '—';
    return dec > 0 ? v.toFixed(dec) : String(Math.round(v));
  };
  const pct = (v: number) => isNaN(v) || !isFinite(v) ? '—' : v.toFixed(2);

  return {
    // Core
    R: n(s.R), Lambda: typeof s.Lambda === 'number' ? n(s.Lambda, 2) : String(s.Lambda),
    EB_M: n(s.M), EB_WSumC: n(s.WSumC, 1), EA: n(s.EA, 1),
    EBPer: typeof s.EBPer === 'number' ? n(s.EBPer, 1) : String(s.EBPer),
    eb_L: n(s.eb_left), eb_R: n(s.eb_right), es: n(s.es),
    AdjEs: n(s.AdjEs), D_score: s.D_score, AdjD: s.AdjD,
    FM: n(s.FM), m: n(s.m),
    SumCp: n(s.SumCp), SumV_core: n(s.SumV), SumT: n(s.SumT), SumY: n(s.SumY),
    // Affection
    FC: n(s.FC), CFplusC: n(s.CF + s.C), PureC: n(s.C),
    SumCp_Afr: n(s.SumCp), WSumC: n(s.WSumC, 1),
    Afr: pct(s.Afr), S: n(s.S), Blends: n(s.Blends), R_Afr: n(s.R), CP: n(s.CP_ss),
    // Interpersonal
    COP: n(s.COP), AG: n(s.AG), GHR: n(s.GHR), PHR: n(s.PHR),
    a_int: n(s.a), p_int: n(s.p),
    Food: n(s.Fd), SumT_int: n(s.SumT),
    HumanCont: n(s.HumanCont), PureH: n(s.H), PER: n(s.PER), ISOIndex: pct(s.ISOIndex),
    // Special Indices
    PTI: n(s.PTI), DEPI: n(s.DEPI), CDI: n(s.CDI),
    SCON: n(s.SCON), HVI: s.HVI ? 'Y' : 'N', OBS: s.OBS ? 'Y' : 'N',
    // Ideation
    a_ide: n(s.a), p_ide: n(s.p),
    Ma: n(s.Ma_count), Mp: n(s.Mp_count),
    TwoABArtAy: n(s.twoABArtAy), MOR_ide: n(s.MOR),
    Sum6: n(s.Sum6), Lv2: n(s.Lv2), WSum6: n(s.WSum6),
    Mminus: n(s.Mminus), Mnone: n(s.Mnone),
    // Cognitive Mediation
    XApct: pct(s.XApct), WDApct: pct(s.WDApct), Xminuspct: pct(s.Xminuspct),
    Sminus: n(s.Sminus), P: n(s.P), Xpluspct: pct(s.Xpluspct), Xupct: pct(s.Xupct),
    // Information Processing
    Zf: n(s.Zf), W_proc: n(s.W), D_proc: n(s.D), Dd: n(s.Dd),
    W_M_l: n(s.W), W_M_r: n(s.M),
    Zd: n(s.Zd, 1), PSV: n(s.PSV), DQplus: n(s.DQplus), DQv: n(s.DQv),
    // Self-Perception
    ThreeRatio: pct(s.egocentricity),
    FrplusrF: n(s.FrplusrF),
    SumV_self: n(s.SumV), FD: n(s.FD),
    AnplusXy: n(s.An + s.Xy), MOR_self: n(s.MOR),
    H_full: n(s.H), H_paren: n(s.Hparen + s.Hd + s.Hdparen),
  };
}
