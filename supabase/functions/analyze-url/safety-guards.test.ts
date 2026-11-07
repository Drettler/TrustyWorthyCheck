import { assertEquals } from 'jsr:@std/assert@1';
import {
  applyLowConfidenceSafeGuard,
  applyStorefrontSafetyGuard,
  detectUnavailableStorefront,
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
