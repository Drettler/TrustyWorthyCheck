import { assertEquals } from 'jsr:@std/assert@1';
import { checkHostnameExistence, isReservedInvalidHostname } from './website-existence.ts';

Deno.test('reserved invalid hostnames are nonexistent without a network request', async () => {
  assertEquals(isReservedInvalidHostname('trust-check-demo.invalid'), true);
  assertEquals(isReservedInvalidHostname('example.com'), false);
  assertEquals(await checkHostnameExistence('anything.invalid', () => {
    throw new Error('Network must not be called');
  }), 'nonexistent');
});

Deno.test('an explicit DNS NXDOMAIN response confirms nonexistence', async () => {
  const existence = await checkHostnameExistence('missing.example', async () =>
    new Response(JSON.stringify({ Status: 3 }), { status: 200 }));
  assertEquals(existence, 'nonexistent');
});

Deno.test('NOERROR means the hostname exists even without an A answer', async () => {
  const existence = await checkHostnameExistence('aaaa-only.example', async () =>
    new Response(JSON.stringify({ Status: 0, Answer: [] }), { status: 200 }));
  assertEquals(existence, 'exists');
});

Deno.test('resolver failures and temporary DNS statuses remain unknown', async () => {
  assertEquals(await checkHostnameExistence('timeout.example', async () => {
    throw new Error('timeout');
  }), 'unknown');
  assertEquals(await checkHostnameExistence('servfail.example', async () =>
    new Response(JSON.stringify({ Status: 2 }), { status: 200 })), 'unknown');
  assertEquals(await checkHostnameExistence('blocked.example', async () =>
    new Response('', { status: 503 })), 'unknown');
});
