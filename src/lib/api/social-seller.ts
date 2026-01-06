import { supabase } from '@/integrations/supabase/client';

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
  const { data, error } = await supabase.functions.invoke('analyze-social-seller', {
    body: { username, bio, platform },
  });

  if (error) {
    throw new Error(error.message || 'Failed to analyze seller');
  }

  if (!data.success) {
    throw new Error(data.error || 'Analysis failed');
  }

  return data.data;
}
