import { supabase } from '@/integrations/supabase/client';

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
      hasAboutPage: boolean;
      hasPrivacyPolicy: boolean;
      hasTerms: boolean;
      hasReturnPolicy: boolean;
    };
    redFlags: string[];
    positiveSignals: string[];
    pricing: {
      suspiciouslyLow: boolean;
      notes: string;
    };
    socialProof: {
      hasReviews: boolean;
      hasSocialLinks: boolean;
      notes: string;
    };
  };
  scrapedData?: {
    title?: string;
    description?: string;
    screenshot?: string;
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
