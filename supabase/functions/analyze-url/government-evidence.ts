import { normalizeDomain } from './domain-evidence.ts';

/** Restricted government suffixes are evidence against a lookalike label, not immunity. */
export function hasOfficialGovernmentSuffix(input: string): boolean {
  const domain = normalizeDomain(input);
  if (!domain) return false;
  return domain.endsWith('.gov') || domain.endsWith('.mil') ||
    domain.endsWith('.gc.ca') || domain.endsWith('.nic.in') ||
    /(?:^|\.)(?:gov|gob|gouv|govt)\.[a-z]{2}$/i.test(domain);
}

export function isGovernmentLookalikeDomain(input: string): boolean {
  const domain = normalizeDomain(input);
  if (!domain || hasOfficialGovernmentSuffix(domain)) return false;
  return [
    /gov[^a-z]/i,
    /\.gov\./i,
    /-gov-/i,
    /government/i,
    /federal/i,
    /official/i,
    /department-of/i,
  ].some((pattern) => pattern.test(domain));
}

export function assessGovernmentImpersonation(
  claimsGovAffiliation: boolean,
  suspiciousPatternCount: number,
  usesGovLookalikeTerms: boolean,
): boolean {
  return (claimsGovAffiliation && (suspiciousPatternCount >= 2 || usesGovLookalikeTerms)) ||
    (usesGovLookalikeTerms && suspiciousPatternCount >= 1);
}
