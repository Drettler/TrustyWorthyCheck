// Versioned live-site corpus. Synthetic protocol and scoring fixtures live beside the
// analyzer so temporary website changes cannot hide regressions in deterministic rules.

export type ExpectedVerdict = 'safe' | 'caution' | 'danger';
export type CalibrationCategory =
  | 'retail'
  | 'marketplace'
  | 'financial'
  | 'travel'
  | 'corporate'
  | 'saas'
  | 'government'
  | 'informational'
  | 'international'
  | 'impersonation'
  | 'storefront';

export interface CalibrationEntry {
  id: string;
  url: string;
  category: CalibrationCategory;
  expected: ExpectedVerdict;
  expectedScoreMin?: number;
  expectedScoreMax?: number;
  reviewedOn: string;
  notes: string;
}

export const CALIBRATION_VERSION = '2026.11.1';
export const CALIBRATION_REVIEW_DAYS = 30;
export const REVIEWED_ON = '2026-11-07';

const entry = (
  id: string,
  url: string,
  category: CalibrationCategory,
  expected: ExpectedVerdict,
  notes: string,
  expectedScoreMin?: number,
  expectedScoreMax?: number,
): CalibrationEntry => ({
  id,
  url,
  category,
  expected,
  notes,
  reviewedOn: REVIEWED_ON,
  expectedScoreMin,
  expectedScoreMax,
});

export const CALIBRATION_ENTRIES: CalibrationEntry[] = [
  entry('retail-amazon', 'amazon.com', 'retail', 'safe', 'Large direct retailer with changing page structure.', 85),
  entry('retail-walmart', 'walmart.com', 'retail', 'safe', 'Retailer and marketplace; BBB third-party mentions must not condemn the host.', 85),
  entry('retail-target', 'target.com', 'retail', 'safe', 'Retailer with bot protection and dynamic content.', 85),
  entry('retail-bestbuy', 'bestbuy.com', 'retail', 'safe', 'Retailer with dynamic product and service content.', 85),
  entry('retail-nike', 'nike.com', 'retail', 'safe', 'Brand-operated direct storefront.', 85),
  entry('marketplace-ebay', 'ebay.com', 'marketplace', 'safe', 'Third-party seller complaints are not evidence against the marketplace host.', 80),
  entry('marketplace-etsy', 'etsy.com', 'marketplace', 'safe', 'Marketplace with independent sellers and changing storefront content.', 80),
  entry('financial-paypal', 'paypal.com', 'financial', 'safe', 'Financial login pages require strict impersonation separation.', 85),
  entry('travel-booking', 'booking.com', 'travel', 'safe', 'Travel marketplace with international redirects and third-party inventory.', 80),
  entry('corporate-philips', 'usa.philips.com', 'corporate', 'safe', 'Regional corporate subdomain; do not confuse it with a lookalike retail domain.', 80),
  entry('corporate-apple', 'apple.com', 'corporate', 'safe', 'Corporate, retail, support, and account flows on one host.', 90),
  entry('saas-microsoft', 'microsoft.com', 'saas', 'safe', 'Large corporate SaaS and documentation estate.', 90),
  entry('saas-github', 'github.com', 'saas', 'safe', 'SaaS/login site; missing retail signals must not be penalized.', 80),
  entry('government-govuk', 'www.gov.uk', 'government', 'safe', 'Official government information and services; no storefront required.', 80),
  entry('informational-iana', 'www.iana.org', 'informational', 'safe', 'Informational standards body; no phone, address, or checkout required.', 75),
  entry('international-idn', 'https://bücher.de', 'international', 'safe', 'Unicode IDN for an established German bookseller; tests canonical IDN handling.', 75),
  entry('storefront-unavailable-impersonation', 'usasimplemodern.com', 'storefront', 'danger', 'Unavailable storefront with brand-impersonation findings; previously reported as an impersonator.', undefined, 45),
  entry('impersonation-amazon', 'amazon-prime-renewal.net', 'impersonation', 'danger', 'Brand impersonation pattern; a parked or offline result is an error/changed site, not a safe pass.', undefined, 45),
  entry('impersonation-paypal', 'paypal-secure-login.com', 'impersonation', 'danger', 'Financial phishing-style hostname; never inherit paypal.com reputation.', undefined, 45),
  entry('impersonation-usps', 'usps-tracking-alert.com', 'impersonation', 'danger', 'Package-delivery impersonation pattern.', undefined, 45),
  entry('impersonation-government', 'irs-refund-portal.net', 'government', 'danger', 'Government impersonation pattern; official agency reputation must not transfer.', undefined, 45),
];

export const KNOWN_GOOD = CALIBRATION_ENTRIES.filter((item) => item.expected === 'safe');
export const KNOWN_BAD = CALIBRATION_ENTRIES.filter((item) => item.expected === 'danger');
export const KNOWN_CAUTION = CALIBRATION_ENTRIES.filter((item) => item.expected === 'caution');

export function isCalibrationReviewDue(item: CalibrationEntry, now = new Date()): boolean {
  const reviewed = new Date(`${item.reviewedOn}T00:00:00Z`).getTime();
  if (!Number.isFinite(reviewed)) return true;
  return now.getTime() - reviewed > CALIBRATION_REVIEW_DAYS * 24 * 60 * 60 * 1000;
}
