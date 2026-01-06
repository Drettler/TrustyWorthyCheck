const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  username?: string;
  bio?: string;
  platform?: string;
}

interface RedFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

interface AnalysisResult {
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

// Username pattern detection
function analyzeUsernamePatterns(username: string): { concerns: string[]; pattern: string } {
  const concerns: string[] = [];
  let pattern = 'normal';
  const usernameLower = username.toLowerCase();

  // Check for random number strings (e.g., user38472)
  if (/[a-z]+\d{4,}$/i.test(username)) {
    concerns.push('Username ends with many random numbers - often auto-generated');
    pattern = 'auto-generated';
  }

  // Check for keyboard mashing patterns
  if (/^[qwerty]{4,}|^[asdfgh]{4,}|^[zxcvbn]{4,}/i.test(username)) {
    concerns.push('Username appears to be keyboard mashing - suggests throwaway account');
    pattern = 'keyboard-mash';
  }

  // Check for impersonation attempts
  const impersonationPatterns = [
    { pattern: /^(official|real|the_?real|verified|authentic)_?/i, desc: 'Uses "official/real/verified" prefix - common impersonation tactic' },
    { pattern: /_?(official|real|verified|authentic|legit)$/i, desc: 'Uses legitimacy-claiming suffix - may be impersonating' },
    { pattern: /0/g, desc: 'Uses zero instead of letter "O" - common in fake accounts' },
    { pattern: /1/g, desc: 'Uses number "1" which could replace letter "l" or "i"' },
    { pattern: /l(?=.*l)/i, desc: 'Multiple "l"s which could be impersonation of "I"' },
  ];

  for (const { pattern: p, desc } of impersonationPatterns) {
    if (p.test(username)) {
      // For character replacements, only flag if it looks like a brand name
      if (desc.includes('zero') || desc.includes('number')) {
        const commonBrands = ['amazon', 'paypal', 'apple', 'google', 'nike', 'adidas', 'gucci', 'louis', 'chanel'];
        if (commonBrands.some(brand => usernameLower.includes(brand.replace(/o/g, '0').replace(/i/g, '1')))) {
          concerns.push(desc);
          pattern = 'impersonation';
        }
      } else {
        concerns.push(desc);
        pattern = 'impersonation';
      }
    }
  }

  // Check for excessive underscores/dots (often filler when username taken)
  const specialCharCount = (username.match(/[._]/g) || []).length;
  if (specialCharCount >= 3) {
    concerns.push('Excessive underscores/dots - often used when original name is taken');
  }

  // Check for very short or very long usernames
  if (username.length < 4) {
    concerns.push('Very short username - limited history traceability');
  } else if (username.length > 25) {
    concerns.push('Unusually long username - may be trying to include keywords for discoverability');
  }

  // Check for "shop/store/deals" in username
  if (/shop|store|deals|sale|discount|cheap|best_?price|wholesale/i.test(username)) {
    concerns.push('Commercial keywords in username - verify business legitimacy');
  }

  return { concerns, pattern };
}

// AI-powered bio analysis
async function analyzeBioWithAI(bio: string, lovableApiKey: string): Promise<{ concerns: string[]; positives: string[]; riskIndicators: string[] }> {
  const prompt = `Analyze this social media seller's bio/description for scam red flags. Be specific and concise.

Bio: "${bio}"

Look for:
1. Urgency language ("DM now!", "Limited time!", "Act fast!")
2. Too-good-to-be-true claims ("100% guaranteed", "Best prices anywhere")
3. Pressure tactics ("Don't miss out", "Only X left")
4. Suspicious payment requests (crypto only, gift cards, wire transfer, no PayPal/cards)
5. Vague or no contact information
6. Poor grammar/spelling (can indicate foreign scam operation)
7. Claims of being "verified" or "official" without platform verification
8. Dropshipping indicators (long shipping times, "ships from warehouse")
9. Copied/generic business descriptions

Also note any POSITIVE signals:
- Professional language
- Clear return policies
- Multiple contact methods
- Specific business details
- Platform verification mentions

Respond in JSON format:
{
  "concerns": ["specific concern 1", "specific concern 2"],
  "positives": ["positive signal 1", "positive signal 2"],
  "riskIndicators": ["brief risk summary 1"]
}`;

  try {
    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a fraud detection expert analyzing social media seller profiles. Be concise and specific.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', await response.text());
      return { concerns: [], positives: [], riskIndicators: [] };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        concerns: parsed.concerns || [],
        positives: parsed.positives || [],
        riskIndicators: parsed.riskIndicators || [],
      };
    }

