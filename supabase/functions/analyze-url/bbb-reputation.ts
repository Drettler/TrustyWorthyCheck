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
  checked: boolean;
  scamReports: BbbEvidenceItem[];
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

export function classifyBbbResults(
  domain: string,
  results: BbbSearchResult[],
): Pick<BbbReputationResult, 'scamReports' | 'reviewMentions'> {
  const scamReports: BbbEvidenceItem[] = [];
  const reviewMentions: BbbReviewMention[] = [];
  const seenUrls = new Set<string>();

  for (const result of results) {
    const url = result.url?.trim() || '';
    if (!url || seenUrls.has(url) || !isBbbUrl(url)) continue;

    // Search snippets are evidence only when they explicitly contain the checked
    // domain. A BBB result for a similar business name is not a domain match.
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
      scamReports.push(item);
    } else {
      reviewMentions.push({
        ...item,
        scamRelated: SCAM_COMPLAINT_PATTERN.test(evidenceText),
      });
    }
  }

  return {
    scamReports: scamReports.slice(0, 5),
    reviewMentions: reviewMentions.slice(0, 5),
  };
}

export async function lookupBbbReputation(
  domain: string,
  firecrawlApiKey: string,
): Promise<BbbReputationResult> {
  if (!firecrawlApiKey) {
    return { checked: false, scamReports: [], reviewMentions: [], error: 'Search unavailable' };
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
      return { checked: false, scamReports: [], reviewMentions: [], error: 'BBB search failed' };
    }

    const payload = await response.json();
    const results: BbbSearchResult[] = Array.isArray(payload?.data?.web) ? payload.data.web : [];
    return {
      checked: true,
      ...classifyBbbResults(domain, results),
    };
  } catch (error) {
    console.error('BBB search failed:', error instanceof Error ? error.name : 'Unknown error');
    return { checked: false, scamReports: [], reviewMentions: [], error: 'BBB search unavailable' };
  } finally {
    clearTimeout(timeout);
  }
}
