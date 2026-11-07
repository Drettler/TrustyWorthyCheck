import { assertEquals } from 'jsr:@std/assert@1';
import { assessGovernmentImpersonation, hasOfficialGovernmentSuffix, isGovernmentLookalikeDomain } from './government-evidence.ts';

Deno.test('recognizes restricted government suffixes across countries', () => {
  for (const domain of ['www.gov.uk', 'irs.gov', 'service.gc.ca', 'abc.gov.au', 'service.gouv.fr', 'agency.govt.nz', 'department.gov.in']) {
    assertEquals(hasOfficialGovernmentSuffix(domain), true, domain);
    assertEquals(isGovernmentLookalikeDomain(domain), false, domain);
  }
});

Deno.test('official-sounding lookalikes do not inherit government status', () => {
  for (const domain of ['gov.uk.tax-refund.example', 'government-refund.example', 'official-hmrc.example', 'federal-payment.example']) {
    assertEquals(hasOfficialGovernmentSuffix(domain), false, domain);
    assertEquals(isGovernmentLookalikeDomain(domain), true, domain);
  }
});

Deno.test('an official suffix alone does not create a scam finding', () => {
  assertEquals(assessGovernmentImpersonation(true, 0, false), false);
  assertEquals(assessGovernmentImpersonation(true, 1, false), false);
});

Deno.test('official government sites remain subject to substantive scam evidence', () => {
  assertEquals(assessGovernmentImpersonation(true, 2, false), true);
});

Deno.test('a government lookalike plus suspicious evidence remains high risk', () => {
  assertEquals(assessGovernmentImpersonation(true, 1, true), true);
  assertEquals(assessGovernmentImpersonation(false, 1, true), true);
});
