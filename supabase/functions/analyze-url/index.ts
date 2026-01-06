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

interface DomainInfo {
  createdDate?: string;
  expiryDate?: string;
  registrar?: string;
  ageInDays?: number;
  isNewDomain?: boolean;
}

interface SecurityHeaders {
  hasHSTS: boolean;
  hasCSP: boolean;
  hasXFrameOptions: boolean;
  hasXContentTypeOptions: boolean;
  score: number;
}

// Known scam patterns and suspicious indicators
const scamPatterns = {
  domains: [
    /free.+gift/i,
    /claim.+prize/i,
    /winner.+selected/i,
    /verify.+account/i,
    /suspended.+action/i,
    /urgent.+action/i,
    /limited.+offer/i,
  ],
  urgencyWords: [
    'act now', 'limited time', 'expires today', 'last chance', 
    'don\'t miss', 'hurry', 'immediately', 'urgent', 'final notice',
    'only x left', 'selling fast', 'almost gone'
  ],
  pricePatterns: [
    /\d+%\s*off/i,
    /save\s*\$?\d+/i,
    /was\s*\$\d+.*now\s*\$\d+/i,
    /free\s*shipping/i,
  ],
  suspiciousTLDs: [
    '.xyz', '.top', '.work', '.click', '.link', '.info', '.biz', 
    '.online', '.site', '.club', '.vip', '.win', '.review'
  ],
  suspiciousEmails: [
    /@gmail\.com$/i, /@yahoo\.com$/i, /@hotmail\.com$/i, 
    /@outlook\.com$/i, /@aol\.com$/i
  ],
  typosquatting: [
    { legit: 'amazon', fakes: ['amaz0n', 'amazn', 'amazonn', 'arnazon', 'arnazn'] },
    { legit: 'paypal', fakes: ['paypa1', 'paypai', 'paypaI', 'peypal', 'paypaI'] },
    { legit: 'facebook', fakes: ['faceb00k', 'facebok', 'facebock', 'faceboook'] },
    { legit: 'google', fakes: ['g00gle', 'googie', 'googgle', 'googe'] },
    { legit: 'apple', fakes: ['appie', 'app1e', 'aple', 'applle'] },
    { legit: 'microsoft', fakes: ['micros0ft', 'microsft', 'mircosoft'] },
    { legit: 'netflix', fakes: ['netf1ix', 'netfiix', 'neflix', 'netfilx'] },
    { legit: 'instagram', fakes: ['instagr4m', 'lnstagram', 'instgram', 'instagran'] },
  ]
};

// Detect social media platforms and special sites
const socialMediaPatterns = [
  { pattern: /facebook\.com|fb\.com/i, name: 'Facebook' },
  { pattern: /instagram\.com/i, name: 'Instagram' },
  { pattern: /tiktok\.com/i, name: 'TikTok' },
  { pattern: /pinterest\.com/i, name: 'Pinterest' },
  { pattern: /twitter\.com|x\.com/i, name: 'Twitter/X' },
  { pattern: /linkedin\.com/i, name: 'LinkedIn' },
  { pattern: /youtube\.com|youtu\.be/i, name: 'YouTube' },
  { pattern: /reddit\.com/i, name: 'Reddit' },
  { pattern: /snapchat\.com/i, name: 'Snapchat' },
  { pattern: /whatsapp\.com/i, name: 'WhatsApp' },
  { pattern: /telegram\.org|t\.me/i, name: 'Telegram' },
  { pattern: /discord\.com|discord\.gg/i, name: 'Discord' },
  { pattern: /etsy\.com/i, name: 'Etsy' },
  { pattern: /ebay\.com/i, name: 'eBay' },
  { pattern: /amazon\.com|amzn\.to/i, name: 'Amazon' },
  { pattern: /aliexpress\.com/i, name: 'AliExpress' },
  { pattern: /shopify\.com/i, name: 'Shopify Store' },
];

