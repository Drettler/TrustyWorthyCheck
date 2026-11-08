import { assertEquals } from 'jsr:@std/assert@1';
import {
  createWebsiteNotFoundResult,
  hasIndependentlyVerifiedThreat,
  LIMITED_INFORMATION_MESSAGE,
  shouldReturnWebsiteNotFound,
  shouldShowLimitedInformation,
  WEBSITE_NOT_FOUND_MESSAGE,
} from './result-outcomes.ts';

const noThreat = {
  virusTotalMalicious: false,
  virusTotalSuspiciousCount: 0,
  communityReported: false,
  threatFeedMatched: false,
};

Deno.test('only confirmed nonexistent hosts without independent threats return not found', () => {
  assertEquals(shouldReturnWebsiteNotFound('nonexistent', false), true);
  assertEquals(shouldReturnWebsiteNotFound('unknown', false), false);
  assertEquals(shouldReturnWebsiteNotFound('exists', false), false);
  assertEquals(shouldReturnWebsiteNotFound('nonexistent', true), false);
});

Deno.test('not-found result contains the exact shopper message and no scam finding', () => {
  const result = createWebsiteNotFoundResult('missing.invalid');
  assertEquals(result.summary, WEBSITE_NOT_FOUND_MESSAGE);
  assertEquals(result.outcome, 'not_found');
  assertEquals(result.details.redFlags, []);
});

Deno.test('clean VirusTotal as the only signal produces limited information', () => {
  assertEquals(shouldShowLimitedInformation({
    verifiedSources: ['VirusTotal scan'],
    cleanReputationScan: true,
    hasVerifiedThreat: false,
    hasPositiveMerchantEvidence: false,
  }), true);
});

Deno.test('positive merchant evidence prevents a limited-information override', () => {
  assertEquals(shouldShowLimitedInformation({
    verifiedSources: ['VirusTotal scan'],
    cleanReputationScan: true,
    hasVerifiedThreat: false,
    hasPositiveMerchantEvidence: true,
  }), false);
});

Deno.test('affirmative phishing evidence keeps its warning even with one verified signal', () => {
  const hasThreat = hasIndependentlyVerifiedThreat({ ...noThreat, virusTotalMalicious: true });
  assertEquals(hasThreat, true);
  assertEquals(shouldShowLimitedInformation({
    verifiedSources: ['VirusTotal scan'],
    cleanReputationScan: false,
    hasVerifiedThreat: hasThreat,
    hasPositiveMerchantEvidence: false,
  }), false);
});

Deno.test('additional verified checks do not meet the reputation-only rule', () => {
  assertEquals(shouldShowLimitedInformation({
    verifiedSources: ['VirusTotal scan', 'WHOIS data'],
    cleanReputationScan: true,
    hasVerifiedThreat: false,
    hasPositiveMerchantEvidence: false,
  }), false);
});

Deno.test('limited-information wording is stable for card and sharing', () => {
  assertEquals(
    LIMITED_INFORMATION_MESSAGE,
    'Limited information. We couldn’t verify enough about this site to assess it.',
  );
});