    return { concerns: [], positives: [], riskIndicators: [] };
  } catch (error) {
    console.error('Error analyzing bio with AI:', error);
    return { concerns: [], positives: [], riskIndicators: [] };
  }
}

// Calculate risk score - higher score = MORE risk (0 = safe, 100 = scam)
// But we display it as a trust score to users, so we invert for display
function calculateRiskScore(usernameAnalysis: { concerns: string[] } | null, bioAnalysis: { concerns: string[]; positives: string[] } | null): { score: number; level: 'low' | 'medium' | 'high' } {
  // Start with a base risk score
  let riskScore = 0;
  let hasAnyConcerns = false;

  // Username concerns add to risk
  if (usernameAnalysis && usernameAnalysis.concerns.length > 0) {
    riskScore += usernameAnalysis.concerns.length * 15;
    hasAnyConcerns = true;
  }

  // Bio concerns add to risk, positives reduce risk
  if (bioAnalysis) {
    if (bioAnalysis.concerns.length > 0) {
      riskScore += bioAnalysis.concerns.length * 12;
      hasAnyConcerns = true;
    }
    riskScore -= bioAnalysis.positives.length * 5;
  }

  // If no concerns at all, give a low risk score (25 = 75% safe when inverted)
  if (!hasAnyConcerns) {
    riskScore = 25; // This means 75% trust score when inverted
  } else {
    // Ensure minimum risk score when there are concerns
    riskScore = Math.max(40, riskScore);
  }

  // Clamp score between 0 and 100
  riskScore = Math.max(0, Math.min(100, riskScore));

  // Determine risk level
  let level: 'low' | 'medium' | 'high' = 'low';
  if (riskScore >= 70) level = 'high';
  else if (riskScore >= 40) level = 'medium';

  return { score: riskScore, level };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, bio, platform }: AnalysisRequest = await req.json();

    if (!username && !bio) {
      return new Response(
        JSON.stringify({ success: false, error: 'Username or bio is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing social seller:', { username, bioLength: bio?.length, platform });

    const redFlags: RedFlag[] = [];
    const positiveSignals: string[] = [];
    let usernameResult = null;
    let bioResult = null;

    // Analyze username if provided
    if (username) {
      const usernameAnalysis = analyzeUsernamePatterns(username.trim());
      usernameResult = usernameAnalysis;
      
      for (const concern of usernameAnalysis.concerns) {
        redFlags.push({
          type: 'username',
          severity: usernameAnalysis.pattern === 'impersonation' ? 'high' : 'medium',
          description: concern,
        });
      }

      if (usernameAnalysis.concerns.length === 0) {
        positiveSignals.push('Username appears legitimate with no suspicious patterns');
      }
    }

    // Analyze bio if provided
    if (bio && bio.trim().length > 0) {
      const bioAnalysis = await analyzeBioWithAI(bio.trim(), lovableApiKey);
      bioResult = bioAnalysis;

      for (const concern of bioAnalysis.concerns) {
        redFlags.push({
          type: 'bio',
          severity: 'medium',
          description: concern,
        });
      }

      positiveSignals.push(...bioAnalysis.positives);
    }

    // Calculate overall risk
    const { score, level } = calculateRiskScore(usernameResult, bioResult);

    // Generate summary
    let summary = '';
    if (redFlags.length === 0) {
      summary = 'No significant red flags detected. However, always verify sellers through multiple channels before making purchases.';
    } else if (level === 'high') {
      summary = `High risk detected with ${redFlags.length} red flag(s). Exercise extreme caution and consider avoiding this seller.`;
    } else if (level === 'medium') {
      summary = `Some concerns detected. Proceed with caution and verify the seller through additional means.`;
    } else {
      summary = `Minor concerns noted. The seller appears relatively low-risk, but always verify before purchasing.`;
    }

    const result: AnalysisResult = {
      riskScore: score,
      riskLevel: level,
      redFlags,
      positiveSignals,
      summary,
      usernameAnalysis: usernameResult ? {
        pattern: usernameResult.pattern,
        concerns: usernameResult.concerns,
      } : undefined,
      bioAnalysis: bioResult ? {
        concerns: bioResult.concerns,
        positives: bioResult.positives,
      } : undefined,
    };

    console.log('Analysis complete:', { riskScore: score, riskLevel: level, redFlagsCount: redFlags.length });

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-social-seller:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
