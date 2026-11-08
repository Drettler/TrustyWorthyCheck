export type ResultOutcome = 'not_found' | 'limited_information';
export type ResultVerdict = 'safe' | 'caution' | 'danger';

export interface ResultConfidence {
  level: 'high' | 'medium' | 'low';
  checksVerified: number;
  totalPossibleChecks: number;
}

export interface PresentableResult {
  outcome?: ResultOutcome;
  trustScore: number;
  verdict: ResultVerdict;
  confidence?: ResultConfidence;
  details: { domain: { name: string } };
}

export const WEBSITE_NOT_FOUND_MESSAGE = 'Website not found. Check the address and try again.';
export const LIMITED_INFORMATION_MESSAGE = 'Limited information. We couldn’t verify enough about this site to assess it.';

export function verdictLabel(verdict: ResultVerdict): string {
  switch (verdict) {
    case 'safe': return 'Likely Legit';
    case 'caution': return 'Use Caution';
    case 'danger': return 'High Risk';
  }
}

export function resultHeading(result: Pick<PresentableResult, 'outcome' | 'verdict'>): string {
  if (result.outcome === 'not_found') return 'Website not found';
  if (result.outcome === 'limited_information') return 'Limited information';
  return verdictLabel(result.verdict);
}

export function resultDescription(result: Pick<PresentableResult, 'outcome' | 'verdict'>): string {
  if (result.outcome === 'not_found') return WEBSITE_NOT_FOUND_MESSAGE;
  if (result.outcome === 'limited_information') return LIMITED_INFORMATION_MESSAGE;
  switch (result.verdict) {
    case 'safe': return 'This website shows strong trust indicators';
    case 'caution': return 'Some concerns were identified — review before purchasing';
    case 'danger': return 'Multiple red flags detected — high risk of scam';
  }
}

/** Matches the existing gauge: only caution scores display a number. */
export function displaysNumericScore(result: Pick<PresentableResult, 'outcome' | 'verdict'>): boolean {
  return !result.outcome && result.verdict === 'caution';
}

export function confidenceLabel(confidence?: ResultConfidence): string | null {
  if (!confidence) return null;
  const level = `${confidence.level.charAt(0).toUpperCase()}${confidence.level.slice(1)}`;
  return `${level} confidence (${confidence.checksVerified}/${confidence.totalPossibleChecks} checks)`;
}

export function buildResultShareText(result: PresentableResult, origin: string): string {
  const parts = [
    `I just checked ${result.details.domain.name} on TrustworthyCheck — ${resultHeading(result)}.`,
  ];

  if (result.outcome) parts.push(resultDescription(result));
  if (displaysNumericScore(result)) parts.push(`Trust Score: ${result.trustScore}/100.`);
  const confidence = confidenceLabel(result.confidence);
  if (confidence) parts.push(`${confidence}.`);
  parts.push(`Check any website before you buy: ${origin}`);
  return parts.join(' ');
}
