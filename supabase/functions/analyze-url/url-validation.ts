export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  normalized?: string;
}

const EXPLICIT_SCHEME = /^([a-z][a-z\d+.-]*):/i;
const HOST_WITH_PORT = /^[^/?#]+:\d+(?:[/?#]|$)/;

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19));
}

function isPrivateIpv6(hostname: string): boolean {
  const address = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  return address === '::' || address === '::1' ||
    /^f[cd]/i.test(address) || /^fe[89ab]/i.test(address) ||
    /^::ffff:(?:127|10|192\.168|169\.254)\./i.test(address);
}

/** Validate and canonicalize a public HTTP(S) destination without changing path/query case. */
export function validateUrl(input: string): UrlValidationResult {
  if (typeof input !== 'string' || input.length > 2048) {
    return { valid: false, error: 'URL too long (max 2048 characters)' };
  }

  const trimmed = input.trim();
  if (!trimmed) return { valid: false, error: 'URL is required' };
  if (/\s|[\u0000-\u001f\u007f]/.test(trimmed)) {
    return { valid: false, error: 'URL cannot contain spaces or control characters' };
  }

  let candidate = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
  const scheme = candidate.match(EXPLICIT_SCHEME)?.[1]?.toLowerCase();
  const hostWithPort = HOST_WITH_PORT.test(candidate);

  if (scheme && scheme !== 'http' && scheme !== 'https' && !hostWithPort) {
    return { valid: false, error: 'Only HTTP/HTTPS protocols allowed' };
  }
  if (!/^https?:/i.test(candidate)) candidate = `https://${candidate}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP/HTTPS protocols allowed' };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, '');
  if (!hostname) return { valid: false, error: 'A website hostname is required' };

  const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const ipv6 = hostname.includes(':');
  if (isPrivateIpv4(hostname) || isPrivateIpv6(hostname) ||
      hostname === 'localhost' || hostname.endsWith('.localhost') ||
      hostname === 'metadata' || hostname.endsWith('.internal') ||
      hostname.endsWith('.local') || hostname.endsWith('.lan') || hostname.endsWith('.home')) {
    return { valid: false, error: 'Internal/private addresses not allowed' };
  }
  if (!ipv4 && !ipv6 && !hostname.includes('.')) {
    return { valid: false, error: 'A public website hostname is required' };
  }

  // Credentials are never needed for a trust check and must not be sent to a scraper.
  // The real destination host is preserved, so paypal.com@evil.example checks evil.example.
  parsed.username = '';
  parsed.password = '';
  parsed.hostname = hostname.startsWith('www.') ? hostname.slice(4) : hostname;
  parsed.hash = '';

  return { valid: true, normalized: parsed.toString() };
}