function detectPlatform(url: string): { isSocialMedia: boolean; platform: string | null; isMarketplace: boolean } {
  for (const { pattern, name } of socialMediaPatterns) {
    if (pattern.test(url)) {
      const marketplaces = ['Etsy', 'eBay', 'Amazon', 'AliExpress'];
      return { 
        isSocialMedia: true, 
        platform: name,
        isMarketplace: marketplaces.includes(name)
      };
    }
  }
  return { isSocialMedia: false, platform: null, isMarketplace: false };
}

// Check for typosquatting attempts
function checkTyposquatting(domain: string): { isSuspicious: boolean; mimicking?: string } {
  const domainLower = domain.toLowerCase();
  for (const brand of scamPatterns.typosquatting) {
    for (const fake of brand.fakes) {
      if (domainLower.includes(fake)) {
        return { isSuspicious: true, mimicking: brand.legit };
      }
    }
    // Also check if domain contains the brand but isn't the official site
    if (domainLower.includes(brand.legit) && 
        !domainLower.match(new RegExp(`^(www\\.)?${brand.legit}\\.(com|org|net|co|io)$`))) {
      return { isSuspicious: true, mimicking: brand.legit };
    }
  }
  return { isSuspicious: false };
}

// Check for suspicious TLD
function checkSuspiciousTLD(domain: string): boolean {
  return scamPatterns.suspiciousTLDs.some(tld => domain.toLowerCase().endsWith(tld));
}

// Analyze urgency tactics in content
function analyzeUrgencyTactics(content: string): { hasUrgencyTactics: boolean; count: number; examples: string[] } {
  const examples: string[] = [];
  let count = 0;
  
  for (const word of scamPatterns.urgencyWords) {
    const regex = new RegExp(word, 'gi');
    const matches = content.match(regex);
    if (matches) {
      count += matches.length;
      if (examples.length < 3) {
        examples.push(word);
      }
    }
  }
  
  return {
    hasUrgencyTactics: count >= 2,
    count,
    examples
  };
}

