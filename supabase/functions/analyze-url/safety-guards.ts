export type Verdict = 'safe' | 'caution' | 'danger';

export interface StorefrontSafetyInput {
  trustScore: number;
  verdict: Verdict;
  summary?: string;
  redFlags?: string[];
  title?: string;
  description?: string;
  markdown?: string;
  mimickingBrand?: string | null;
}

export interface StorefrontSafetyResult {
  trustScore: number;
  verdict: Verdict;
  summary?: string;
  redFlags: string[];
  storefrontUnavailable: boolean;
  impersonationDetected: boolean;
}

const UNAVAILABLE_STOREFRONT_PATTERNS = [
  /\b(?:this|the|our)\s+(?:online\s+)?(?:store|shop)\s+(?:is\s+|was\s+)?(?:currently\s+|temporarily\s+|permanently\s+)?unavailable\b/i,
  /\bonline\s+(?:store|shop)\s+(?:is\s+)?(?:currently\s+|temporarily\s+|permanently\s+)?unavailable\b/i,
  /\b(?:this|the|our)\s+(?:online\s+)?(?:store|shop)\s+(?:is\s+)?no\s+longer\s+available\b/i,
];

const BRAND_IMPERSONATION_PATTERN = /\b(?:impersonat(?:e|es|ed|ing|ion)|mimic(?:s|king)?|typosquat(?:s|ting)?|trademark\s+infringement|unauthori[sz]ed\s+(?:storefront|seller|retailer)|counterfeit\s+(?:store|shop|seller))\b/i;

export function detectUnavailableStorefront(
  title?: string,
  description?: string,
  markdown?: string,
): boolean {
  const primaryText = [title, description].filter(Boolean).join('\n');
  if (UNAVAILABLE_STOREFRONT_PATTERNS.some((pattern) => pattern.test(primaryText))) {
    return true;
  }

  // A missing title is common on thin scrapes. Limit the fallback to the beginning
  // of the page so help articles about unavailable stores do not trigger this guard.
  if (!title?.trim() && markdown) {
    const openingText = markdown.slice(0, 1000);
    return UNAVAILABLE_STOREFRONT_PATTERNS.some((pattern) => pattern.test(openingText));
  }

  return false;
}

export function hasBrandImpersonationFinding(
  redFlags: string[] = [],
  mimickingBrand?: string | null,
): boolean {
  if (mimickingBrand?.trim()) return true;
  return redFlags.some((flag) => BRAND_IMPERSONATION_PATTERN.test(flag || ''));
}

export function applyStorefrontSafetyGuard(input: StorefrontSafetyInput): StorefrontSafetyResult {
  const redFlags = [...(input.redFlags || [])];
  const storefrontUnavailable = detectUnavailableStorefront(
    input.title,
    input.description,
    input.markdown,
  );
  const impersonationDetected = storefrontUnavailable && hasBrandImpersonationFinding(
    redFlags,
    input.mimickingBrand,
  );

  if (!storefrontUnavailable) {
    return {
      trustScore: input.trustScore,
      verdict: input.verdict,
      summary: input.summary,
      redFlags,
      storefrontUnavailable,
      impersonationDetected,
    };
  }

  // An unavailable checkout can never be "Likely Legit" for shopping. Impersonation
  // evidence alongside a taken-down storefront is a compound high-risk signal.
  const scoreCap = impersonationDetected ? 45 : 75;
  const trustScore = Math.min(input.trustScore, scoreCap);
  const verdict: Verdict = trustScore >= 85 ? 'safe' : trustScore >= 60 ? 'caution' : 'danger';
  const warning = impersonationDetected
    ? '🚨 UNAVAILABLE IMPERSONATING STOREFRONT: The store is unavailable and brand-impersonation indicators were found'
    : 'Store reports that it is unavailable — an active, trustworthy checkout could not be verified';

  if (!redFlags.some((flag) => flag.toLowerCase().includes('storefront') && flag.toLowerCase().includes('unavailable')) &&
      !redFlags.some((flag) => /store\s+is\s+unavailable/i.test(flag))) {
    redFlags.unshift(warning);
  } else if (impersonationDetected && !redFlags.includes(warning)) {
    redFlags.unshift(warning);
  }

  const summary = impersonationDetected
    ? 'High Risk: The storefront says it is unavailable and the analysis found brand-impersonation indicators. Do not enter payment or personal information; verify the seller through the brand’s official website.'
    : 'Use Caution: The page states that the store is unavailable, so an active, trustworthy checkout could not be verified. Confirm the seller through an independent official channel before attempting payment.';

  return {
    trustScore,
    verdict,
    summary,
    redFlags,
    storefrontUnavailable,
    impersonationDetected,
  };
}

export function applyLowConfidenceSafeGuard(
  trustScore: number,
  verdict: Verdict,
  confidenceLevel: 'high' | 'medium' | 'low',
  hasEstablishedLegitimacySignals: boolean,
): { trustScore: number; verdict: Verdict } {
  if (confidenceLevel !== 'low' || verdict !== 'safe' || hasEstablishedLegitimacySignals) {
    return { trustScore, verdict };
  }

  // A clean security scan alone is insufficient for a high-confidence-looking
  // shopping recommendation when most verification sources are unavailable.
  return {
    trustScore: Math.min(trustScore, 84),
    verdict: 'caution',
  };
}
