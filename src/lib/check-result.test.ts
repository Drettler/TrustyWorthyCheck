import { assertEquals } from 'jsr:@std/assert@1';
import {
  buildResultShareText,
  displaysNumericScore,
  resultHeading,
  verdictLabel,
} from './check-result.ts';

const confidence = { level: 'low' as const, checksVerified: 1, totalPossibleChecks: 6 };

Deno.test('Likely Legit never becomes Safe in share text', () => {
  const result = {
    trustScore: 100,
    verdict: 'safe' as const,
    confidence,
    details: { domain: { name: 'simplemodern.com' } },
  };
  const text = buildResultShareText(result, 'https://trustworthycheck.com');
  assertEquals(verdictLabel(result.verdict), 'Likely Legit');
  assertEquals(text.includes('Likely Legit'), true);
  assertEquals(text.includes('Safe'), false);
  assertEquals(text.includes('100/100'), false);
  assertEquals(text.includes('Low confidence (1/6 checks)'), true);
});

Deno.test('caution sharing includes the score only because the card displays it', () => {
  const result = {
    trustScore: 75,
    verdict: 'caution' as const,
    confidence: { level: 'high' as const, checksVerified: 6, totalPossibleChecks: 6 },
    details: { domain: { name: 'sundanceliving.com' } },
  };
  assertEquals(displaysNumericScore(result), true);
  const text = buildResultShareText(result, 'https://trustworthycheck.com');
  assertEquals(text.includes('Use Caution'), true);
  assertEquals(text.includes('Trust Score: 75/100'), true);
  assertEquals(text.includes('High confidence (6/6 checks)'), true);
});

Deno.test('not-found sharing has no score, scam verdict, or cashback wording', () => {
  const result = {
    outcome: 'not_found' as const,
    trustScore: 0,
    verdict: 'caution' as const,
    details: { domain: { name: 'trust-check-demo.invalid' } },
  };
  const text = buildResultShareText(result, 'https://trustworthycheck.com');
  assertEquals(resultHeading(result), 'Website not found');
  assertEquals(text.includes('Website not found. Check the address and try again.'), true);
  assertEquals(text.includes('/100'), false);
  assertEquals(text.includes('High Risk'), false);
  assertEquals(text.toLowerCase().includes('cashback'), false);
});

Deno.test('limited-information sharing matches the card and omits score and cashback', () => {
  const result = {
    outcome: 'limited_information' as const,
    trustScore: 100,
    verdict: 'safe' as const,
    confidence,
    details: { domain: { name: 'example.com' } },
  };
  const text = buildResultShareText(result, 'https://trustworthycheck.com');
  assertEquals(text.includes('Limited information. We couldn’t verify enough about this site to assess it.'), true);
  assertEquals(text.includes('/100'), false);
  assertEquals(text.includes('Likely Legit'), false);
  assertEquals(text.toLowerCase().includes('cashback'), false);
});
