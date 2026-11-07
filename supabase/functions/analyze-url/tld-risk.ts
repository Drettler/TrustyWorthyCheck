// High-abuse extensions are one signal, not proof of fraud. Ordinary ccTLDs and
// regulated country second-level domains must not be treated as .com impersonation.
const HIGH_ABUSE_TLDS = [
  '.xyz', '.top', '.work', '.click', '.link', '.info', '.biz',
  '.online', '.site', '.club', '.vip', '.win', '.review',
  '.cc', '.ws', '.tk', '.ml', '.ga', '.cf', '.gq',
];

export function checkSuspiciousTLD(domain: string): boolean {
  const hostname = domain.trim().toLowerCase().replace(/\.$/, '');
  return HIGH_ABUSE_TLDS.some((tld) => hostname.endsWith(tld));
}
