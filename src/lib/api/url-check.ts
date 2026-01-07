import { supabase } from '@/integrations/supabase/client';

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

export interface AnalysisResult {
  trustScore: number;
  verdict: 'safe' | 'caution' | 'danger';
  summary: string;
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
}

export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  const { data, error } = await supabase.functions.invoke('analyze-url', {
    body: { url },
  });

  if (error) {
    console.error('Error analyzing URL:', error);
    throw new Error(error.message || 'Failed to analyze URL');
  }

  if (!data.success) {
    throw new Error(data.error || 'Analysis failed');
  }

  return data.result;
}
