const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedData {
  markdown?: string;
  html?: string;
  metadata?: {
    title?: string;
    description?: string;
    sourceURL?: string;
    statusCode?: number;
  };
  screenshot?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Analyzing URL:', formattedUrl);

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Scrape the website with Firecrawl
    console.log('Scraping website with Firecrawl...');
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'html', 'links', 'screenshot'],
        onlyMainContent: false,
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeResponse.json();
    console.log('Scrape response status:', scrapeResponse.status);

    if (!scrapeResponse.ok) {
      console.error('Firecrawl error:', scrapeData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Could not access website: ${scrapeData.error || 'Unknown error'}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scrapedContent: ScrapedData = scrapeData.data || scrapeData;
    const markdown = scrapedContent.markdown || '';
    const metadata = scrapedContent.metadata || {};
    const screenshot = scrapedContent.screenshot;

    // Extract domain info from URL
    const urlObj = new URL(formattedUrl);
    const domain = urlObj.hostname;

    // Step 2: Analyze with AI
    console.log('Analyzing with AI...');
    const analysisPrompt = `You are a website legitimacy analyzer. Analyze this e-commerce/retail website and provide a detailed trust assessment.

Website URL: ${formattedUrl}
Domain: ${domain}
Page Title: ${metadata.title || 'Unknown'}
Page Description: ${metadata.description || 'Unknown'}

Website Content (markdown):
${markdown.substring(0, 8000)}

Analyze this website for the following criteria and return a JSON response:

1. **Trust Score (0-100)**: Overall legitimacy score
2. **Verdict**: "safe", "caution", or "danger"
3. **Summary**: 1-2 sentence summary of findings
4. **Domain Analysis**:
   - Is this a well-known domain or suspicious?
   - Does it use HTTPS?
   - Any domain-related red flags?
5. **Business Legitimacy**:
   - Does it have contact information (phone, email, address)?
   - Is there an About page?
   - Privacy policy present?
   - Terms of service present?
   - Return/refund policy visible?
6. **Red Flags** (list any found):
   - Prices too good to be true
   - Poor grammar/spelling
   - No contact info
   - Missing policies
   - Suspicious payment methods only
   - Fake reviews or testimonials
   - Pressure tactics (limited time, countdown timers)
   - No social media presence
   - Copied content from other sites
   - Domain mimicking known brands
7. **Positive Signals** (list any found):
   - Professional design
   - Clear contact info
   - Verified reviews
   - Social media presence
   - Secure checkout
   - Multiple payment options
   - Physical address listed
8. **Pricing Analysis**: Are prices suspiciously low?
9. **Social Proof**: Evidence of real customers/reviews?

Return ONLY valid JSON in this exact format:
{
  "trustScore": <number 0-100>,
  "verdict": "<safe|caution|danger>",
  "summary": "<string>",
  "details": {
    "domain": {
      "name": "<domain name>",
      "age": "<estimated or unknown>",
      "ssl": <boolean>,
      "sslIssuer": "<issuer if known>"
    },
    "business": {
      "hasContactInfo": <boolean>,
      "hasAboutPage": <boolean>,
      "hasPrivacyPolicy": <boolean>,
      "hasTerms": <boolean>,
      "hasReturnPolicy": <boolean>
    },
    "redFlags": ["<flag1>", "<flag2>"],
    "positiveSignals": ["<signal1>", "<signal2>"],
    "pricing": {
      "suspiciouslyLow": <boolean>,
      "notes": "<string>"
    },
    "socialProof": {
      "hasReviews": <boolean>,
      "hasSocialLinks": <boolean>,
      "notes": "<string>"
    }
  }
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing e-commerce websites for legitimacy. Return only valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      console.error('AI gateway error:', errorData);
      return new Response(
        JSON.stringify({ success: false, error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI response received');

    // Parse JSON from AI response
    let analysisResult;
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = aiContent;
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      analysisResult = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('AI content:', aiContent);
      
      // Fallback analysis
      analysisResult = {
        trustScore: 50,
        verdict: 'caution',
        summary: 'Could not fully analyze this website. Exercise caution before making purchases.',
        details: {
          domain: {
            name: domain,
            age: 'Unknown',
            ssl: formattedUrl.startsWith('https'),
          },
          business: {
            hasContactInfo: false,
            hasAboutPage: false,
            hasPrivacyPolicy: false,
            hasTerms: false,
            hasReturnPolicy: false,
          },
          redFlags: ['Could not complete full analysis'],
          positiveSignals: [],
          pricing: {
            suspiciouslyLow: false,
            notes: 'Unable to analyze pricing',
          },
          socialProof: {
            hasReviews: false,
            hasSocialLinks: false,
            notes: 'Unable to verify social proof',
          },
        },
      };
    }

    // Add scraped metadata to result
    analysisResult.scrapedData = {
      title: metadata.title,
      description: metadata.description,
      screenshot: screenshot,
    };

    console.log('Analysis complete, trust score:', analysisResult.trustScore);

    return new Response(
      JSON.stringify({ success: true, result: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-url function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
