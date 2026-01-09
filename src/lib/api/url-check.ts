import { supabase } from '@/integrations/supabase/client';
import { getOrCreateClientId } from '@/lib/client-id';
export interface VirusTotalData {
  isMalicious: boolean;
  maliciousCount: number;
  suspiciousCount: number;
  harmlessCount: number;
  totalEngines: number;
  reputationScore: number;
  categories: string[];
  lastAnalysisDate?: string;
  available: boolean;
}

export interface WhoisData {
  domainName?: string;
  registrar?: string;
  createdDate?: string;
  updatedDate?: string;
  expiryDate?: string;
  domainAge?: string;
  domainAgeInDays?: number;
  registrantCountry?: string;
  registrantOrg?: string;
  nameServers?: string[];
  isPrivacyProtected: boolean;
  available: boolean;
}

export interface PriceComparisonData {
  productsAnalyzed: number;
  averageDiscount: number;
  suspiciouslyLowCount: number;
  marketPosition: 'much_lower' | 'slightly_lower' | 'normal' | 'higher';
  comparisonNotes: string[];
  redFlags: string[];
}

export interface ConfidenceData {
  level: 'high' | 'medium' | 'low';
  message: string;
  checksVerified: number;
  totalPossibleChecks: number;
  verifiedSources: string[];
}

export interface AnalysisResult {
  trustScore: number;
  verdict: 'safe' | 'caution' | 'danger';
  summary: string;
  confidence?: ConfidenceData;
  details: {
    domain: {
      name: string;
      age: string;
      ssl: boolean;
      sslIssuer?: string;
    };
    business: {
      hasContactInfo: boolean;
      hasPhysicalAddress: boolean;
      addressVerification: 'verified' | 'suspicious' | 'not_found' | 'po_box';
      businessAge: string;
      hasAboutPage: boolean;
      hasPrivacyPolicy: boolean;
      hasTerms: boolean;
      hasReturnPolicy: boolean;
      hasShippingInfo: boolean;
    };
    dropshipperIndicators: {
      isLikelyDropshipper: boolean;
      confidence: 'high' | 'medium' | 'low';
      reasons: string[];
    };
    imageAnalysis: {
      appearsOriginal: boolean;
      stockPhotoLikely: boolean;
      qualityAssessment: 'professional' | 'average' | 'poor' | 'suspicious' | 'unknown';
    };
    redFlags: string[];
    positiveSignals: string[];
    pricing: {
      suspiciouslyLow: boolean;
      comparisonToMarket: 'much_lower' | 'slightly_lower' | 'normal' | 'higher';
      notes: string;
    };
    socialProof: {
      hasReviews: boolean;
      reviewsAppearAuthentic: boolean;
      hasSocialLinks: boolean;
      externalReviewPlatforms: boolean;
      notes: string;
    };
    websiteQuality: {
      designQuality: 'professional' | 'average' | 'poor' | 'unknown';
      grammarQuality: 'excellent' | 'good' | 'poor' | 'unknown';
      overallProfessionalism: 'high' | 'medium' | 'low' | 'unknown';
    };
  };
  scrapedData?: {
    title?: string;
    description?: string;
    screenshot?: string;
  };
  proFeatures?: {
    virusTotal: VirusTotalData;
    whois: WhoisData;
    priceComparison: PriceComparisonData;
  };
  scamIndicators?: {
    government: {
      isLikelyScam: boolean;
      agencies: string[];
      patterns: string[];
    };
    subscription: {
      isLikelyScam: boolean;
      brands: string[];
      hasPhonePrompt: boolean;
      patterns: string[];
    };
  };
}

export interface RateLimitError {
  type: 'rate_limit';
  message: string;
  remaining: number;
  limit: number;
  resetAt: string;
}

export interface SslError {
  type: 'ssl_error';
  message: string;
}

export interface ScrapeError {
  type: 'scrape_failed';
  message: string;
}

export type AnalysisError = RateLimitError | SslError | ScrapeError;

export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  const { data, error, response } = await supabase.functions.invoke('analyze-url', {
    body: { url },
    headers: {
      'x-client-id': getOrCreateClientId(),
    },
  });

  // For non-2xx responses, supabase-js returns `error` + `response` (body not parsed).
  // Parse the body when possible so the UI can show friendly messages.
  if (error) {
    let body: any = null;

    if (response) {
      // Some function errors return JSON without a reliable Content-Type.
      // Try JSON parse regardless; fall back silently.
      try {
        const text = await response.clone().text();
        body = text ? JSON.parse(text) : null;
      } catch {
        body = null;
      }
    }

    // If we couldn't read the response (or it wasn't JSON), supabase-js often embeds
    // the JSON payload directly in error.message like:
    // "Edge function returned 429: Error, { ... }"
    if (!body && typeof error.message === 'string') {
      const firstBrace = error.message.indexOf('{');
      const lastBrace = error.message.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonPart = error.message.slice(firstBrace, lastBrace + 1);
        try {
          body = JSON.parse(jsonPart);
        } catch {
          body = null;
        }
      }
    }

    if (body && typeof body === 'object') {
      if (body.error === 'rate_limit_exceeded') {
        const rateLimitError: RateLimitError = {
          type: 'rate_limit',
          message: body.message || 'Daily limit reached. Please try again tomorrow.',
          remaining: body.remaining ?? 0,
          limit: body.limit ?? 3,
          resetAt: body.resetAt ?? '',
        };
        throw rateLimitError;
      }

      if (body.error === 'ssl_error') {
        const sslError: SslError = {
          type: 'ssl_error',
          message: body.message || 'This website has SSL/security issues.',
        };
        throw sslError;
      }

      if (body.error === 'scrape_failed') {
        const scrapeError: ScrapeError = {
          type: 'scrape_failed',
          message: body.message || 'Could not access this website.',
        };
        throw scrapeError;
      }

      if (body.message || body.error) {
        throw new Error(body.message || body.error);
      }
    }

    console.error('Error analyzing URL:', error);
    throw new Error(error.message || 'Failed to analyze URL');
  }

  // Handle rate limit response (if backend returns 200 with an error payload)
  if (!data.success && data.error === 'rate_limit_exceeded') {
    const rateLimitError: RateLimitError = {
      type: 'rate_limit',
      message: data.message || 'Daily limit reached. Please try again tomorrow.',
      remaining: data.remaining || 0,
      limit: data.limit || 3,
      resetAt: data.resetAt || '',
    };
    throw rateLimitError;
  }

  // Handle SSL error
  if (!data.success && data.error === 'ssl_error') {
    const sslError: SslError = {
      type: 'ssl_error',
      message: data.message || 'This website has SSL/security issues.',
    };
    throw sslError;
  }

  // Handle scrape failure
  if (!data.success && data.error === 'scrape_failed') {
    const scrapeError: ScrapeError = {
      type: 'scrape_failed',
      message: data.message || 'Could not access this website.',
    };
    throw scrapeError;
  }

  if (!data.success) {
    throw new Error(data.message || data.error || 'Analysis failed');
  }

  return data.result;
}
