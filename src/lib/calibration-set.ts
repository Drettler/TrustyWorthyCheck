// Calibration domain set for tuning the scoring engine.
// Edit freely — add/remove domains as your test corpus evolves.

export type ExpectedVerdict = 'safe' | 'caution' | 'danger';

export interface CalibrationEntry {
  domain: string;
  expected: ExpectedVerdict;
  /** Optional target score range for finer tuning. */
  expectedScoreMin?: number;
  expectedScoreMax?: number;
  notes?: string;
}

export const KNOWN_GOOD: CalibrationEntry[] = [
  { domain: 'amazon.com', expected: 'safe', expectedScoreMin: 85, notes: 'Major retailer' },
  { domain: 'walmart.com', expected: 'safe', expectedScoreMin: 85 },
  { domain: 'target.com', expected: 'safe', expectedScoreMin: 85 },
  { domain: 'bestbuy.com', expected: 'safe', expectedScoreMin: 85 },
  { domain: 'ebay.com', expected: 'safe', expectedScoreMin: 80 },
  { domain: 'etsy.com', expected: 'safe', expectedScoreMin: 80 },
  { domain: 'paypal.com', expected: 'safe', expectedScoreMin: 85 },
  { domain: 'booking.com', expected: 'safe', expectedScoreMin: 80 },
  { domain: 'usa.philips.com', expected: 'safe', expectedScoreMin: 80, notes: 'Corporate brand site' },
  { domain: 'apple.com', expected: 'safe', expectedScoreMin: 90 },
  { domain: 'microsoft.com', expected: 'safe', expectedScoreMin: 90 },
  { domain: 'nike.com', expected: 'safe', expectedScoreMin: 85 },
];

export const KNOWN_BAD: CalibrationEntry[] = [
  { domain: 'amazon-prime-renewal.net', expected: 'danger', expectedScoreMax: 40, notes: 'Brand impersonation' },
  { domain: 'paypal-secure-login.com', expected: 'danger', expectedScoreMax: 40, notes: 'Phishing pattern' },
  { domain: 'usps-tracking-alert.com', expected: 'danger', expectedScoreMax: 40, notes: 'Package scam' },
  { domain: 'irs-refund-portal.net', expected: 'danger', expectedScoreMax: 40, notes: 'Gov impersonation' },
];

export const KNOWN_CAUTION: CalibrationEntry[] = [
  // Add borderline sites here as you discover them.
];
