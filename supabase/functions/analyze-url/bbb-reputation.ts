import { textContainsExactDomain } from './domain-evidence.ts';

export interface BbbSearchResult {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
}

export interface BbbEvidenceItem {
  title: string;
  url: string;
  description: string;
}

export interface BbbReviewMention extends BbbEvidenceItem {
  scamRelated: boolean;
}

export interface BbbReputationResult {
  lookupUrl: string;
  checked: boolean;
  scamCandidates: BbbEvidenceItem[];
  reviewMentions: BbbReviewMention[];
  error?: string;
}

const SCAM_COMPLAINT_PATTERN = /\b(?:scam|fraud|counterfeit|impersonat\w*|phishing|stolen|never received|did not receive|took (?:my |their )?money|unauthori[sz]ed charge)\b/i;

function isBbbUrl(rawUrl: string): boolean {
  try {
    const hostname = new URL(rawUrl).hostname.toLowerCase();
    return hostname === 'bbb.org' || hostname === 'www.bbb.org';
  } catch {
    return false;
  }
}

function isScamTrackerUrl(rawUrl: string): boolean {
  try {
    return new URL(rawUrl).pathname.toLowerCase().includes('/scamtracker');
  } catch {
    return false;
  }
}

function isReviewOrProfileUrl(rawUrl: string): boolean {
  try {
    const path = new URL(rawUrl).pathname.toLowerCase();
    return path.includes('/profile/') || path.includes('/customer-reviews') ||
      path.includes('/complaints') || path.includes('/reviews');
  } catch {
    return false;
  }
}

export function classifyBbbResults(
  domain: string,
  results: BbbSearchResult[],
): Pick<BbbReputationResult, 'scamCandidates' | 'reviewMentions'> {
  const scamCandidates: BbbEvidenceItem[] = [];
  const reviewMentions: BbbReviewMention[] = [];
  const seenUrls = new Set<string>();

  for (const result of results) {
    const url = result.url?.trim() || '';
    if (!url || seenUrls.has(url) || !isBbbUrl(url)) continue;

    // Search snippets become review candidates only when they explicitly contain
    // the checked domain. They remain unverified until approved BBB access confirms
    // the report and its role; a similar business name is never enough.
    const evidenceText = [result.title, result.description, result.markdown]
      .filter(Boolean)
      .join('\n');
    if (!textContainsExactDomain(evidenceText, domain)) continue;

    seenUrls.add(url);
    const item = {
      title: (result.title || 'BBB result').slice(0, 300),
      url,
      description: (result.description || '').slice(0, 1000),
    };

    if (isScamTrackerUrl(url)) {
      scamCandidates.push(item);
    } else if (isReviewOrProfileUrl(url)) {
      reviewMentions.push({
        ...item,
        scamRelated: SCAM_COMPLAINT_PATTERN.test(evidenceText),
      });
    }
  }

  return {
    scamCandidates: scamCandidates.slice(0, 5),
    reviewMentions: reviewMentions.slice(0, 5),
  };
}

export async function lookupBbbReputation(
  domain: string,
  firecrawlApiKey: string,
): Promise<BbbReputationResult> {
  const lookupUrl = `https://www.bbb.org/scamtracker/lookupscam?from=0&q=${encodeURIComponent(`all=${domain}`)}`;

  if (!firecrawlApiKey) {
    return { lookupUrl, checked: false, scamCandidates: [], reviewMentions: [], error: 'Search unavailable' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch('https://api.firecrawl.dev/v2/search', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `site:bbb.org "${domain}"`,
        limit: 10,
        sources: ['web'],
        country: 'US',
      }),
    });

    if (!response.ok) {
      console.error('BBB search returned status:', response.status);
      return { lookupUrl, checked: false, scamCandidates: [], reviewMentions: [], error: 'BBB search failed' };
    }

    const payload = await response.json();
    const results: BbbSearchResult[] = Array.isArray(payload?.data?.web) ? payload.data.web : [];
    return {
      lookupUrl,
      checked: true,
      ...classifyBbbResults(domain, results),
    };
  } catch (error) {
    console.error('BBB search failed:', error instanceof Error ? error.name : 'Unknown error');
    return { lookupUrl, checked: false, scamCandidates: [], reviewMentions: [], error: 'BBB search unavailable' };
  } finally {
    clearTimeout(timeout);
  }
}
