import { assertEquals } from 'jsr:@std/assert@1';
import { validateUrl } from './url-validation.ts';

Deno.test('accepts bare domains, HTTP, public IPs, ports, paths, and queries', () => {
  assertEquals(validateUrl('example.com').normalized, 'https://example.com/');
  assertEquals(validateUrl('http://example.com').normalized, 'http://example.com/');
  assertEquals(validateUrl('https://1.1.1.1').normalized, 'https://1.1.1.1/');
  assertEquals(validateUrl('example.com:8443/status').normalized, 'https://example.com:8443/status');
});

Deno.test('preserves case-sensitive paths and queries while canonicalizing the host', () => {
  assertEquals(
    validateUrl('HTTPS://WWW.Example.COM/Sale/ABC?token=AbC#section').normalized,
    'https://example.com/Sale/ABC?token=AbC',
  );
});

Deno.test('canonicalizes Unicode and punycode IDNs to the same destination', () => {
  assertEquals(validateUrl('https://bücher.de').normalized, 'https://xn--bcher-kva.de/');
  assertEquals(validateUrl('https://xn--bcher-kva.de').normalized, 'https://xn--bcher-kva.de/');
});

Deno.test('checks the actual destination host and strips embedded credentials', () => {
  const result = validateUrl('https://paypal.com:password@evil.example/login');
  assertEquals(result.valid, true);
  assertEquals(result.normalized, 'https://evil.example/login');
});

Deno.test('rejects non-web protocols instead of treating them as hostnames', () => {
  for (const input of ['ftp://example.com/file', 'javascript:alert(1)', 'file:///etc/passwd', 'data:text/html,test']) {
    assertEquals(validateUrl(input).valid, false, input);
  }
});

Deno.test('blocks localhost, private networks, metadata, and internal DNS names', () => {
  const blocked = [
    'localhost', 'localhost.', 'service.internal', 'printer.local',
    '127.1', '0x7f000001', '10.0.0.1', '172.16.0.1', '192.168.1.1',
    '169.254.169.254', '100.64.0.1', '198.18.0.1', 'http://[::1]', 'http://[fd00::1]',
  ];
  for (const input of blocked) assertEquals(validateUrl(input).valid, false, input);
});

Deno.test('rejects malformed, blank, whitespace-containing, and oversized URLs', () => {
  for (const input of ['', 'https://exa mple.com', 'https://', 'not-a-public-host']) {
    assertEquals(validateUrl(input).valid, false, JSON.stringify(input));
  }
  assertEquals(validateUrl(`https://example.com/${'a'.repeat(2048)}`).valid, false);
});
