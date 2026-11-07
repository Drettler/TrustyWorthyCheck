import { assertEquals } from 'jsr:@std/assert@1';
import {
  applyDormantStorefrontGuard,
  applyLowConfidenceSafeGuard,
  applyStorefrontSafetyGuard,
  detectDormantStorefront,
  detectUnavailableStorefront,
  hasThinExtraction,
  verdictForScore,
} from './safety-guards.ts';

Deno.test('detects the exact unavailable-store title from the reported result', () => {
  assertEquals(detectUnavailableStorefront('This store is unavailable'), true);
});

Deno.test('detects unavailable online-shop wording in page metadata', () => {
  assertEquals(detectUnavailableStorefront('Brand', 'Online shop currently unavailable'), true);
});

Deno.test('does not confuse an unavailable product with an unavailable storefront', () => {
  assertEquals(detectUnavailableStorefront('This product is unavailable', 'Shop our available collection'), false);
});

Deno.test('an unavailable storefront cannot receive a safe verdict', () => {
  const result = applyStorefrontSafetyGuard({
    trustScore: 95,
    verdict: 'safe',
    title: 'This store is unavailable',
    redFlags: [],
  });

  assertEquals(result.trustScore, 75);
  assertEquals(result.verdict, 'caution');
  assertEquals(result.redFlags.length, 1);
});

Deno.test('an unavailable storefront with impersonation evidence is high risk', () => {
  const result = applyStorefrontSafetyGuard({
    trustScore: 95,
    verdict: 'safe',
    title: 'This store is unavailable',
    redFlags: ['Domain name impersonates the well-known brand Simple Modern'],
  });

  assertEquals(result.trustScore, 45);
  assertEquals(result.verdict, 'danger');
  assertEquals(result.impersonationDetected, true);
});

Deno.test('an available storefront keeps its original classification', () => {
  const result = applyStorefrontSafetyGuard({
    trustScore: 92,
    verdict: 'safe',
    title: 'Simple Modern Official Store',
    redFlags: [],
  });

  assertEquals(result.trustScore, 92);
  assertEquals(result.verdict, 'safe');
});

Deno.test('low confidence cannot produce a safe verdict without established legitimacy signals', () => {
  assertEquals(applyLowConfidenceSafeGuard(95, 'safe', 'low', false), {
    trustScore: 84,
    verdict: 'caution',
  });
});

Deno.test('low confidence does not override independently established legitimacy', () => {
  assertEquals(applyLowConfidenceSafeGuard(95, 'safe', 'low', true), {
    trustScore: 95,
    verdict: 'safe',
  });
});

Deno.test('verdict boundaries remain consistent at 85 and 60', () => {
  assertEquals([100, 85, 84, 60, 59, 0].map(verdictForScore), [
    'safe', 'safe', 'caution', 'caution', 'danger', 'danger',
  ]);
});

Deno.test('thin extraction covers blocked pages without reclassifying rich multi-signal pages', () => {
  assertEquals(hasThinExtraction(0, 0), true);
  assertEquals(hasThinExtraction(5000, 1), true);
  assertEquals(hasThinExtraction(5000, 2), false);
});

Deno.test('medium and high confidence do not trigger the low-confidence cap', () => {
  assertEquals(applyLowConfidenceSafeGuard(90, 'safe', 'medium', false), { trustScore: 90, verdict: 'safe' });
  assertEquals(applyLowConfidenceSafeGuard(90, 'safe', 'high', false), { trustScore: 90, verdict: 'safe' });
});

Deno.test('new unavailable-store wording is caught without confusing normal business hours', () => {
  assertEquals(detectUnavailableStorefront('Sorry, this shop is currently unavailable'), true);
  assertEquals(detectUnavailableStorefront('Store unavailable'), true);
  assertEquals(detectUnavailableStorefront('Our store is temporarily closed'), true);
  assertEquals(detectUnavailableStorefront('Our store is closed on Sundays'), false);
});

Deno.test('detects a dormant brand site without mistaking empty-cart boilerplate for checkout', () => {
  assertEquals(detectDormantStorefront(
    'Sundance Living ~ Previously Sundance Catalog',
    'Founded in 1989.',
    'Stay Tuned, Beautiful Things are on the Horizon. Your cart is currently empty. Privacy Policy.',
    ['https://www.sundanceliving.com/pages/privacy-policy'],
  ), true);
});

Deno.test('an active purchase path prevents dormant-store classification', () => {
  assertEquals(detectDormantStorefront(
    'Qualified Store',
    'Stay tuned for new products',
    'Add to cart. Secure checkout. Return policy.',
  ), false);
});

Deno.test('a clean dormant storefront receives an ordering warning rather than a scam verdict', () => {
  const result = applyDormantStorefrontGuard({
    trustScore: 0,
    verdict: 'danger',
    redFlags: ['No shipping information found', 'Accepts cryptocurrency payments - limited buyer protection'],
    dormantStorefront: true,
    hasCleanIndependentReputation: true,
    hasFirstPartyBusinessSignals: true,
    hasCriticalSecurityOrImpersonationIssue: false,
  });

  assertEquals(result.trustScore, 60);
  assertEquals(result.verdict, 'caution');
  assertEquals(result.applied, true);
  assertEquals(result.redFlags.some((flag) => flag.includes('Online ordering is not currently available')), true);
  assertEquals(result.redFlags.some((flag) => flag.includes('shipping information')), false);
});

Deno.test('dormant wording never overrides critical impersonation or security evidence', () => {
  const result = applyDormantStorefrontGuard({
    trustScore: 20,
    verdict: 'danger',
    dormantStorefront: true,
    hasCleanIndependentReputation: true,
    hasFirstPartyBusinessSignals: true,
    hasCriticalSecurityOrImpersonationIssue: true,
  });

  assertEquals(result.trustScore, 20);
  assertEquals(result.verdict, 'danger');
  assertEquals(result.applied, false);
});

Deno.test('the dormant-store guard leaves qualified active stores unchanged', () => {
  const result = applyDormantStorefrontGuard({
    trustScore: 100,
    verdict: 'safe',
    summary: 'Qualified active retailer.',
    dormantStorefront: false,
    hasCleanIndependentReputation: true,
    hasFirstPartyBusinessSignals: true,
    hasCriticalSecurityOrImpersonationIssue: false,
  });

  assertEquals(result.trustScore, 100);
  assertEquals(result.verdict, 'safe');
  assertEquals(result.summary, 'Qualified active retailer.');
});
