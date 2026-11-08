export type HostnameExistence = 'exists' | 'nonexistent' | 'unknown';

export function isReservedInvalidHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/\.$/, '');
  return normalized === 'invalid' || normalized.endsWith('.invalid');
}

/**
 * Confirm nonexistence only from the reserved .invalid namespace or an explicit
 * DNS NXDOMAIN response. Resolver failures, timeouts, and empty/other statuses
 * remain unknown so they cannot be mislabeled as a missing website.
 */
export async function checkHostnameExistence(
  hostname: string,
  fetcher: typeof fetch = fetch,
): Promise<HostnameExistence> {
  if (isReservedInvalidHostname(hostname)) return 'nonexistent';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetcher(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`,
      {
        headers: { accept: 'application/dns-json' },
        signal: controller.signal,
      },
    );
    if (!response.ok) return 'unknown';

    const data = await response.json();
    if (data?.Status === 3) return 'nonexistent';
    if (data?.Status === 0) return 'exists';
    return 'unknown';
  } catch {
    return 'unknown';
  } finally {
    clearTimeout(timeout);
  }
}