// Check for suspicious contact info
function analyzeContactInfo(content: string, links: string[]): { 
  hasProfessionalEmail: boolean; 
  hasPhoneNumber: boolean;
  hasGenericEmail: boolean;
  emailDomain?: string;
} {
  // Check for email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = content.match(emailRegex) || [];
  
  let hasProfessionalEmail = false;
  let hasGenericEmail = false;
  let emailDomain: string | undefined;
  
  for (const email of emails) {
    const isGeneric = scamPatterns.suspiciousEmails.some(pattern => pattern.test(email));
    if (isGeneric) {
      hasGenericEmail = true;
    } else {
      hasProfessionalEmail = true;
      emailDomain = email.split('@')[1];
    }
  }
  
  // Check for phone numbers
  const phoneRegex = /(\+?1?[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const hasPhoneNumber = phoneRegex.test(content);
  
  return { hasProfessionalEmail, hasPhoneNumber, hasGenericEmail, emailDomain };
}

// Analyze payment methods mentioned
function analyzePaymentMethods(content: string): {
  acceptsCreditCards: boolean;
  acceptsPayPal: boolean;
  acceptsCrypto: boolean;
  onlyAcceptsUnusualMethods: boolean;
  methods: string[];
} {
  const methods: string[] = [];
  const contentLower = content.toLowerCase();
  
  const paymentIndicators = {
    creditCards: ['visa', 'mastercard', 'american express', 'amex', 'discover', 'credit card', 'debit card'],
    paypal: ['paypal'],
    crypto: ['bitcoin', 'btc', 'ethereum', 'eth', 'cryptocurrency', 'crypto payment'],
    unusual: ['wire transfer', 'western union', 'moneygram', 'gift card', 'zelle only', 'venmo only', 'cashapp only']
  };
  
  let acceptsCreditCards = false;
  let acceptsPayPal = false;
  let acceptsCrypto = false;
  let hasUnusualOnly = false;
  
  for (const indicator of paymentIndicators.creditCards) {
    if (contentLower.includes(indicator)) {
      acceptsCreditCards = true;
      if (!methods.includes('Credit Cards')) methods.push('Credit Cards');
      break;
    }
  }
  
  for (const indicator of paymentIndicators.paypal) {
    if (contentLower.includes(indicator)) {
      acceptsPayPal = true;
      if (!methods.includes('PayPal')) methods.push('PayPal');
      break;
    }
  }
  
  for (const indicator of paymentIndicators.crypto) {
    if (contentLower.includes(indicator)) {
      acceptsCrypto = true;
      if (!methods.includes('Cryptocurrency')) methods.push('Cryptocurrency');
      break;
    }
  }
  
  for (const indicator of paymentIndicators.unusual) {
    if (contentLower.includes(indicator)) {
      methods.push(indicator);
    }
  }
  
  // Flag if only unusual methods are mentioned
  hasUnusualOnly = !acceptsCreditCards && !acceptsPayPal && methods.length > 0;
  
  return {
    acceptsCreditCards,
    acceptsPayPal,
    acceptsCrypto,
    onlyAcceptsUnusualMethods: hasUnusualOnly,
    methods
  };
}

// Check for common scam page patterns
function detectScamPatterns(content: string, html: string): {
  hasCountdownTimer: boolean;
  hasPopups: boolean;
  hasFakeReviewIndicators: boolean;
  hasCloneIndicators: boolean;
  suspiciousPatterns: string[];
} {
  const patterns: string[] = [];
  const contentLower = content.toLowerCase();
  const htmlLower = html.toLowerCase();
  
  // Check for countdown timers
  const hasCountdownTimer = 
    htmlLower.includes('countdown') || 
    htmlLower.includes('timer') ||
    /\d+:\d+:\d+/.test(content) ||
    contentLower.includes('offer expires');
  if (hasCountdownTimer) patterns.push('Countdown timer detected');
  
  // Check for aggressive popups
  const hasPopups = 
    htmlLower.includes('popup') || 
    htmlLower.includes('modal') ||
    htmlLower.includes('exit-intent');
  
  // Check for fake review indicators
  const hasFakeReviewIndicators = 
    /verified (buyer|purchase|review)/i.test(content) && 
    (content.match(/5 star|★★★★★/gi)?.length || 0) > 10;
  if (hasFakeReviewIndicators) patterns.push('Possibly fake review patterns');
  
  // Check for site clone indicators
  const hasCloneIndicators = 
    htmlLower.includes('shopify') && 
    (contentLower.includes('powered by') || htmlLower.includes('template'));
  
  // Check for excessive discount claims
  const discountMatches = content.match(/\d{2,3}%\s*(off|discount|sale)/gi) || [];
  if (discountMatches.length > 5) {
    patterns.push('Excessive discount claims');
  }
  
  // Check for fake trust badges in HTML
  const fakeBadgePatterns = ['trust-badge', 'secure-badge', 'mcafee', 'norton secured'];
  for (const badge of fakeBadgePatterns) {
    if (htmlLower.includes(badge) && !htmlLower.includes('https://www.mcafee.com') && !htmlLower.includes('https://www.norton.com')) {
      if (badge === 'mcafee' || badge === 'norton secured') {
        patterns.push('Possibly fake security badge');
        break;
      }
    }
  }
  
  // Check for copy-paste product descriptions
  const genericProductPhrases = [
    'high quality material',
    'perfect gift',
    'buy with confidence',
    'limited stock',
    'order now',
    'satisfaction guaranteed'
  ];
  const genericCount = genericProductPhrases.filter(phrase => contentLower.includes(phrase)).length;
  if (genericCount >= 4) {
    patterns.push('Generic/templated product descriptions');
  }
  
  return {
    hasCountdownTimer,
    hasPopups,
    hasFakeReviewIndicators,
    hasCloneIndicators,
    suspiciousPatterns: patterns
  };
}

// Analyze external links for legitimacy
function analyzeLinks(links: string[], domain: string): {
  hasSocialLinks: boolean;
  hasExternalReviews: boolean;
  suspiciousRedirects: boolean;
  brokenLinkIndicators: boolean;
  socialPlatforms: string[];
  reviewPlatforms: string[];
} {
  const socialDomains = ['facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'linkedin.com', 'youtube.com', 'tiktok.com', 'pinterest.com'];
  const reviewDomains = ['trustpilot.com', 'bbb.org', 'sitejabber.com', 'yelp.com', 'google.com/maps', 'reviews.io', 'g2.com'];
  const redirectDomains = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'rebrand.ly'];
  
  const socialPlatforms: string[] = [];
  const reviewPlatforms: string[] = [];
  let suspiciousRedirects = false;
  
  for (const link of links) {
    const linkLower = link.toLowerCase();
    
    // Check social links
    for (const social of socialDomains) {
      if (linkLower.includes(social) && !socialPlatforms.includes(social.split('.')[0])) {
        socialPlatforms.push(social.split('.')[0]);
      }
    }
    
    // Check review platforms
    for (const review of reviewDomains) {
      if (linkLower.includes(review) && !reviewPlatforms.includes(review.split('.')[0])) {
        reviewPlatforms.push(review.split('.')[0]);
      }
    }
    
    // Check for suspicious redirects
    for (const redirect of redirectDomains) {
      if (linkLower.includes(redirect)) {
        suspiciousRedirects = true;
        break;
      }
    }
  }
  
  return {
    hasSocialLinks: socialPlatforms.length > 0,
    hasExternalReviews: reviewPlatforms.length > 0,
    suspiciousRedirects,
    brokenLinkIndicators: false, // Would need actual link checking
    socialPlatforms,
    reviewPlatforms
  };
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

    // Detect if this is a social media or marketplace URL
    const platformInfo = detectPlatform(formattedUrl);
    console.log('Platform detected:', platformInfo);

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

    // Extract domain info from URL
    const urlObj = new URL(formattedUrl);
    const domain = urlObj.hostname;

    // Run pre-analysis checks
    console.log('Running pre-analysis security checks...');
    
    const typosquattingCheck = checkTyposquatting(domain);
    const suspiciousTLD = checkSuspiciousTLD(domain);
    
    console.log('Typosquatting check:', typosquattingCheck);
    console.log('Suspicious TLD:', suspiciousTLD);

    // Step 1: Scrape the website with Firecrawl
    const waitTime = platformInfo.isSocialMedia ? 5000 : 3000;
    
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
        waitFor: waitTime,
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

    // Run content analysis checks
    console.log('Running content analysis checks...');
    
    const urgencyAnalysis = analyzeUrgencyTactics(markdown);
    const contactAnalysis = analyzeContactInfo(markdown, links);
    const paymentAnalysis = analyzePaymentMethods(markdown);
    const scamPatternAnalysis = detectScamPatterns(markdown, html);
    const linkAnalysis = analyzeLinks(links, domain);
    
    console.log('Urgency tactics:', urgencyAnalysis);
    console.log('Contact info:', contactAnalysis);
    console.log('Payment methods:', paymentAnalysis);
    console.log('Scam patterns:', scamPatternAnalysis);
    console.log('Link analysis:', linkAnalysis);

    // Build enhanced context for AI
    const preAnalysisFindings = {
      typosquatting: typosquattingCheck,
      suspiciousTLD,
      urgencyTactics: urgencyAnalysis,
      contactInfo: contactAnalysis,
      paymentMethods: paymentAnalysis,
      scamPatterns: scamPatternAnalysis,
      linkAnalysis
    };

    // Step 2: Analyze with AI - Enhanced prompt with pre-analysis findings
    const platformContext = platformInfo.isSocialMedia 
      ? `\n\nPLATFORM CONTEXT: This is a ${platformInfo.platform} ${platformInfo.isMarketplace ? 'marketplace listing' : 'profile/page'}. Analyze it accordingly:
- For social media profiles: Check account age indicators, follower counts, post history, verified badges, engagement authenticity
- For marketplace listings: Check seller ratings, review authenticity, return policies, pricing vs market rate
- Look for signs of fake accounts, bot activity, or scam patterns specific to ${platformInfo.platform}`
      : '';

    const preAnalysisContext = `
PRE-ANALYSIS FINDINGS (incorporate these into your analysis):
- Typosquatting Detection: ${typosquattingCheck.isSuspicious ? `⚠️ SUSPICIOUS - May be mimicking "${typosquattingCheck.mimicking}"` : 'No issues detected'}
- Suspicious TLD: ${suspiciousTLD ? '⚠️ Uses a commonly abused domain extension' : 'Standard TLD'}
- Urgency Tactics: ${urgencyAnalysis.hasUrgencyTactics ? `⚠️ Found ${urgencyAnalysis.count} urgency phrases (${urgencyAnalysis.examples.join(', ')})` : 'Normal'}
- Contact Info: Professional email: ${contactAnalysis.hasProfessionalEmail ? 'Yes' : 'No'}, Generic email: ${contactAnalysis.hasGenericEmail ? '⚠️ Yes' : 'No'}, Phone: ${contactAnalysis.hasPhoneNumber ? 'Yes' : 'No'}
- Payment Methods: ${paymentAnalysis.methods.join(', ') || 'Not detected'}${paymentAnalysis.onlyAcceptsUnusualMethods ? ' ⚠️ ONLY UNUSUAL METHODS' : ''}
- Suspicious Patterns Found: ${scamPatternAnalysis.suspiciousPatterns.length > 0 ? scamPatternAnalysis.suspiciousPatterns.join(', ') : 'None'}
- Social Media Links: ${linkAnalysis.hasSocialLinks ? linkAnalysis.socialPlatforms.join(', ') : 'None found'}
- External Reviews: ${linkAnalysis.hasExternalReviews ? linkAnalysis.reviewPlatforms.join(', ') : 'None found'}
- Suspicious Redirects: ${linkAnalysis.suspiciousRedirects ? '⚠️ Uses URL shorteners' : 'No'}
`;

    console.log('Analyzing with AI...');
    const analysisPrompt = `You are an expert website and social media legitimacy analyzer specializing in detecting scams, dropshippers, fake accounts, and fraudulent sellers. Analyze this URL thoroughly.${platformContext}

Website URL: ${formattedUrl}
Domain: ${domain}
Page Title: ${metadata.title || 'Unknown'}
Page Description: ${metadata.description || 'Unknown'}
${preAnalysisContext}

Website Content (markdown):
${markdown.substring(0, 12000)}

HTML Structure Analysis (first 4000 chars):
${html.substring(0, 4000)}

Links found on page: ${links.slice(0, 50).join(', ')}

Perform a COMPREHENSIVE analysis covering ALL of the following:

## CORE ANALYSIS
1. **Trust Score (0-100)**: Overall legitimacy score - be strict! Deduct heavily for red flags.
2. **Verdict**: "safe", "caution", or "danger"
3. **Summary**: 2-3 sentence summary of key findings

## DOMAIN VERIFICATION
- Is this domain mimicking a known brand (typosquatting)?
- Does it use a suspicious TLD (.xyz, .top, .click, etc.)?
- Any signs of domain age (copyright dates, "established since" claims)?
- Is the domain name itself suspicious or random-looking?

## BUSINESS VERIFICATION
- Physical address present and appears legitimate (not a PO Box or fake address)?
- Can you identify the actual business location/country?
- Business registration/company info mentioned?
- How long has this business likely been operating?
- Contact methods: professional email (not Gmail/Yahoo), phone, live chat?
- About page with real team/company info and photos?

## LEGITIMACY INDICATORS
- Privacy policy present and comprehensive (not copied/generic)?
- Terms of service present?
- Return/refund policy clear and reasonable?
- Shipping information transparent with realistic timeframes?
- Clear business hours or response time mentioned?

## SCAM/DROPSHIPPER DETECTION
- Are prices suspiciously low (50%+ below market)?
- Stock photos or generic product images?
- Product descriptions copied or generic?
- Unrealistic delivery promises (too fast for overseas shipping)?
- Too-good-to-be-true offers?
- Pressure tactics (countdown timers, "only X left")?
- Signs of AliExpress/DHGate dropshipping (long shipping times, no tracking)?
- Template/clone website indicators?

## IMAGE ANALYSIS
- Are product images professional or stock photos?
- Any signs images are stolen from other sites?
- Watermarks or low-quality images suggesting dropshipping?
- Generic lifestyle images vs actual product photos?

## WEBSITE QUALITY
- Professional design or templated/cheap looking?
- Grammar and spelling quality throughout?
- Consistent branding throughout?
- Mobile-responsive design?
- Page load issues or broken elements?
- Is this clearly a template site with minimal customization?

## PAYMENT & SECURITY
- Multiple payment options (cards, PayPal, etc.)?
- Does it ONLY accept unusual methods (crypto, wire transfer, gift cards)?
- Secure checkout mentioned?
- SSL certificate present (https)?
- Trust badges - are they legitimate or fake image badges?
- Buyer protection mentioned?

## SOCIAL PROOF & REPUTATION
- Customer reviews present on-site?
- Do reviews seem authentic or fake/generated?
- Links to active social media profiles?
- External review platform mentions (Trustpilot, BBB, etc.)?
- Any press mentions or awards?
- Can you verify the business exists externally?

## SOCIAL MEDIA PROFILE ANALYSIS (if applicable)
- Does the account have a verified badge?
- Account creation date or age indicators?
- Follower/following ratio realistic?
- Post history consistent and authentic?
- Engagement levels normal (not suspiciously low or artificially high)?
- Profile picture original or stock/stolen?
- Bio information complete and legitimate?
- Links in bio lead to legitimate destinations?
- Signs of bot activity or fake engagement?

## CRITICAL RED FLAGS TO CHECK
- Domain mimicking known brands?
- Recently created domain or account?
- Contact info leads to generic Gmail/Outlook?
- No way to reach a real person?
- Only accepts obscure payment methods?
- Claims to be US-based but signs of overseas operation?
- Extreme discounts (80-90% off)?
- Copied content from other legitimate sites?
- Multiple browser warnings or security issues?
- For social media: new account selling expensive items, asking for payment outside platform?

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
      "sslIssuer": "<issuer if known>",
      "isSuspiciousTLD": <boolean>,
      "isTyposquatting": <boolean>,
      "mimickingBrand": "<brand name or null>"
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
      "hasShippingInfo": <boolean>,
      "hasProfessionalEmail": <boolean>,
      "hasPhoneNumber": <boolean>,
      "identifiedCountry": "<country or 'unknown'>"
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
      "notes": "<string>",
      "socialPlatformsLinked": ["<platform1>", "<platform2>"],
      "externalReviewSites": ["<site1>", "<site2>"]
    },
    "websiteQuality": {
      "designQuality": "<professional|average|poor>",
      "grammarQuality": "<excellent|good|poor>",
      "overallProfessionalism": "<high|medium|low>",
      "isTemplatedSite": <boolean>
    },
    "paymentSecurity": {
      "acceptsCreditCards": <boolean>,
      "acceptsPayPal": <boolean>,
      "acceptsCrypto": <boolean>,
      "hasUnusualMethodsOnly": <boolean>,
      "hasBuyerProtection": <boolean>,
      "trustBadgesAppearLegit": <boolean>
    },
    "urgencyTactics": {
      "hasCountdownTimers": <boolean>,
      "hasScarcityMessages": <boolean>,
      "pressureTacticsLevel": "<none|low|medium|high>"
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
            content: 'You are an expert fraud analyst and e-commerce investigator. Analyze websites for legitimacy with extreme attention to detail. Be strict in your scoring - any significant red flags should heavily impact the trust score. Always return valid JSON only.'
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
      
      // Merge pre-analysis findings with AI results
      if (analysisResult.details) {
        // Add urgency tactics if not present
        if (!analysisResult.details.urgencyTactics) {
          analysisResult.details.urgencyTactics = {
            hasCountdownTimers: scamPatternAnalysis.hasCountdownTimer,
            hasScarcityMessages: urgencyAnalysis.hasUrgencyTactics,
            pressureTacticsLevel: urgencyAnalysis.count > 5 ? 'high' : urgencyAnalysis.count > 2 ? 'medium' : urgencyAnalysis.count > 0 ? 'low' : 'none'
          };
        }
        
        // Add payment security if not present
        if (!analysisResult.details.paymentSecurity) {
          analysisResult.details.paymentSecurity = {
            acceptsCreditCards: paymentAnalysis.acceptsCreditCards,
            acceptsPayPal: paymentAnalysis.acceptsPayPal,
            acceptsCrypto: paymentAnalysis.acceptsCrypto,
            hasUnusualMethodsOnly: paymentAnalysis.onlyAcceptsUnusualMethods,
            hasBuyerProtection: false,
            trustBadgesAppearLegit: !scamPatternAnalysis.suspiciousPatterns.includes('Possibly fake security badge')
          };
        }
        
        // Enhance social proof with link analysis
        if (analysisResult.details.socialProof) {
          analysisResult.details.socialProof.socialPlatformsLinked = linkAnalysis.socialPlatforms;
          analysisResult.details.socialProof.externalReviewSites = linkAnalysis.reviewPlatforms;
        }
        
        // Add typosquatting info to domain
        if (analysisResult.details.domain) {
          analysisResult.details.domain.isSuspiciousTLD = suspiciousTLD;
          analysisResult.details.domain.isTyposquatting = typosquattingCheck.isSuspicious;
          analysisResult.details.domain.mimickingBrand = typosquattingCheck.mimicking || null;
        }
        
        // Add additional red flags from pre-analysis
        if (!analysisResult.details.redFlags) {
          analysisResult.details.redFlags = [];
        }
        
        if (typosquattingCheck.isSuspicious) {
          analysisResult.details.redFlags.push(`Domain appears to mimic "${typosquattingCheck.mimicking}"`);
        }
        if (suspiciousTLD) {
          analysisResult.details.redFlags.push('Uses a commonly abused domain extension');
        }
        if (paymentAnalysis.onlyAcceptsUnusualMethods) {
          analysisResult.details.redFlags.push('Only accepts unusual payment methods');
        }
        if (contactAnalysis.hasGenericEmail && !contactAnalysis.hasProfessionalEmail) {
          analysisResult.details.redFlags.push('Only uses generic email (Gmail/Yahoo) for business contact');
        }
        if (linkAnalysis.suspiciousRedirects) {
          analysisResult.details.redFlags.push('Uses URL shorteners which may hide true destinations');
        }
        for (const pattern of scamPatternAnalysis.suspiciousPatterns) {
          if (!analysisResult.details.redFlags.includes(pattern)) {
            analysisResult.details.redFlags.push(pattern);
          }
        }
        
        // Adjust trust score based on critical findings
        if (typosquattingCheck.isSuspicious) {
          analysisResult.trustScore = Math.max(0, analysisResult.trustScore - 30);
          if (analysisResult.trustScore < 30) analysisResult.verdict = 'danger';
        }
        if (paymentAnalysis.onlyAcceptsUnusualMethods) {
          analysisResult.trustScore = Math.max(0, analysisResult.trustScore - 20);
        }
      }
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('AI content:', aiContent);
      
      // Fallback analysis with pre-analysis data
      analysisResult = {
        trustScore: typosquattingCheck.isSuspicious ? 20 : suspiciousTLD ? 40 : 50,
        verdict: typosquattingCheck.isSuspicious ? 'danger' : 'caution',
        summary: 'Could not fully analyze this website. Exercise caution before making purchases.',
        details: {
          domain: {
            name: domain,
            age: 'Unknown',
            ssl: formattedUrl.startsWith('https'),
            isSuspiciousTLD: suspiciousTLD,
            isTyposquatting: typosquattingCheck.isSuspicious,
            mimickingBrand: typosquattingCheck.mimicking || null
          },
          business: {
            hasContactInfo: contactAnalysis.hasPhoneNumber || contactAnalysis.hasProfessionalEmail,
            hasPhysicalAddress: false,
            addressVerification: 'not_found',
            businessAge: 'unknown',
            hasAboutPage: false,
            hasPrivacyPolicy: false,
            hasTerms: false,
            hasReturnPolicy: false,
            hasShippingInfo: false,
            hasProfessionalEmail: contactAnalysis.hasProfessionalEmail,
            hasPhoneNumber: contactAnalysis.hasPhoneNumber,
            identifiedCountry: 'unknown'
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
          redFlags: [
            'Could not complete full analysis',
            ...(typosquattingCheck.isSuspicious ? [`Domain may be mimicking "${typosquattingCheck.mimicking}"`] : []),
            ...(suspiciousTLD ? ['Uses commonly abused domain extension'] : []),
            ...scamPatternAnalysis.suspiciousPatterns
          ],
          positiveSignals: [],
          pricing: {
            suspiciouslyLow: false,
            comparisonToMarket: 'normal',
            notes: 'Unable to analyze pricing',
          },
          socialProof: {
            hasReviews: false,
            reviewsAppearAuthentic: false,
            hasSocialLinks: linkAnalysis.hasSocialLinks,
            externalReviewPlatforms: linkAnalysis.hasExternalReviews,
            notes: 'Unable to verify social proof',
            socialPlatformsLinked: linkAnalysis.socialPlatforms,
            externalReviewSites: linkAnalysis.reviewPlatforms
          },
          websiteQuality: {
            designQuality: 'unknown',
            grammarQuality: 'unknown',
            overallProfessionalism: 'unknown',
            isTemplatedSite: scamPatternAnalysis.hasCloneIndicators
          },
          paymentSecurity: {
            acceptsCreditCards: paymentAnalysis.acceptsCreditCards,
            acceptsPayPal: paymentAnalysis.acceptsPayPal,
            acceptsCrypto: paymentAnalysis.acceptsCrypto,
            hasUnusualMethodsOnly: paymentAnalysis.onlyAcceptsUnusualMethods,
            hasBuyerProtection: false,
            trustBadgesAppearLegit: true
          },
          urgencyTactics: {
            hasCountdownTimers: scamPatternAnalysis.hasCountdownTimer,
            hasScarcityMessages: urgencyAnalysis.hasUrgencyTactics,
            pressureTacticsLevel: urgencyAnalysis.count > 5 ? 'high' : urgencyAnalysis.count > 2 ? 'medium' : 'low'
          }
        },
      };
    }

    // Add scraped metadata to result
    analysisResult.scrapedData = {
      title: metadata.title,
      description: metadata.description,
      screenshot: screenshot,
    };

    // Add pre-analysis context for transparency
    analysisResult.preAnalysis = {
      typosquattingCheck,
      suspiciousTLD,
      urgencyTacticsFound: urgencyAnalysis.count,
      paymentMethodsDetected: paymentAnalysis.methods,
      socialLinksFound: linkAnalysis.socialPlatforms,
      reviewPlatformsFound: linkAnalysis.reviewPlatforms
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
