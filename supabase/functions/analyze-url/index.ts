import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a hash for URL caching
async function hashUrl(url: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(url.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check cache for existing results
async function getCachedResult(urlHash: string): Promise<any | null> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data, error } = await supabase
      .from('url_analysis_cache')
      .select('result')
      .eq('url_hash', urlHash)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.log('Cache lookup error:', error.message);
      return null;
    }

    if (data) {
      console.log('Cache hit for URL');
      return data.result;
    }

    console.log('Cache miss');
    return null;
  } catch (error) {
    console.error('Cache check failed:', error);
    return null;
  }
}

// Store result in cache
async function cacheResult(urlHash: string, url: string, result: any): Promise<void> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Upsert to handle potential race conditions
    const { error } = await supabase
      .from('url_analysis_cache')
      .upsert({
        url_hash: urlHash,
        url: url,
        result: result,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      }, { onConflict: 'url_hash' });

    if (error) {
      console.log('Cache store error:', error.message);
    } else {
      console.log('Result cached successfully');
    }
  } catch (error) {
    console.error('Cache store failed:', error);
  }
}

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
  hasSecureCookies: boolean;
  score: number;
}

interface SSLAnalysis {
  isValid: boolean;
  issuer?: string;
  expiryDate?: string;
  protocol?: string;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
}

interface BusinessVerification {
  hasVATNumber: boolean;
  hasCompanyRegNumber: boolean;
  hasDUNS: boolean;
  hasPhysicalStore: boolean;
  claimedCountry?: string;
  actualIndicatedCountry?: string;
  countriesMismatch: boolean;
}

interface GovernmentScamIndicators {
  claimsGovAffiliation: boolean;
  usesGovLookalikeTerms: boolean;
  mentionedAgencies: string[];
  isLikelyGovScam: boolean;
  suspiciousPatterns: string[];
}

interface SubscriptionScamIndicators {
  claimsAntivirusSoftware: boolean;
  mentionedBrands: string[];
  hasUrgentRenewalMessage: boolean;
  hasPhoneCallPrompt: boolean;
  isLikelySubscriptionScam: boolean;
  suspiciousPatterns: string[];
}

interface VirusTotalResult {
  isMalicious: boolean;
  maliciousCount: number;
  suspiciousCount: number;
  harmlessCount: number;
  undetectedCount: number;
  totalEngines: number;
  reputationScore: number;
  categories: string[];
  lastAnalysisDate?: string;
  error?: string;
}

interface WhoisResult {
  domainName?: string;
  registrar?: string;
  createdDate?: string;
  updatedDate?: string;
  expiryDate?: string;
  domainAge?: string;
  domainAgeInDays?: number;
  registrant?: {
    organization?: string;
    country?: string;
    state?: string;
  };
  nameServers?: string[];
  status?: string[];
  isPrivacyProtected: boolean;
  error?: string;
}

interface PriceComparisonResult {
  productsAnalyzed: number;
  averageDiscount: number;
  suspiciouslyLowCount: number;
  comparisonNotes: string[];
  marketPosition: 'much_lower' | 'slightly_lower' | 'normal' | 'higher';
  redFlags: string[];
}

