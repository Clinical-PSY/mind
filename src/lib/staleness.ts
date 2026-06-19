// Staleness detection for MindLink modules
// Each module is "stale" when upstream data is newer than its last generation

export interface CaseBundle {
  sessions?: Array<{ created_at?: string }>;
  tests?: Array<{ created_at?: string }>;
  psych_report?: { updated_at?: string } | null;
  conceptualization?: { updated_at?: string } | null;
  intervention?: { updated_at?: string } | null;
  outcomes?: { generated_at?: string } | null;
}

function ts(...times: (string | undefined | null)[]): number {
  const valid = times.filter(Boolean).map(t => new Date(t!).getTime()).filter(n => !isNaN(n));
  return valid.length ? Math.max(...valid) : 0;
}

function staleMsg(flags: Record<string, boolean>): string[] {
  return Object.entries(flags).filter(([, v]) => v).map(([k]) => k);
}

export interface StalenessResult {
  m2: boolean; m2Sources: string[];
  m3: boolean; m3Sources: string[];
  m4: boolean; m4Sources: string[];
  m6: boolean; m6Sources: string[];
}

export function computeStaleness(data: CaseBundle): StalenessResult {
  const sessionTs = ts(...(data.sessions ?? []).map(s => s.created_at));
  const testTs    = ts(...(data.tests ?? []).map(t => t.created_at));
  const inputTs   = Math.max(sessionTs, testTs);

  const reportTs  = ts(data.psych_report?.updated_at);
  const conceptTs = ts(data.conceptualization?.updated_at);
  const intervTs  = ts(data.intervention?.updated_at);
  const outcomeTs = ts(data.outcomes?.generated_at);

  const m2 = !!data.psych_report && inputTs > 0 && inputTs > reportTs;
  const m3 = !!data.conceptualization && (inputTs > conceptTs || reportTs > conceptTs);
  const m4 = !!data.intervention && conceptTs > 0 && conceptTs > intervTs;
  const m6 = !!data.outcomes && (inputTs > outcomeTs || conceptTs > outcomeTs || intervTs > outcomeTs);

  return {
    m2,
    m2Sources: m2 ? staleMsg({
      '새 회기 추가됨':   sessionTs > reportTs,
      '새 검사 추가됨':   testTs > reportTs,
    }) : [],
    m3,
    m3Sources: m3 ? staleMsg({
      '새 회기 추가됨':       sessionTs > conceptTs,
      '새 검사 추가됨':       testTs > conceptTs,
      '심리보고서 업데이트': reportTs > conceptTs,
    }) : [],
    m4,
    m4Sources: m4 ? ['사례개념화 업데이트됨'] : [],
    m6,
    m6Sources: m6 ? staleMsg({
      '새 회기 추가됨':     sessionTs > outcomeTs,
      '사례개념화 변경됨': conceptTs > outcomeTs,
      '개입 전략 변경됨':  intervTs > outcomeTs,
    }) : [],
  };
}
