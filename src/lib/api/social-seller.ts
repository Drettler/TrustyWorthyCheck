import { supabase } from '@/integrations/supabase/client';
import { getOrCreateClientId } from '@/lib/client-id';

export interface RedFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface SocialSellerResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  redFlags: RedFlag[];
  positiveSignals: string[];
  summary: string;
  usernameAnalysis?: {
    pattern: string;
    concerns: string[];
  };
  bioAnalysis?: {
    concerns: string[];
    positives: string[];
  };
}

export async function analyzeSocialSeller(
  username?: string,
  bio?: string,
  platform?: string
): Promise<SocialSellerResult> {
  const { data, error, response } = await supabase.functions.invoke('analyze-social-seller', {
    body: { username, bio, platform },
    headers: {
      'x-client-id': getOrCreateClientId(),
    },
  });

  if (error) {
    // Mirror URL analyzer behavior: some function errors embed JSON in error.message.
    let body: any = null;
    if (response) {
      try {
        const text = await response.clone().text();
        body = text ? JSON.parse(text) : null;
      } catch {
        body = null;
      }
    }

    if (!body && typeof error.message === 'string') {
      const firstBrace = error.message.indexOf('{');
      const lastBrace = error.message.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          body = JSON.parse(error.message.slice(firstBrace, lastBrace + 1));
        } catch {
          body = null;
        }
      }
    }

    if (body?.error === 'rate_limit_exceeded') {
      throw new Error(body.message || 'Daily limit reached. Please try again tomorrow.');
    }

    throw new Error(error.message || 'Failed to analyze seller');
  }

  if (!data.success) {
    throw new Error(data.error || 'Analysis failed');
  }

  return data.data;
}

