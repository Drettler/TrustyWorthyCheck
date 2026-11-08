import type { HostnameExistence } from './website-existence.ts';

export const WEBSITE_NOT_FOUND_MESSAGE = 'Website not found. Check the address and try again.';
export const LIMITED_INFORMATION_MESSAGE = 'Limited information. We couldn’t verify enough about this site to assess it.';

export interface IndependentThreatEvidence {
  virusTotalMalicious: boolean;
  virusTotalSuspiciousCount: number;
  communityReported: boolean;
  threatFeedMatched: boolean;
}

export function hasIndependentlyVerifiedThreat(evidence: IndependentThreatEvidence): boolean {
  return evidence.virusTotalMalicious ||
    evidence.virusTotalSuspiciousCount > 2 ||
    evidence.communityReported ||
    evidence.threatFeedMatched;
}

export function shouldReturnWebsiteNotFound(
  existence: HostnameExistence,
  hasVerifiedThreat: boolean,
): boolean {
  return existence === 'nonexistent' && !hasVerifiedThreat;
}

export interface LimitedInformationInput {
  verifiedSources: string[];
  cleanReputationScan: boolean;
  hasVerifiedThreat: boolean;
  hasPositiveMerchantEvidence: boolean;
}

export function shouldShowLimitedInformation(input: LimitedInformationInput): boolean {
  const reputationIsOnlyVerifiedSignal = input.verifiedSources.length === 1 &&
    input.verifiedSources[0] === 'VirusTotal scan';

  return reputationIsOnlyVerifiedSignal &&
    input.cleanReputationScan &&
    !input.hasVerifiedThreat &&
    !input.hasPositiveMerchantEvidence;
}

export function createWebsiteNotFoundResult(domain: string) {
  return {
    outcome: 'not_found' as const,
    trustScore: 0,
    verdict: 'caution' as const,
    summary: WEBSITE_NOT_FOUND_MESSAGE,
    details: {
      domain: { name: domain, age: 'Not available', ssl: false },
      business: {
        hasContactInfo: false,
        hasPhysicalAddress: false,
        addressVerification: 'not_found',
        businessAge: 'Not available',
        hasAboutPage: false,
        hasPrivacyPolicy: false,
        hasTerms: false,
        hasReturnPolicy: false,
        hasShippingInfo: false,
      },
      dropshipperIndicators: { isLikelyDropshipper: false, confidence: 'low', reasons: [] },
      imageAnalysis: {
        appearsOriginal: false,
        stockPhotoLikely: false,
        qualityAssessment: 'unknown',
      },
      redFlags: [],
      positiveSignals: [],
      pricing: {
        suspiciouslyLow: false,
        comparisonToMarket: 'normal',
        notes: 'No website was available to assess.',
      },
      socialProof: {
        hasReviews: false,
        reviewsAppearAuthentic: false,
        hasSocialLinks: false,
        externalReviewPlatforms: false,
        notes: 'No website was available to assess.',
      },
      websiteQuality: {
        designQuality: 'unknown',
        grammarQuality: 'unknown',
        overallProfessionalism: 'unknown',
      },
    },
  };
}
