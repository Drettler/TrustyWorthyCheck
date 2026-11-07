export function normalizeDomain(input: string): string {
  if (!input?.trim()) return '';
  try {
    const candidate = input.trim();
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(candidate) ? candidate : `https://${candidate}`);
    return url.hostname.toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
  } catch {
    return '';
  }
}

export function isExactDomainMatch(first: string, second: string): boolean {
  const a = normalizeDomain(first);
  const b = normalizeDomain(second);
  return Boolean(a && b && a === b);
}

const DOMAIN_IN_TEXT = /(?:https?:\/\/)?(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z]{2,}(?::\d{1,5})?(?:\/[^\s<>"']*)?/gi;

export function textContainsExactDomain(text: string, domain: string): boolean {
  const target = normalizeDomain(domain);
  if (!target || !text) return false;

  for (const match of text.matchAll(DOMAIN_IN_TEXT)) {
    if (normalizeDomain(match[0]) === target) return true;
  }
  return false;
}
