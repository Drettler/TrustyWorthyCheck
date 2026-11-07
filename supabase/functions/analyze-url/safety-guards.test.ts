import { assertEquals } from 'jsr:@std/assert@1';
import {
  applyLowConfidenceSafeGuard,
  applyStorefrontSafetyGuard,
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
