export type Verdict = 'safe' | 'caution' | 'danger';

export function verdictForScore(trustScore: number): Verdict {
  if (trustScore >= 85) return 'safe';
  if (trustScore >= 60) return 'caution';
  return 'danger';
}

export function hasThinExtraction(markdownLength: number, extractionSignals: number): boolean {
  return markdownLength < 2500 || extractionSignals <= 1;
}

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
  /\b(?:this|the|our)\s+(?:online\s+)?(?:store|shop)\s+(?:is\s+|was\s+)?(?:currently|temporarily|permanently)\s+closed\b/i,
  /^\s*(?:sorry[,!]?\s*)?(?:this\s+)?(?:online\s+)?(?:store|shop)\s+unavailable\s*$/i,
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
  const verdict = verdictForScore(trustScore);
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

const ACTIVE_PURCHASE_PATTERNS = [
  /\badd\s+to\s+(?:cart|bag|basket)\b/i,
  /\b(?:secure\s+)?check\s*out\b/i,
  /\b(?:buy|pay|order)\s+now\b/i,
  /\bplace\s+(?:an\s+)?order\b/i,
  /\bcomplete\s+(?:your\s+)?purchase\b/i,
];

const DORMANT_STOREFRONT_PATTERNS = [
  /\bstay\s+tuned\b/i,
  /\b(?:our\s+)?(?:online\s+)?(?:store|shop)\s+(?:is\s+)?coming\s+soon\b/i,
  /\bno\s+longer\s+(?:supporting|accepting|processing)\s+online\s+orders\b/i,
  /\bnot\s+(?:currently\s+)?(?:accepting|processing)\s+online\s+orders\b/i,
  /\bonline\s+ordering\s+(?:is\s+)?(?:currently\s+)?(?:unavailable|paused|closed)\b/i,
];

export function detectDormantStorefront(
  title?: string,
  description?: string,
  markdown?: string,
  links: string[] = [],
): boolean {
  const pageText = [title, description, markdown].filter(Boolean).join('\n');
  if (!DORMANT_STOREFRONT_PATTERNS.some((pattern) => pattern.test(pageText))) return false;

  // Empty-cart and account-login boilerplate do not prove that a shopper can buy.
  const purchaseText = [pageText, ...links].join('\n');
  return !ACTIVE_PURCHASE_PATTERNS.some((pattern) => pattern.test(purchaseText));
}

export interface DormantStorefrontInput {
  trustScore: number;
  verdict: Verdict;
  summary?: string;
  redFlags?: string[];
  dormantStorefront: boolean;
  hasCleanIndependentReputation: boolean;
  hasFirstPartyBusinessSignals: boolean;
  hasCriticalSecurityOrImpersonationIssue: boolean;
}

export function applyDormantStorefrontGuard(input: DormantStorefrontInput) {
  const redFlags = [...(input.redFlags || [])];
  const eligible = input.dormantStorefront &&
    input.hasCleanIndependentReputation &&
    input.hasFirstPartyBusinessSignals &&
    !input.hasCriticalSecurityOrImpersonationIssue;

  if (!eligible) {
    return {
      trustScore: input.trustScore,
      verdict: input.verdict,
      summary: input.summary,
      redFlags,
      dormantStorefront: input.dormantStorefront,
      applied: false,
    };
  }

  // A dormant official storefront is not an active scam checkout, but it is not a
  // safe place to shop either. Keep it in the caution band and never override
  // independent malware, impersonation, threat-feed, or connection evidence.
  const relevantFlags = redFlags.filter((flag) => {
    const f = flag.toLowerCase();
    return !f.includes('shipping information') &&
      !f.includes('refund/return policy') &&
      !f.includes('cryptocurrency payments') &&
      !f.includes('cloned/templated');
  });
  const warning = 'Online ordering is not currently available — do not use lookalike sites claiming to sell for this brand';
  if (!relevantFlags.includes(warning)) relevantFlags.unshift(warning);

  return {
    trustScore: Math.max(60, Math.min(input.trustScore, 75)),
    verdict: 'caution' as Verdict,
    summary: 'Use Caution: This brand website does not currently provide an active purchase path. Do not place an order here or through lookalike sites; verify any future ordering directly from this domain.',
    redFlags: relevantFlags,
    dormantStorefront: true,
    applied: true,
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
