const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedData {
  markdown?: string;
  html?: string;
  links?: string[];
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
    const html = scrapedContent.html || '';
    const links = scrapedContent.links || [];
    const metadata = scrapedContent.metadata || {};
    const screenshot = scrapedContent.screenshot;

    // Extract domain info from URL
    const urlObj = new URL(formattedUrl);
    const domain = urlObj.hostname;

    // Step 2: Analyze with AI - Enhanced prompt for deeper analysis
    console.log('Analyzing with AI...');
    const analysisPrompt = `You are an expert website legitimacy analyzer specializing in detecting scams, dropshippers, and fraudulent e-commerce sites. Analyze this website thoroughly.

Website URL: ${formattedUrl}
Domain: ${domain}
Page Title: ${metadata.title || 'Unknown'}
Page Description: ${metadata.description || 'Unknown'}

Website Content (markdown):
${markdown.substring(0, 10000)}

HTML Structure Analysis (first 3000 chars):
${html.substring(0, 3000)}

Links found on page: ${links.slice(0, 50).join(', ')}

Perform a COMPREHENSIVE analysis covering:

## CORE ANALYSIS
1. **Trust Score (0-100)**: Overall legitimacy score
2. **Verdict**: "safe", "caution", or "danger"
3. **Summary**: 2-3 sentence summary of key findings

## BUSINESS VERIFICATION
- Physical address present and appears legitimate (not a PO Box or fake address)?
- Business registration/company info mentioned?
- How long has this business likely been operating (based on copyright dates, domain age mentions, "established since" claims)?
- Contact methods: phone, email, live chat, contact form?
- About page with real team/company info?

## LEGITIMACY INDICATORS
- Privacy policy present and comprehensive?
- Terms of service present?
- Return/refund policy clear and reasonable?
- Shipping information transparent?
- Clear business hours or response time mentioned?

## SCAM/DROPSHIPPER DETECTION
- Are prices suspiciously low (50%+ below market)?
- Stock photos or generic product images?
- Product descriptions copied or generic?
- Unrealistic delivery promises?
- Too-good-to-be-true offers?
- Pressure tactics (countdown timers, "only X left")?
- Signs of AliExpress/DHGate dropshipping?

## IMAGE ANALYSIS
- Are product images professional or stock photos?
- Any signs images are stolen from other sites?
- Watermarks or low-quality images suggesting dropshipping?

## WEBSITE QUALITY
- Professional design or templated/cheap looking?
- Grammar and spelling quality?
- Consistent branding throughout?
- Mobile-responsive design mentioned?
- Page load issues or broken elements?

## PAYMENT & SECURITY
- Multiple payment options (cards, PayPal, etc.)?
- Secure checkout mentioned?
- SSL certificate present (https)?
- Trust badges legitimate or fake-looking?

## SOCIAL PROOF
- Customer reviews present?
- Do reviews seem authentic or fake?
- Social media links present and active?
- External review platform mentions (Trustpilot, BBB, etc.)?
- Real customer testimonials with names/photos?

## RED FLAGS TO SPECIFICALLY CHECK
- Domain mimicking known brands?
- Recently created domain?
- Contact info leads to generic Gmail/Outlook?
- No way to reach a real person?
- Only accepts obscure payment methods?
- Claims to be US-based but signs of overseas operation?

Return ONLY valid JSON in this exact format:
{
  "trustScore": <number 0-100>,
  "verdict": "<safe|caution|danger>",
  "summary": "<string>",
  "details": {
    "domain": {
      "name": "<domain name>",
      "age": "<estimated based on site content, copyright, etc.>",
      "ssl": <boolean>,
      "sslIssuer": "<issuer if known>"
    },
    "business": {
      "hasContactInfo": <boolean>,
      "hasPhysicalAddress": <boolean>,
      "addressVerification": "<verified|suspicious|not_found|po_box>",
      "businessAge": "<estimated years or 'unknown'>",
      "hasAboutPage": <boolean>,
      "hasPrivacyPolicy": <boolean>,
      "hasTerms": <boolean>,
      "hasReturnPolicy": <boolean>,
      "hasShippingInfo": <boolean>
    },
    "dropshipperIndicators": {
      "isLikelyDropshipper": <boolean>,
      "confidence": "<high|medium|low>",
      "reasons": ["<reason1>", "<reason2>"]
    },
    "imageAnalysis": {
      "appearsOriginal": <boolean>,
      "stockPhotoLikely": <boolean>,
      "qualityAssessment": "<professional|average|poor|suspicious>"
    },
    "redFlags": ["<flag1>", "<flag2>"],
    "positiveSignals": ["<signal1>", "<signal2>"],
    "pricing": {
      "suspiciouslyLow": <boolean>,
      "comparisonToMarket": "<much_lower|slightly_lower|normal|higher>",
      "notes": "<string>"
    },
    "socialProof": {
      "hasReviews": <boolean>,
      "reviewsAppearAuthentic": <boolean>,
      "hasSocialLinks": <boolean>,
      "externalReviewPlatforms": <boolean>,
      "notes": "<string>"
    },
    "websiteQuality": {
      "designQuality": "<professional|average|poor>",
      "grammarQuality": "<excellent|good|poor>",
      "overallProfessionalism": "<high|medium|low>"
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
            content: 'You are an expert fraud analyst and e-commerce investigator. Analyze websites for legitimacy with extreme attention to detail. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.2,
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
            hasPhysicalAddress: false,
            addressVerification: 'not_found',
            businessAge: 'unknown',
            hasAboutPage: false,
            hasPrivacyPolicy: false,
            hasTerms: false,
            hasReturnPolicy: false,
            hasShippingInfo: false,
          },
          dropshipperIndicators: {
            isLikelyDropshipper: false,
            confidence: 'low',
            reasons: ['Could not complete analysis'],
          },
          imageAnalysis: {
            appearsOriginal: false,
            stockPhotoLikely: false,
            qualityAssessment: 'unknown',
          },
          redFlags: ['Could not complete full analysis'],
          positiveSignals: [],
          pricing: {
            suspiciouslyLow: false,
            comparisonToMarket: 'normal',
            notes: 'Unable to analyze pricing',
          },
          socialProof: {
            hasReviews: false,
            reviewsAppearAuthentic: false,
            hasSocialLinks: false,
            externalReviewPlatforms: false,
            notes: 'Unable to verify social proof',
          },
          websiteQuality: {
            designQuality: 'unknown',
            grammarQuality: 'unknown',
            overallProfessionalism: 'unknown',
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
