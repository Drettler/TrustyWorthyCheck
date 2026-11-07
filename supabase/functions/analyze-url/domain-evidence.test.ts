import { assertEquals } from 'jsr:@std/assert@1';
import { isExactDomainMatch, textContainsExactDomain } from './domain-evidence.ts';

Deno.test('threat evidence matches the same domain including a www alias', () => {
  assertEquals(isExactDomainMatch('https://www.usasimplemodern.com/path', 'usasimplemodern.com'), true);
});

Deno.test('a lookalike domain cannot inherit a qualified store threat report', () => {
  assertEquals(isExactDomainMatch('walmart.com-security-alert.ru', 'walmart.com'), false);
  assertEquals(isExactDomainMatch('notwalmart.com', 'walmart.com'), false);
  assertEquals(isExactDomainMatch('walmart.com.evil.example', 'walmart.com'), false);
});

Deno.test('BBB evidence text accepts the exact domain but rejects a containing hostname', () => {
  assertEquals(textContainsExactDomain('Reported website: https://usasimplemodern.com/order', 'usasimplemodern.com'), true);
  assertEquals(textContainsExactDomain('Visit walmart.com.evil.example for details', 'walmart.com'), false);
});