// VirusTotal API integration
async function checkVirusTotal(domain: string): Promise<VirusTotalResult> {
  const apiKey = Deno.env.get('VIRUSTOTAL_API_KEY');
  
  if (!apiKey) {
    console.log('VirusTotal API key not configured');
    return {
      isMalicious: false,
      maliciousCount: 0,
      suspiciousCount: 0,
      harmlessCount: 0,
      undetectedCount: 0,
      totalEngines: 0,
      reputationScore: 0,
      categories: [],
      error: 'VirusTotal not configured'
    };
  }

  try {
    console.log('Checking VirusTotal for domain:', domain);
    
    // Get domain report from VirusTotal
    const response = await fetch(`https://www.virustotal.com/api/v3/domains/${domain}`, {
      headers: {
        'x-apikey': apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('Domain not found in VirusTotal database');
        return {
          isMalicious: false,
          maliciousCount: 0,
          suspiciousCount: 0,
          harmlessCount: 0,
          undetectedCount: 0,
          totalEngines: 0,
          reputationScore: 0,
          categories: [],
          error: 'Domain not in database'
        };
      }
      throw new Error(`VirusTotal API error: ${response.status}`);
    }

    const data = await response.json();
    const attributes = data.data?.attributes || {};
    const lastAnalysisStats = attributes.last_analysis_stats || {};
    const categories = attributes.categories || {};
    
    const maliciousCount = lastAnalysisStats.malicious || 0;
    const suspiciousCount = lastAnalysisStats.suspicious || 0;
    const harmlessCount = lastAnalysisStats.harmless || 0;
    const undetectedCount = lastAnalysisStats.undetected || 0;
    const totalEngines = maliciousCount + suspiciousCount + harmlessCount + undetectedCount;

    console.log('VirusTotal results:', { maliciousCount, suspiciousCount, totalEngines });

    return {
      isMalicious: maliciousCount > 0,
      maliciousCount,
      suspiciousCount,
      harmlessCount,
      undetectedCount,
      totalEngines,
      reputationScore: attributes.reputation || 0,
      categories: Object.values(categories) as string[],
      lastAnalysisDate: attributes.last_analysis_date 
        ? new Date(attributes.last_analysis_date * 1000).toISOString() 
        : undefined,
    };
  } catch (error) {
    console.error('VirusTotal check failed:', error);
    return {
      isMalicious: false,
      maliciousCount: 0,
      suspiciousCount: 0,
      harmlessCount: 0,
      undetectedCount: 0,
      totalEngines: 0,
      reputationScore: 0,
      categories: [],
      error: error instanceof Error ? error.message : 'Check failed'
    };
  }
}

// WHOIS lookup using free API
async function lookupWhois(domain: string): Promise<WhoisResult> {
  try {
    console.log('Looking up WHOIS for domain:', domain);
    
    // Use whoisjson.com free API (no key required, rate limited)
    const response = await fetch(`https://whoisjson.com/api/v1/whois?domain=${encodeURIComponent(domain)}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Try fallback API
      console.log('Primary WHOIS API failed, trying fallback...');
      return await lookupWhoisFallback(domain);
    }

    const data = await response.json();
    
    // Calculate domain age
    let domainAge = 'Unknown';
    let domainAgeInDays = 0;
    if (data.created) {
      const createdDate = new Date(data.created);
      const now = new Date();
      domainAgeInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (domainAgeInDays < 30) {
        domainAge = `${domainAgeInDays} days`;
      } else if (domainAgeInDays < 365) {
        domainAge = `${Math.floor(domainAgeInDays / 30)} months`;
      } else {
        domainAge = `${Math.floor(domainAgeInDays / 365)} years`;
      }
    }

    console.log('WHOIS results:', { domainAge, registrar: data.registrar });

    return {
      domainName: data.domain_name || domain,
      registrar: data.registrar,
      createdDate: data.created,
      updatedDate: data.updated,
      expiryDate: data.expires,
      domainAge,
      domainAgeInDays,
      registrant: {
        organization: data.registrant?.organization,
        country: data.registrant?.country,
        state: data.registrant?.state,
      },
      nameServers: data.name_servers,
      status: data.status,
      isPrivacyProtected: !!(data.registrant?.organization?.toLowerCase().includes('privacy') ||
        data.registrant?.organization?.toLowerCase().includes('proxy') ||
        data.registrant?.organization?.toLowerCase().includes('redacted')),
    };
  } catch (error) {
    console.error('WHOIS lookup failed:', error);
    return await lookupWhoisFallback(domain);
  }
}

// Fallback WHOIS lookup
async function lookupWhoisFallback(domain: string): Promise<WhoisResult> {
  try {
    // Try ip-api WHOIS (basic info)
    const response = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        isPrivacyProtected: false,
        error: 'WHOIS lookup unavailable'
      };
    }

    const data = await response.json();
    
    // Extract dates from events
    let createdDate: string | undefined;
    let updatedDate: string | undefined;
    let expiryDate: string | undefined;
    
    for (const event of data.events || []) {
      if (event.eventAction === 'registration') createdDate = event.eventDate;
      if (event.eventAction === 'last changed') updatedDate = event.eventDate;
      if (event.eventAction === 'expiration') expiryDate = event.eventDate;
    }

    // Calculate domain age
    let domainAge = 'Unknown';
    let domainAgeInDays = 0;
    if (createdDate) {
      const created = new Date(createdDate);
      const now = new Date();
      domainAgeInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      
      if (domainAgeInDays < 30) {
        domainAge = `${domainAgeInDays} days`;
      } else if (domainAgeInDays < 365) {
        domainAge = `${Math.floor(domainAgeInDays / 30)} months`;
      } else {
        domainAge = `${Math.floor(domainAgeInDays / 365)} years`;
      }
    }

    // Extract registrar
    const registrar = data.entities?.find((e: any) => e.roles?.includes('registrar'))?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3];

    return {
      domainName: data.ldhName || domain,
      registrar: registrar,
      createdDate,
      updatedDate,
      expiryDate,
      domainAge,
      domainAgeInDays,
      nameServers: data.nameservers?.map((ns: any) => ns.ldhName),
      status: data.status,
      isPrivacyProtected: false,
    };
  } catch (error) {
    console.error('Fallback WHOIS lookup failed:', error);
    return {
      isPrivacyProtected: false,
      error: 'WHOIS lookup failed'
    };
  }
}

// Enhanced price comparison analysis
function analyzePriceComparison(content: string, html: string): PriceComparisonResult {
  const contentLower = content.toLowerCase();
  const redFlags: string[] = [];
  const comparisonNotes: string[] = [];
  
  // Extract price patterns
  const pricePatterns = [
    /\$\d+(?:\.\d{2})?/g,
    /was\s*\$(\d+(?:\.\d{2})?)\s*now\s*\$(\d+(?:\.\d{2})?)/gi,
    /(\d+)%\s*off/gi,
    /save\s*\$?(\d+)/gi,
    /retail\s*(?:value|price)[:\s]*\$(\d+)/gi,
    /msrp[:\s]*\$(\d+)/gi,
    /compare\s*at\s*\$(\d+)/gi,
  ];
  
  // Count products with extreme discounts
  let suspiciouslyLowCount = 0;
  let totalDiscountPercentages: number[] = [];
  
  // Look for "was/now" patterns
  const wasNowPattern = /was\s*\$(\d+(?:\.\d{2})?)\s*now\s*\$(\d+(?:\.\d{2})?)/gi;
  let match;
  while ((match = wasNowPattern.exec(content)) !== null) {
    const wasPrice = parseFloat(match[1]);
    const nowPrice = parseFloat(match[2]);
    if (wasPrice > 0 && nowPrice > 0) {
      const discount = ((wasPrice - nowPrice) / wasPrice) * 100;
      totalDiscountPercentages.push(discount);
      if (discount >= 70) {
        suspiciouslyLowCount++;
      }
    }
  }
  
  // Look for percentage off claims
  const percentOffPattern = /(\d+)%\s*off/gi;
  while ((match = percentOffPattern.exec(content)) !== null) {
    const discount = parseInt(match[1]);
    if (discount >= 50) {
      totalDiscountPercentages.push(discount);
    }
    if (discount >= 80) {
      suspiciouslyLowCount++;
    }
  }
  
  // Analyze discount patterns
  const averageDiscount = totalDiscountPercentages.length > 0
    ? Math.round(totalDiscountPercentages.reduce((a, b) => a + b, 0) / totalDiscountPercentages.length)
    : 0;
  
  // Determine market position
  let marketPosition: 'much_lower' | 'slightly_lower' | 'normal' | 'higher' = 'normal';
  if (averageDiscount >= 60) {
    marketPosition = 'much_lower';
    redFlags.push(`Average discount of ${averageDiscount}% is unusually high`);
  } else if (averageDiscount >= 40) {
    marketPosition = 'slightly_lower';
    comparisonNotes.push(`Products advertised with ${averageDiscount}% average discount`);
  }
  
  // Check for suspicious pricing indicators
  if (contentLower.includes('wholesale price') || contentLower.includes('factory direct')) {
    comparisonNotes.push('Claims wholesale/factory direct pricing');
  }
  
  if (contentLower.includes('clearance') && contentLower.includes('final sale')) {
    comparisonNotes.push('Clearance items marked as final sale');
  }
  
  // Check for "too good to be true" patterns
  const luxuryBrands = ['gucci', 'louis vuitton', 'chanel', 'prada', 'rolex', 'cartier', 'hermes', 'burberry'];
  for (const brand of luxuryBrands) {
    if (contentLower.includes(brand) && averageDiscount >= 50) {
      redFlags.push(`Luxury brand ${brand.charAt(0).toUpperCase() + brand.slice(1)} at suspicious discount`);
      suspiciouslyLowCount++;
    }
  }
  
  // Check for fake "compare at" pricing
  if (/compare\s*at\s*\$\d{3,}/i.test(content) && suspiciouslyLowCount > 0) {
    redFlags.push('Uses "compare at" pricing which may be inflated');
  }
  
  // Check for artificial urgency with pricing
  if ((contentLower.includes('today only') || contentLower.includes('flash sale')) && averageDiscount >= 50) {
    comparisonNotes.push('Flash sale or time-limited pricing in effect');
  }

  console.log('Price comparison analysis:', { averageDiscount, suspiciouslyLowCount, marketPosition });

  return {
    productsAnalyzed: totalDiscountPercentages.length,
    averageDiscount,
    suspiciouslyLowCount,
    comparisonNotes,
    marketPosition,
    redFlags,
  };
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

// Detect government impersonation scams
function detectGovernmentScam(content: string, html: string, domain: string): GovernmentScamIndicators {
  const contentLower = content.toLowerCase();
  const domainLower = domain.toLowerCase();
  const suspiciousPatterns: string[] = [];
  const mentionedAgencies: string[] = [];
  
  // Government agencies commonly impersonated
  const govAgencies = {
    us: ['irs', 'social security', 'ssa', 'dmv', 'medicare', 'fbi', 'dea', 'ice', 'customs', 'treasury', 'uscis', 'immigration'],
    uk: ['hmrc', 'dvla', 'nhs', 'home office', 'gov.uk'],
    au: ['ato', 'centrelink', 'mygov', 'medicare australia'],
    ca: ['cra', 'service canada', 'revenue canada']
  };
  
  // Check for government-like domain patterns
  const govDomainPatterns = [
    /gov[^a-z]/i, /\.gov\./i, /-gov-/i, /government/i,
    /federal/i, /official/i, /department-of/i
  ];
  
  let claimsGovAffiliation = false;
  let usesGovLookalikeTerms = false;
  
  // Check domain for gov-like terms (suspicious if not actual .gov)
  for (const pattern of govDomainPatterns) {
    if (pattern.test(domainLower) && !domainLower.endsWith('.gov')) {
      usesGovLookalikeTerms = true;
      suspiciousPatterns.push('Domain contains government-like terms but is not official');
    }
  }
  
  // Check content for agency mentions
  for (const [country, agencies] of Object.entries(govAgencies)) {
    for (const agency of agencies) {
      if (contentLower.includes(agency)) {
        mentionedAgencies.push(agency.toUpperCase());
        claimsGovAffiliation = true;
      }
    }
  }
  
  // Check for common government scam phrases
  const govScamPhrases = [
    'verify your identity immediately',
    'your tax refund',
    'legal action will be taken',
    'arrest warrant',
    'your social security number has been suspended',
    'call this number immediately',
    'pay the fine',
    'your license has been suspended',
    'legal proceedings',
    'failure to respond will result in',
    'we have tried to contact you',
    'urgent notice from',
    'final warning',
    'immediate payment required'
  ];
  
  for (const phrase of govScamPhrases) {
    if (contentLower.includes(phrase)) {
      suspiciousPatterns.push(`Contains suspicious phrase: "${phrase}"`);
    }
  }
  
  // Check for payment demands (gov agencies don't demand gift cards, crypto, wire transfers)
  const scamPaymentPhrases = [
    'gift card', 'bitcoin', 'wire transfer', 'western union', 
    'moneygram', 'pay immediately', 'zelle', 'cash app', 'venmo'
  ];
  
  for (const phrase of scamPaymentPhrases) {
    if (contentLower.includes(phrase) && claimsGovAffiliation) {
      suspiciousPatterns.push(`Government claim + suspicious payment method: ${phrase}`);
    }
  }
  
  const isLikelyGovScam = 
    (claimsGovAffiliation && (suspiciousPatterns.length >= 2 || usesGovLookalikeTerms)) ||
    (usesGovLookalikeTerms && suspiciousPatterns.length >= 1);
  
  return {
    claimsGovAffiliation,
    usesGovLookalikeTerms,
    mentionedAgencies: [...new Set(mentionedAgencies)],
    isLikelyGovScam,
    suspiciousPatterns
  };
}

// Detect subscription/antivirus renewal scams
function detectSubscriptionScam(content: string, html: string, domain: string): SubscriptionScamIndicators {
  const contentLower = content.toLowerCase();
  const domainLower = domain.toLowerCase();
  const suspiciousPatterns: string[] = [];
  const mentionedBrands: string[] = [];
  
  // Software commonly impersonated in subscription scams
  const antivirusBrands = ['norton', 'mcafee', 'avast', 'kaspersky', 'bitdefender', 'avg', 'malwarebytes', 'webroot', 'trend micro', 'eset'];
  const techBrands = ['microsoft', 'apple', 'google', 'amazon', 'geek squad', 'best buy', 'paypal'];
  
  let claimsAntivirusSoftware = false;
  let hasUrgentRenewalMessage = false;
  let hasPhoneCallPrompt = false;
  
  // Check for antivirus brand mentions
  for (const brand of antivirusBrands) {
    if (contentLower.includes(brand) || domainLower.includes(brand)) {
      mentionedBrands.push(brand.charAt(0).toUpperCase() + brand.slice(1));
      claimsAntivirusSoftware = true;
    }
  }
  
  for (const brand of techBrands) {
    if (contentLower.includes(brand) || domainLower.includes(brand)) {
      mentionedBrands.push(brand.charAt(0).toUpperCase() + brand.slice(1));
    }
  }
  
  // Check for renewal scam phrases
  const renewalPhrases = [
    'your subscription has expired',
    'subscription will be renewed',
    'auto-renewal',
    'will be charged',
    'renew now',
    'subscription ending',
    'license expired',
    'protection expired',
    'your computer is at risk',
    'virus detected',
    'your pc is infected',
    'immediate action required',
    'call our toll-free number',
    'call us immediately',
    'speak to a technician',
    'remote access',
    'let us fix your computer'
  ];
  
  for (const phrase of renewalPhrases) {
    if (contentLower.includes(phrase)) {
      hasUrgentRenewalMessage = true;
      suspiciousPatterns.push(`Contains renewal scam phrase: "${phrase}"`);
    }
  }
  
  // Check for phone call prompts (major red flag)
  const phonePromptPatterns = [
    /call\s*(us|now|immediately|toll[- ]free)/i,
    /dial\s*\d/i,
    /speak\s*(to|with)\s*(a|our)\s*(technician|support|agent)/i,
    /\d{3}[- ]\d{3}[- ]\d{4}.*call/i,
    /call.*\d{3}[- ]\d{3}[- ]\d{4}/i
  ];
  
  for (const pattern of phonePromptPatterns) {
    if (pattern.test(content)) {
      hasPhoneCallPrompt = true;
      suspiciousPatterns.push('Prompts user to call a phone number');
    }
  }
  
  // Pop-up style indicators in HTML
  const popupIndicators = [
    'alert-box', 'warning-popup', 'virus-alert', 'security-warning',
    'fullscreen', 'modal-overlay', 'block-page'
  ];
  
  for (const indicator of popupIndicators) {
    if (html.toLowerCase().includes(indicator)) {
      suspiciousPatterns.push(`Contains popup/alert indicator: ${indicator}`);
    }
  }
  
  const isLikelySubscriptionScam = 
    (claimsAntivirusSoftware && hasUrgentRenewalMessage) ||
    (hasPhoneCallPrompt && (hasUrgentRenewalMessage || claimsAntivirusSoftware)) ||
    suspiciousPatterns.length >= 3;
  
  return {
    claimsAntivirusSoftware,
    mentionedBrands: [...new Set(mentionedBrands)],
    hasUrgentRenewalMessage,
    hasPhoneCallPrompt,
    isLikelySubscriptionScam,
    suspiciousPatterns
  };
}

// Enhanced business verification
function analyzeBusinessVerification(content: string, html: string): BusinessVerification {
  const contentLower = content.toLowerCase();
  
  // VAT/Tax number patterns by country
  const vatPatterns = [
    /vat\s*(?:number|no|#)?[:\s]*([A-Z]{2}\d{8,12})/i,  // EU VAT
    /tax\s*id[:\s]*(\d{2}-\d{7})/i,                       // US EIN
    /abn[:\s]*(\d{11})/i,                                 // Australia ABN
    /gst[:\s]*(\d+)/i                                     // GST numbers
  ];
  
  // Company registration patterns
  const companyRegPatterns = [
    /company\s*(?:number|no|reg)[:\s]*(\d+)/i,
    /registered\s*(?:company|business)[:\s#]*(\d+)/i,
    /registration\s*(?:number|no)[:\s]*(\d+)/i,
    /incorporated/i,
    /ltd\b|llc\b|inc\b|corp\b|gmbh\b|pty\b/i
  ];
  
  let hasVATNumber = false;
  let hasCompanyRegNumber = false;
  let hasDUNS = false;
  let hasPhysicalStore = false;
  
  for (const pattern of vatPatterns) {
    if (pattern.test(content)) {
      hasVATNumber = true;
      break;
    }
  }
  
  for (const pattern of companyRegPatterns) {
    if (pattern.test(content)) {
      hasCompanyRegNumber = true;
      break;
    }
  }
  
  // Check for DUNS number
  if (/duns\s*(?:number)?[:\s]*\d{9}/i.test(content)) {
    hasDUNS = true;
  }
  
  // Check for physical store indicators
  const physicalStoreIndicators = [
    'visit our store', 'our showroom', 'walk-in', 'store hours',
    'store locations', 'find a store', 'retail location', 'brick and mortar'
  ];
  
  for (const indicator of physicalStoreIndicators) {
    if (contentLower.includes(indicator)) {
      hasPhysicalStore = true;
      break;
    }
  }
  
  // Detect claimed vs actual country
  const countryIndicators: Record<string, string[]> = {
    'USA': ['united states', 'u.s.', 'usa', 'america', 'california', 'new york', 'texas', 'florida'],
    'UK': ['united kingdom', 'uk', 'england', 'london', 'britain', 'british'],
    'Canada': ['canada', 'canadian', 'toronto', 'vancouver'],
    'Australia': ['australia', 'australian', 'sydney', 'melbourne'],
    'China': ['china', 'chinese', 'shenzhen', 'guangzhou', 'shanghai'],
    'India': ['india', 'indian', 'mumbai', 'delhi', 'bangalore']
  };
  
  let claimedCountry: string | undefined;
  let actualIndicatedCountry: string | undefined;
  
  // Check about/contact sections for claimed location
  for (const [country, indicators] of Object.entries(countryIndicators)) {
    for (const indicator of indicators) {
      if (contentLower.includes(indicator)) {
        if (!claimedCountry) claimedCountry = country;
        actualIndicatedCountry = country;
      }
    }
  }
  
  // Check for overseas shipping indicators that might reveal true location
  const overseasIndicators = [
    { text: 'ships from china', country: 'China' },
    { text: 'warehouse in shenzhen', country: 'China' },
    { text: 'shipping from asia', country: 'China' },
    { text: '15-30 business days', country: 'China' },
    { text: '7-21 days delivery', country: 'China' }
  ];
  
  for (const indicator of overseasIndicators) {
    if (contentLower.includes(indicator.text)) {
      actualIndicatedCountry = indicator.country;
    }
  }
  
  const countriesMismatch = claimedCountry !== undefined && 
    actualIndicatedCountry !== undefined && 
    claimedCountry !== actualIndicatedCountry;
  
  return {
    hasVATNumber,
    hasCompanyRegNumber,
    hasDUNS,
    hasPhysicalStore,
    claimedCountry,
    actualIndicatedCountry,
    countriesMismatch
  };
}

// Check for GDPR/Cookie compliance (legitimacy indicator)
function analyzeComplianceIndicators(content: string, html: string): {
  hasCookieNotice: boolean;
  hasGDPRMention: boolean;
  hasCCPAMention: boolean;
  hasAccessibilityStatement: boolean;
  complianceScore: number;
} {
  const contentLower = content.toLowerCase();
  const htmlLower = html.toLowerCase();
  
  const hasCookieNotice = 
    contentLower.includes('cookie') && (
      contentLower.includes('accept') || 
      contentLower.includes('consent') ||
      contentLower.includes('policy')
    ) ||
    htmlLower.includes('cookie-consent') ||
    htmlLower.includes('cookie-notice') ||
    htmlLower.includes('cookiebot') ||
    htmlLower.includes('onetrust');
    
  const hasGDPRMention = 
    contentLower.includes('gdpr') ||
    contentLower.includes('general data protection') ||
    contentLower.includes('data protection officer');
    
  const hasCCPAMention = 
    contentLower.includes('ccpa') ||
    contentLower.includes('california consumer privacy') ||
    contentLower.includes('do not sell my');
    
  const hasAccessibilityStatement = 
    contentLower.includes('accessibility') ||
    contentLower.includes('wcag') ||
    contentLower.includes('ada compliance');
  
  let complianceScore = 0;
  if (hasCookieNotice) complianceScore += 25;
  if (hasGDPRMention) complianceScore += 25;
  if (hasCCPAMention) complianceScore += 25;
  if (hasAccessibilityStatement) complianceScore += 25;
  
  return {
    hasCookieNotice,
    hasGDPRMention,
    hasCCPAMention,
    hasAccessibilityStatement,
    complianceScore
  };
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

// Check for suspicious contact info and extract address/phone for validation
function analyzeContactInfo(content: string, links: string[]): { 
  hasProfessionalEmail: boolean; 
  hasPhoneNumber: boolean;
  hasGenericEmail: boolean;
  emailDomain?: string;
  hasPhysicalAddress: boolean;
  extractedAddresses: string[];
  extractedPhones: string[];
  addressAnalysis: {
    found: boolean;
    looksLegitimate: boolean;
    isPoBox: boolean;
    hasStreetNumber: boolean;
    hasCity: boolean;
    hasStateOrCountry: boolean;
    hasPostalCode: boolean;
    suspiciousPatterns: string[];
  };
  phoneAnalysis: {
    found: boolean;
    looksLegitimate: boolean;
    hasCountryCode: boolean;
    isValidFormat: boolean;
    suspiciousPatterns: string[];
  };
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
  
  // Enhanced phone number extraction
  const phonePatterns = [
    /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, // US/Canada
    /(?:\+44[-.\s]?)?\d{4}[-.\s]?\d{6}/g, // UK
    /(?:\+61[-.\s]?)?\d{1}[-.\s]?\d{4}[-.\s]?\d{4}/g, // Australia
    /(?:\+\d{1,3}[-.\s]?)?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g, // International
  ];
  
  const extractedPhones: string[] = [];
  for (const pattern of phonePatterns) {
    const matches = content.match(pattern) || [];
    for (const match of matches) {
      const cleaned = match.replace(/[^\d+]/g, '');
      if (cleaned.length >= 10 && cleaned.length <= 15 && !extractedPhones.includes(match)) {
        extractedPhones.push(match.trim());
      }
    }
  }
  
  // Phone legitimacy analysis
  const phoneAnalysis = {
    found: extractedPhones.length > 0,
    looksLegitimate: false,
    hasCountryCode: false,
    isValidFormat: false,
    suspiciousPatterns: [] as string[]
  };
  
  if (extractedPhones.length > 0) {
    const firstPhone = extractedPhones[0];
    phoneAnalysis.hasCountryCode = /^\+\d/.test(firstPhone);
    phoneAnalysis.isValidFormat = /^[\d\s\-\(\)\+\.]+$/.test(firstPhone);
    
    // Check for suspicious phone patterns
    const digitsOnly = firstPhone.replace(/\D/g, '');
    if (/^(\d)\1{6,}$/.test(digitsOnly)) {
      phoneAnalysis.suspiciousPatterns.push('Repeating digits pattern');
    }
    if (/^(123|234|345|456|567|678|789)/.test(digitsOnly)) {
      phoneAnalysis.suspiciousPatterns.push('Sequential number pattern');
    }
    if (digitsOnly === '0000000000' || digitsOnly === '1111111111') {
      phoneAnalysis.suspiciousPatterns.push('Placeholder number detected');
    }
    
    phoneAnalysis.looksLegitimate = phoneAnalysis.isValidFormat && phoneAnalysis.suspiciousPatterns.length === 0;
  }
  
  // Enhanced address extraction
  const addressPatterns = [
    // Full address patterns
    /\d{1,5}\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct|place|pl|circle|cir)[\s,]+[\w\s]+,?\s*(?:[A-Z]{2})?\s*\d{5}(?:-\d{4})?/gi,
    // Street address
    /\d{1,5}\s+[\w\s]{2,30}(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct|place|pl|circle|cir)/gi,
    // PO Box
    /p\.?o\.?\s*box\s*\d+/gi,
    // UK postcodes with address
    /[\w\s]+,?\s*[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}/gi,
    // Generic with city, state, zip
    /[\w\s]+,\s*[\w\s]+,?\s*[A-Z]{2}\s*\d{5}/gi,
  ];
  
  const extractedAddresses: string[] = [];
  for (const pattern of addressPatterns) {
    const matches = content.match(pattern) || [];
    for (const match of matches) {
      const cleaned = match.trim();
      if (cleaned.length > 10 && cleaned.length < 200 && !extractedAddresses.includes(cleaned)) {
        extractedAddresses.push(cleaned);
      }
    }
  }
  
  // Address legitimacy analysis
  const addressAnalysis = {
    found: extractedAddresses.length > 0,
    looksLegitimate: false,
    isPoBox: false,
    hasStreetNumber: false,
    hasCity: false,
    hasStateOrCountry: false,
    hasPostalCode: false,
    suspiciousPatterns: [] as string[]
  };
  
  if (extractedAddresses.length > 0) {
    const firstAddress = extractedAddresses[0].toLowerCase();
    
    addressAnalysis.isPoBox = /p\.?o\.?\s*box/i.test(firstAddress);
    addressAnalysis.hasStreetNumber = /^\d+\s/.test(firstAddress);
    addressAnalysis.hasCity = /,\s*[\w\s]+/.test(firstAddress);
    addressAnalysis.hasStateOrCountry = /[A-Z]{2}\s*\d{5}|[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}/i.test(extractedAddresses[0]);
    addressAnalysis.hasPostalCode = /\d{5}(-\d{4})?|[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}/i.test(extractedAddresses[0]);
    
    // Suspicious address patterns
    if (addressAnalysis.isPoBox) {
      addressAnalysis.suspiciousPatterns.push('PO Box instead of physical address');
    }
    if (/123\s*(main|test|fake)/i.test(firstAddress)) {
      addressAnalysis.suspiciousPatterns.push('Placeholder/fake address pattern');
    }
    if (/lorem|ipsum|example|test\s*address/i.test(firstAddress)) {
      addressAnalysis.suspiciousPatterns.push('Test/placeholder text in address');
    }
    if (!addressAnalysis.hasStreetNumber && !addressAnalysis.isPoBox) {
      addressAnalysis.suspiciousPatterns.push('Missing street number');
    }
    
    addressAnalysis.looksLegitimate = 
      !addressAnalysis.isPoBox && 
      addressAnalysis.hasStreetNumber && 
      addressAnalysis.suspiciousPatterns.length === 0 &&
      (addressAnalysis.hasCity || addressAnalysis.hasPostalCode);
  }
  
  return { 
    hasProfessionalEmail, 
    hasPhoneNumber: extractedPhones.length > 0, 
    hasGenericEmail, 
    emailDomain,
    hasPhysicalAddress: extractedAddresses.length > 0 && !addressAnalysis.isPoBox,
    extractedAddresses: extractedAddresses.slice(0, 3),
    extractedPhones: extractedPhones.slice(0, 3),
    addressAnalysis,
    phoneAnalysis
  };
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

    // Check cache first
    const urlHash = await hashUrl(formattedUrl);
    const cachedResult = await getCachedResult(urlHash);
    
    if (cachedResult) {
      console.log('Returning cached result');
      return new Response(
        JSON.stringify({ success: true, result: cachedResult, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Step 1: Scrape the website with Firecrawl - using all available formats
    const waitTime = platformInfo.isSocialMedia ? 5000 : 3000;
    
    console.log('Scraping website with Firecrawl (all formats)...');
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'html', 'links', 'screenshot', 'rawHtml'],
        onlyMainContent: false,
        waitFor: waitTime,
      }),
    });

    const scrapeData = await scrapeResponse.json();
    console.log('Scrape response status:', scrapeResponse.status);

    // Handle Firecrawl failure with fallback for known platforms
    let scrapedContent: ScrapedData;
    let usedFallback = false;
    
    if (!scrapeResponse.ok) {
      console.error('Firecrawl error:', scrapeData);
      
      // For known social media platforms, provide a fallback analysis
      if (platformInfo.isSocialMedia && platformInfo.platform) {
        console.log('Using fallback analysis for', platformInfo.platform);
        usedFallback = true;
        scrapedContent = {
          markdown: '',
          html: '',
          links: [],
          metadata: {
            title: `${platformInfo.platform} Profile/Page`,
            description: `Analysis of ${platformInfo.platform} URL`,
            sourceURL: formattedUrl,
          },
        };
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Could not access website: ${scrapeData.error || 'Unknown error'}` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      scrapedContent = scrapeData.data || scrapeData;
    }
    
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
    const priceComparison = analyzePriceComparison(markdown, html);
    
    // New enhanced analysis
    const governmentScamAnalysis = detectGovernmentScam(markdown, html, domain);
    const subscriptionScamAnalysis = detectSubscriptionScam(markdown, html, domain);
    const businessVerification = analyzeBusinessVerification(markdown, html);
    const complianceAnalysis = analyzeComplianceIndicators(markdown, html);
    
    // Run external API checks in parallel
    console.log('Running external security checks...');
    const [virusTotalResult, whoisResult] = await Promise.all([
      checkVirusTotal(domain),
      lookupWhois(domain),
    ]);
    
    console.log('Urgency tactics:', urgencyAnalysis);
    console.log('Contact info:', contactAnalysis);
    console.log('Payment methods:', paymentAnalysis);
    console.log('Scam patterns:', scamPatternAnalysis);
    console.log('Link analysis:', linkAnalysis);
    console.log('Price comparison:', priceComparison);
    console.log('Government scam detection:', governmentScamAnalysis);
    console.log('Subscription scam detection:', subscriptionScamAnalysis);
    console.log('Business verification:', businessVerification);
    console.log('Compliance indicators:', complianceAnalysis);
    console.log('VirusTotal:', virusTotalResult);
    console.log('WHOIS:', whoisResult);

    // Build enhanced context for AI
    const preAnalysisFindings = {
      typosquatting: typosquattingCheck,
      suspiciousTLD,
      urgencyTactics: urgencyAnalysis,
      contactInfo: contactAnalysis,
      paymentMethods: paymentAnalysis,
      scamPatterns: scamPatternAnalysis,
      linkAnalysis,
      priceComparison,
      virusTotal: virusTotalResult,
      whois: whoisResult,
      governmentScam: governmentScamAnalysis,
      subscriptionScam: subscriptionScamAnalysis,
      businessVerification,
      compliance: complianceAnalysis,
    };

    // Step 2: Analyze with AI - Enhanced prompt with pre-analysis findings
    const fallbackNotice = usedFallback 
      ? `\n\n⚠️ IMPORTANT: We could not scrape this ${platformInfo.platform} page directly due to platform restrictions. Provide analysis based on URL structure, platform knowledge, and general guidance for evaluating ${platformInfo.platform} profiles/pages. Be clear about limitations.`
      : '';
    
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

ADDRESS & PHONE VERIFICATION:
- Addresses Found: ${contactAnalysis.extractedAddresses.length > 0 ? contactAnalysis.extractedAddresses.join(' | ') : 'None detected'}
- Address Analysis: ${contactAnalysis.addressAnalysis.found ? 
    `Found=${contactAnalysis.addressAnalysis.found}, Legit=${contactAnalysis.addressAnalysis.looksLegitimate}, POBox=${contactAnalysis.addressAnalysis.isPoBox}, HasStreetNum=${contactAnalysis.addressAnalysis.hasStreetNumber}, HasCity=${contactAnalysis.addressAnalysis.hasCity}, HasPostal=${contactAnalysis.addressAnalysis.hasPostalCode}${contactAnalysis.addressAnalysis.suspiciousPatterns.length > 0 ? ', Issues: ' + contactAnalysis.addressAnalysis.suspiciousPatterns.join(', ') : ''}` 
    : 'No address found - MAJOR RED FLAG for business'}
- Phones Found: ${contactAnalysis.extractedPhones.length > 0 ? contactAnalysis.extractedPhones.join(' | ') : 'None detected'}
- Phone Analysis: ${contactAnalysis.phoneAnalysis.found ? 
    `Found=${contactAnalysis.phoneAnalysis.found}, Legit=${contactAnalysis.phoneAnalysis.looksLegitimate}, HasCountryCode=${contactAnalysis.phoneAnalysis.hasCountryCode}, ValidFormat=${contactAnalysis.phoneAnalysis.isValidFormat}${contactAnalysis.phoneAnalysis.suspiciousPatterns.length > 0 ? ', Issues: ' + contactAnalysis.phoneAnalysis.suspiciousPatterns.join(', ') : ''}` 
    : 'No phone number found'}

⚠️ GOVERNMENT IMPERSONATION SCAM DETECTION:
- Claims Government Affiliation: ${governmentScamAnalysis.claimsGovAffiliation ? `⚠️ YES - Mentions: ${governmentScamAnalysis.mentionedAgencies.join(', ')}` : 'No'}
- Uses Gov-Like Domain Terms: ${governmentScamAnalysis.usesGovLookalikeTerms ? '⚠️ YES - Domain mimics government' : 'No'}
- LIKELY GOVERNMENT SCAM: ${governmentScamAnalysis.isLikelyGovScam ? '🚨 HIGH RISK' : 'No indicators'}
${governmentScamAnalysis.suspiciousPatterns.length > 0 ? '- Suspicious Patterns: ' + governmentScamAnalysis.suspiciousPatterns.join(', ') : ''}

⚠️ SUBSCRIPTION/ANTIVIRUS SCAM DETECTION:
- Claims Antivirus/Software Brand: ${subscriptionScamAnalysis.claimsAntivirusSoftware ? `⚠️ YES - Mentions: ${subscriptionScamAnalysis.mentionedBrands.join(', ')}` : 'No'}
- Has Urgent Renewal Message: ${subscriptionScamAnalysis.hasUrgentRenewalMessage ? '⚠️ YES' : 'No'}
- Prompts Phone Call: ${subscriptionScamAnalysis.hasPhoneCallPrompt ? '🚨 MAJOR RED FLAG - Tech support scam indicator' : 'No'}
- LIKELY SUBSCRIPTION SCAM: ${subscriptionScamAnalysis.isLikelySubscriptionScam ? '🚨 HIGH RISK' : 'No indicators'}
${subscriptionScamAnalysis.suspiciousPatterns.length > 0 ? '- Suspicious Patterns: ' + subscriptionScamAnalysis.suspiciousPatterns.join(', ') : ''}

BUSINESS VERIFICATION DETAILS:
- Has VAT/Tax Number: ${businessVerification.hasVATNumber ? '✓ Yes' : 'No'}
- Has Company Registration: ${businessVerification.hasCompanyRegNumber ? '✓ Yes' : 'No'}
- Has Physical Store Location: ${businessVerification.hasPhysicalStore ? '✓ Yes' : 'No'}
- Claimed Country: ${businessVerification.claimedCountry || 'Unknown'}
- Indicated Country: ${businessVerification.actualIndicatedCountry || 'Unknown'}
- Country Mismatch: ${businessVerification.countriesMismatch ? '⚠️ Claims one country but indicators suggest another' : 'No mismatch'}

COMPLIANCE & LEGITIMACY INDICATORS:
- Cookie/GDPR Notice: ${complianceAnalysis.hasCookieNotice ? '✓ Yes' : 'No'}
- GDPR Mention: ${complianceAnalysis.hasGDPRMention ? '✓ Yes' : 'No'}
- CCPA Mention: ${complianceAnalysis.hasCCPAMention ? '✓ Yes' : 'No'}
- Accessibility Statement: ${complianceAnalysis.hasAccessibilityStatement ? '✓ Yes' : 'No'}
- Compliance Score: ${complianceAnalysis.complianceScore}/100 (higher = more legitimate business practices)

VIRUSTOTAL SECURITY SCAN (Pro Feature):
${virusTotalResult.error ? `- Status: ${virusTotalResult.error}` : `- Malicious Detections: ${virusTotalResult.maliciousCount}/${virusTotalResult.totalEngines} security engines
- Suspicious Detections: ${virusTotalResult.suspiciousCount}/${virusTotalResult.totalEngines} engines
- Reputation Score: ${virusTotalResult.reputationScore}
- Categories: ${virusTotalResult.categories.length > 0 ? virusTotalResult.categories.join(', ') : 'Uncategorized'}
${virusTotalResult.isMalicious ? '⚠️ WARNING: Domain flagged as MALICIOUS by security vendors!' : '✓ No malware/phishing detected'}`}

WHOIS DOMAIN HISTORY (Pro Feature):
${whoisResult.error ? `- Status: ${whoisResult.error}` : `- Domain Age: ${whoisResult.domainAge || 'Unknown'}${whoisResult.domainAgeInDays && whoisResult.domainAgeInDays < 90 ? ' ⚠️ VERY NEW DOMAIN - HIGH RISK' : whoisResult.domainAgeInDays && whoisResult.domainAgeInDays < 365 ? ' ⚠️ Domain less than 1 year old' : ''}
- Registrar: ${whoisResult.registrar || 'Unknown'}
- Created: ${whoisResult.createdDate || 'Unknown'}
- Expires: ${whoisResult.expiryDate || 'Unknown'}
- Registrant Country: ${whoisResult.registrant?.country || 'Unknown'}
- Privacy Protected: ${whoisResult.isPrivacyProtected ? 'Yes (identity hidden)' : 'No'}`}

PRICE COMPARISON ANALYSIS (Pro Feature):
- Products Analyzed: ${priceComparison.productsAnalyzed}
- Average Discount: ${priceComparison.averageDiscount}%${priceComparison.averageDiscount >= 60 ? ' ⚠️ SUSPICIOUSLY HIGH' : ''}
- Suspiciously Low Prices: ${priceComparison.suspiciouslyLowCount} items
- Market Position: ${priceComparison.marketPosition}
${priceComparison.redFlags.length > 0 ? '- Price Red Flags: ' + priceComparison.redFlags.join(', ') : ''}
${priceComparison.comparisonNotes.length > 0 ? '- Notes: ' + priceComparison.comparisonNotes.join(', ') : ''}
`;

    console.log('Analyzing with AI...');
    const analysisPrompt = `You are an expert website and social media legitimacy analyzer specializing in detecting scams, dropshippers, fake accounts, and fraudulent sellers. Analyze this URL thoroughly.${platformContext}${fallbackNotice}

Website URL: ${formattedUrl}
Domain: ${domain}
Page Title: ${metadata.title || 'Unknown'}
Page Description: ${metadata.description || 'Unknown'}
${preAnalysisContext}

${usedFallback ? `Note: Content could not be scraped. Provide guidance based on URL structure and platform knowledge.` : `Website Content (markdown):
${markdown.substring(0, 12000)}

HTML Structure Analysis (first 4000 chars):
${html.substring(0, 4000)}

Links found on page: ${links.slice(0, 50).join(', ')}`}

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
- Does the address include: street number, street name, city, state/region, postal code?
- Does the address look real (not "123 Main St" placeholder patterns)?
- Can you identify the actual business location/country from the address?
- Phone number present and in valid format?
- Does the phone have proper country code and area code?
- Is the phone a real-looking number (not 000-000-0000 or repeating digits)?
- Do the address and phone match the claimed country of operation?
- Business registration/company info mentioned?
- How long has this business likely been operating?
- Contact methods: professional email (not Gmail/Yahoo), phone, live chat?
- About page with real team/company info and photos?

## ADDRESS & PHONE LEGITIMACY (CRITICAL)
Evaluate the extracted address and phone information:
- Is there a complete physical street address (not just city/country)?
- Does the address format match the claimed country?
- Are there signs of fake addresses (123 Test St, Lorem Ipsum, etc.)?
- Is the phone number in a valid format for the claimed region?
- Do the phone area code and address location match geographically?
- For businesses claiming to be US-based: is there a US phone number and US address?
- Missing both address AND phone is a MAJOR red flag for any business

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
      "addressVerification": "<verified|suspicious|not_found|po_box|placeholder>",
      "extractedAddress": "<the address found or null>",
      "addressLegitimacyScore": "<legitimate|suspicious|fake|not_found>",
      "addressIssues": ["<issue1>", "<issue2>"],
      "hasPhoneNumber": <boolean>,
      "extractedPhone": "<the phone found or null>",
      "phoneLegitimacyScore": "<legitimate|suspicious|fake|not_found>",
      "phoneIssues": ["<issue1>", "<issue2>"],
      "contactInfoMatchesLocation": <boolean>,
      "businessAge": "<estimated years or 'unknown'>",
      "hasAboutPage": <boolean>,
      "hasPrivacyPolicy": <boolean>,
      "hasTerms": <boolean>,
      "hasReturnPolicy": <boolean>,
      "hasShippingInfo": <boolean>,
      "hasProfessionalEmail": <boolean>,
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
        
        // Initialize red flags array
        if (!analysisResult.details.redFlags) {
          analysisResult.details.redFlags = [];
        }
        if (!analysisResult.details.positiveSignals) {
          analysisResult.details.positiveSignals = [];
        }
        
        // Merge extracted address/phone into business details
        if (analysisResult.details.business) {
          analysisResult.details.business.extractedAddress = contactAnalysis.extractedAddresses[0] || null;
          analysisResult.details.business.extractedPhone = contactAnalysis.extractedPhones[0] || null;
          analysisResult.details.business.hasPhysicalAddress = contactAnalysis.hasPhysicalAddress;
          analysisResult.details.business.hasPhoneNumber = contactAnalysis.hasPhoneNumber;
        }
        
        // ==========================================
        // NEW DETERMINISTIC SCORING SYSTEM
        // Start at 100 and apply penalties/bonuses
        // ==========================================
        let trustScore = 100;
        const hasNoHttps = !formattedUrl.startsWith('https');
        const hasFakeAddress = contactAnalysis.addressAnalysis.suspiciousPatterns.length > 0;
        const hasCryptoWireOnly = paymentAnalysis.onlyAcceptsUnusualMethods && 
          (paymentAnalysis.acceptsCrypto || paymentAnalysis.methods.some((m: string) => 
            m.toLowerCase().includes('wire') || m.toLowerCase().includes('transfer') || m.toLowerCase().includes('bitcoin')
          ));
        
        // === DOMAIN & IDENTITY (20%) ===
        // Domain age < 6 months: -20
        if (whoisResult.domainAgeInDays && whoisResult.domainAgeInDays < 180) {
          trustScore -= 20;
          analysisResult.details.redFlags.push(`Domain is only ${whoisResult.domainAge} old - new domains are higher risk`);
        }
        
        // WHOIS hidden + new domain: -15
        if (whoisResult.isPrivacyProtected && whoisResult.domainAgeInDays && whoisResult.domainAgeInDays < 365) {
          trustScore -= 15;
          analysisResult.details.redFlags.push('WHOIS privacy enabled on a new domain');
        }
        
        // Country mismatch: -15
        if (businessVerification.countriesMismatch) {
          trustScore -= 15;
          analysisResult.details.redFlags.push(`Location mismatch: Claims to be in ${businessVerification.claimedCountry} but indicators suggest ${businessVerification.actualIndicatedCountry}`);
        }
        
        // Typosquatting detected: -25
        if (typosquattingCheck.isSuspicious) {
          trustScore -= 25;
          analysisResult.details.redFlags.push(`Domain appears to mimic "${typosquattingCheck.mimicking}"`);
        }
        
        // Suspicious TLD: -10
        if (suspiciousTLD) {
          trustScore -= 10;
          analysisResult.details.redFlags.push('Uses a commonly abused domain extension (.top, .xyz, .shop, etc)');
        }
        
        // === SECURITY (20%) ===
        // No HTTPS: -40
        if (hasNoHttps) {
          trustScore -= 40;
          analysisResult.details.redFlags.push('No HTTPS - connection is not secure');
        }
        
        // Invalid SSL / mismatch: -25 (from AI analysis)
        if (analysisResult.details.domain && !analysisResult.details.domain.ssl && formattedUrl.startsWith('https')) {
          trustScore -= 25;
          analysisResult.details.redFlags.push('SSL certificate issue detected');
        }
        
        // === REPUTATION (20%) ===
        // Government scam detected: -60
        if (governmentScamAnalysis.isLikelyGovScam) {
          trustScore -= 60;
          analysisResult.details.redFlags.push('🚨 GOVERNMENT IMPERSONATION SCAM - Claims to be from ' + governmentScamAnalysis.mentionedAgencies.join(', '));
          for (const pattern of governmentScamAnalysis.suspiciousPatterns.slice(0, 3)) {
            analysisResult.details.redFlags.push(pattern);
          }
        }
        
        // Tech support / subscription scam: -60
        if (subscriptionScamAnalysis.isLikelySubscriptionScam) {
          trustScore -= 60;
          analysisResult.details.redFlags.push('🚨 SUBSCRIPTION/TECH SUPPORT SCAM - Impersonates ' + subscriptionScamAnalysis.mentionedBrands.join(', '));
          if (subscriptionScamAnalysis.hasPhoneCallPrompt) {
            analysisResult.details.redFlags.push('🚨 TECH SUPPORT SCAM - Prompts you to call a phone number');
          }
          for (const pattern of subscriptionScamAnalysis.suspiciousPatterns.slice(0, 3)) {
            analysisResult.details.redFlags.push(pattern);
          }
        }
        
        // === BUSINESS TRANSPARENCY (15%) ===
        // No physical address: -20
        if (!contactAnalysis.hasPhysicalAddress) {
          trustScore -= 20;
          analysisResult.details.redFlags.push('No physical address found');
        } else if (contactAnalysis.addressAnalysis.suspiciousPatterns.length > 0) {
          // Address fake / residential mismatch: -15
          trustScore -= 15;
          for (const issue of contactAnalysis.addressAnalysis.suspiciousPatterns) {
            analysisResult.details.redFlags.push(`Address issue: ${issue}`);
          }
        } else if (contactAnalysis.addressAnalysis.isPoBox) {
          trustScore -= 10;
          analysisResult.details.redFlags.push('Uses PO Box instead of physical address');
        }
        
        // No phone number: -10
        if (!contactAnalysis.hasPhoneNumber) {
          trustScore -= 10;
          analysisResult.details.redFlags.push('No phone number found');
        } else if (contactAnalysis.phoneAnalysis.suspiciousPatterns.length > 0) {
          // Suspicious phone pattern: -10
          trustScore -= 10;
          for (const issue of contactAnalysis.phoneAnalysis.suspiciousPatterns) {
            analysisResult.details.redFlags.push(`Phone issue: ${issue}`);
          }
        }
        
        // Generic email only: -10
        if (contactAnalysis.hasGenericEmail && !contactAnalysis.hasProfessionalEmail) {
          trustScore -= 10;
          analysisResult.details.redFlags.push('Only uses generic email (Gmail/Yahoo) for business contact');
        }
        
        // === PAYMENT RISK (15%) ===
        // Crypto/wire only: -30
        if (hasCryptoWireOnly) {
          trustScore -= 30;
          analysisResult.details.redFlags.push('Only accepts cryptocurrency or wire transfer - no buyer protection');
        } else if (paymentAnalysis.onlyAcceptsUnusualMethods) {
          // Unusual payment methods only: -20
          trustScore -= 20;
          analysisResult.details.redFlags.push('Only accepts unusual payment methods');
        }
        
        // No refund policy: -15 (from AI analysis)
        if (analysisResult.details.business && !analysisResult.details.business.hasReturnPolicy) {
          trustScore -= 15;
          analysisResult.details.redFlags.push('No refund/return policy found');
        }
        
        // === BEHAVIORAL RED FLAGS (10%) ===
        // Countdown timers / fake urgency: -10
        if (scamPatternAnalysis.hasCountdownTimer || urgencyAnalysis.hasUrgencyTactics) {
          trustScore -= 10;
          analysisResult.details.redFlags.push('Uses countdown timers or fake urgency tactics');
        }
        
        // Fake trust badges: -10
        if (scamPatternAnalysis.suspiciousPatterns.includes('Possibly fake security badge')) {
          trustScore -= 10;
          analysisResult.details.redFlags.push('Possibly fake security/trust badges');
        }
        
        // URL shortener redirect: -10
        if (linkAnalysis.suspiciousRedirects) {
          trustScore -= 10;
          analysisResult.details.redFlags.push('Uses URL shorteners which may hide true destinations');
        }
        
        // Plagiarized content: -10 (from AI analysis websiteQuality)
        if (analysisResult.details.websiteQuality?.isTemplatedSite || scamPatternAnalysis.hasCloneIndicators) {
          trustScore -= 10;
          analysisResult.details.redFlags.push('Website appears to use cloned/templated content');
        }
        
        // Add remaining scam patterns as red flags
        for (const pattern of scamPatternAnalysis.suspiciousPatterns) {
          if (!analysisResult.details.redFlags.includes(pattern) && 
              pattern !== 'Possibly fake security badge') {
            analysisResult.details.redFlags.push(pattern);
          }
        }
        
        // === DOMAIN AGE MULTIPLIER ===
        // If domain age < 1 year: trustScore = trustScore * 0.85
        if (whoisResult.domainAgeInDays && whoisResult.domainAgeInDays < 365) {
          trustScore = Math.round(trustScore * 0.85);
          if (!analysisResult.details.redFlags.some((f: string) => f.includes('less than 1 year'))) {
            analysisResult.details.redFlags.push(`Domain is less than 1 year old (${whoisResult.domainAge})`);
          }
        }
        
        // === BONUSES ===
        // Valid business registration: +5
        if (businessVerification.hasVATNumber || businessVerification.hasCompanyRegNumber || businessVerification.hasDUNS) {
          trustScore += 5;
          analysisResult.details.positiveSignals.push('Valid business registration found');
        }
        
        // GDPR / cookie compliance: +5
        if (complianceAnalysis.hasGDPRMention || complianceAnalysis.hasCookieNotice) {
          trustScore += 5;
          if (complianceAnalysis.hasCookieNotice) {
            analysisResult.details.positiveSignals.push('Has cookie consent notice');
          }
          if (complianceAnalysis.hasGDPRMention) {
            analysisResult.details.positiveSignals.push('Mentions GDPR compliance');
          }
        }
        
        // Consistent branding & contact info: +5
        if (contactAnalysis.hasPhysicalAddress && contactAnalysis.hasPhoneNumber && contactAnalysis.hasProfessionalEmail) {
          trustScore += 5;
          analysisResult.details.positiveSignals.push('Consistent branding and contact information');
        }
        
        // High-quality independent reviews: +5
        if (linkAnalysis.hasExternalReviews && linkAnalysis.reviewPlatforms.length >= 2) {
          trustScore += 5;
          analysisResult.details.positiveSignals.push('Listed on external review platforms');
        }
        
        // === HARD CAPS - CRITICAL ISSUES ===
        // If any of these are true → MAX SCORE = 45
        const hasCriticalIssue = 
          hasNoHttps ||
          governmentScamAnalysis.isLikelyGovScam ||
          subscriptionScamAnalysis.isLikelySubscriptionScam ||
          hasCryptoWireOnly ||
          hasFakeAddress;
        
        if (hasCriticalIssue && trustScore > 45) {
          trustScore = 45;
        }
        
        // Clamp score to 0-100
        trustScore = Math.max(0, Math.min(100, trustScore));
        
        // === DETERMINE VERDICT ===
        // 85-100: Likely Legit (safe)
        // 60-84: Use Caution (caution)
        // 0-59: High Risk (danger)
        let verdict: 'safe' | 'caution' | 'danger';
        if (trustScore >= 85) {
          verdict = 'safe';
        } else if (trustScore >= 60) {
          verdict = 'caution';
        } else {
          verdict = 'danger';
        }
        
        // Apply the deterministic score and verdict
        analysisResult.trustScore = trustScore;
        analysisResult.verdict = verdict;
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

    // Add scam indicators for UI banners
    analysisResult.scamIndicators = {
      government: {
        isLikelyScam: governmentScamAnalysis.isLikelyGovScam,
        agencies: governmentScamAnalysis.mentionedAgencies,
        patterns: governmentScamAnalysis.suspiciousPatterns,
      },
      subscription: {
        isLikelyScam: subscriptionScamAnalysis.isLikelySubscriptionScam,
        brands: subscriptionScamAnalysis.mentionedBrands,
        hasPhonePrompt: subscriptionScamAnalysis.hasPhoneCallPrompt,
        patterns: subscriptionScamAnalysis.suspiciousPatterns,
      },
    };

    // Add Pro features data
    analysisResult.proFeatures = {
      virusTotal: {
        isMalicious: virusTotalResult.isMalicious,
        maliciousCount: virusTotalResult.maliciousCount,
        suspiciousCount: virusTotalResult.suspiciousCount,
        harmlessCount: virusTotalResult.harmlessCount,
        totalEngines: virusTotalResult.totalEngines,
        reputationScore: virusTotalResult.reputationScore,
        categories: virusTotalResult.categories,
        lastAnalysisDate: virusTotalResult.lastAnalysisDate,
        available: !virusTotalResult.error,
      },
      whois: {
        domainName: whoisResult.domainName,
        registrar: whoisResult.registrar,
        createdDate: whoisResult.createdDate,
        updatedDate: whoisResult.updatedDate,
        expiryDate: whoisResult.expiryDate,
        domainAge: whoisResult.domainAge,
        domainAgeInDays: whoisResult.domainAgeInDays,
        registrantCountry: whoisResult.registrant?.country,
        registrantOrg: whoisResult.registrant?.organization,
        nameServers: whoisResult.nameServers,
        isPrivacyProtected: whoisResult.isPrivacyProtected,
        available: !whoisResult.error,
      },
      priceComparison: {
        productsAnalyzed: priceComparison.productsAnalyzed,
        averageDiscount: priceComparison.averageDiscount,
        suspiciouslyLowCount: priceComparison.suspiciouslyLowCount,
        marketPosition: priceComparison.marketPosition,
        comparisonNotes: priceComparison.comparisonNotes,
        redFlags: priceComparison.redFlags,
      },
    };

    // Add VirusTotal red flags (already factored into score, just add to display)
    if (virusTotalResult.isMalicious) {
      analysisResult.details.redFlags = analysisResult.details.redFlags || [];
      if (!analysisResult.details.redFlags.some((f: string) => f.includes('MALWARE ALERT'))) {
        analysisResult.details.redFlags.push(`⚠️ MALWARE ALERT: ${virusTotalResult.maliciousCount} security vendors flagged this domain as malicious`);
        // Apply additional penalty for malware and enforce hard cap
        analysisResult.trustScore = Math.min(45, Math.max(0, analysisResult.trustScore - 40));
        analysisResult.verdict = 'danger';
      }
    }
    if (virusTotalResult.suspiciousCount > 2) {
      analysisResult.details.redFlags = analysisResult.details.redFlags || [];
      if (!analysisResult.details.redFlags.some((f: string) => f.includes('security vendors flagged this domain as suspicious'))) {
        analysisResult.details.redFlags.push(`${virusTotalResult.suspiciousCount} security vendors flagged this domain as suspicious`);
        // Scam warnings on 1 service: -20, ≥2 services: -40
        const penalty = virusTotalResult.suspiciousCount >= 2 ? 40 : 20;
        analysisResult.trustScore = Math.max(0, analysisResult.trustScore - penalty);
        // Recalculate verdict
        if (analysisResult.trustScore >= 85) analysisResult.verdict = 'safe';
        else if (analysisResult.trustScore >= 60) analysisResult.verdict = 'caution';
        else analysisResult.verdict = 'danger';
      }
    }

    // Add price comparison red flags (for display only, not scoring again)
    for (const flag of priceComparison.redFlags) {
      analysisResult.details.redFlags = analysisResult.details.redFlags || [];
      if (!analysisResult.details.redFlags.includes(flag)) {
        analysisResult.details.redFlags.push(flag);
      }
    }

    console.log('Analysis complete, trust score:', analysisResult.trustScore);

    // Cache the result for 24 hours
    await cacheResult(urlHash, formattedUrl, analysisResult);

    return new Response(
      JSON.stringify({ success: true, result: analysisResult, cached: false }),
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
