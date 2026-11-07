import { assertEquals } from 'jsr:@std/assert@1';
import { checkSuspiciousTLD } from './tld-risk.ts';

Deno.test('ordinary startup and country suffixes are not suspicious by themselves', () => {
  for (const domain of ['spocket.co', 'example.com.br', 'example.com.cn', 'example.com.co', 'example.co.uk', 'example.com']) {
    assertEquals(checkSuspiciousTLD(domain), false, domain);
  }
});

Deno.test('high-abuse suffixes remain a risk signal', () => {
  for (const domain of ['brand-secure.xyz', 'prize.top', 'account-verify.tk', 'download.click']) {
    assertEquals(checkSuspiciousTLD(domain), true, domain);
  }
});

Deno.test('TLD matching is case-insensitive and ignores a trailing root dot', () => {
  assertEquals(checkSuspiciousTLD('EXAMPLE.CO.'), false);
  assertEquals(checkSuspiciousTLD('EXAMPLE.XYZ.'), true);
});
