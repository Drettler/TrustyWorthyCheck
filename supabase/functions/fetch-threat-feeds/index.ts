import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Trusted threat feed sources
const THREAT_SOURCES = [
  {
    name: 'FTC Consumer Alerts',
    url: 'https://consumer.ftc.gov/consumer-alerts',
    type: 'government',
  },
  {
    name: 'FBI IC3 Alerts',
    url: 'https://www.ic3.gov/Media/Y2024/PSA240101',
    type: 'government',
  },
  {
    name: 'BBB Scam Tracker',
    url: 'https://www.bbb.org/scamtracker',
    type: 'nonprofit',
  },
  {
    name: 'CISA Alerts',
    url: 'https://www.cisa.gov/news-events/cybersecurity-advisories',
    type: 'government',
  },
  {
    name: 'Krebs on Security',
    url: 'https://krebsonsecurity.com/',
    type: 'blog',
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: any[] = [];

    // If Firecrawl is available, use it to scrape sources
    if (firecrawlKey) {
      for (const source of THREAT_SOURCES.slice(0, 2)) { // Limit to avoid rate limits
        try {
          console.log(`Fetching from ${source.name}...`);
          
          const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: source.url,
              formats: ['markdown', 'links'],
              onlyMainContent: true,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const markdown = data.data?.markdown || data.markdown || '';
            
            // Extract threat information from scraped content
            const threats = extractThreatsFromContent(markdown, source);
            results.push(...threats);
            
            // Update source fetch time
            await supabase
              .from('threat_feed_sources')
              .upsert({
                name: source.name,
                url: source.url,
                feed_type: source.type,
                last_fetched_at: new Date().toISOString(),
                status: 'active',
              }, { onConflict: 'name' });
          }
        } catch (error) {
          console.error(`Error fetching ${source.name}:`, error);
        }
      }
    }

    // Insert fetched threats
    if (results.length > 0) {
      const { error } = await supabase
        .from('threat_feeds')
        .insert(results);

      if (error) {
        console.error('Error inserting threats:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Fetched ${results.length} threat entries`,
        count: results.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching threat feeds:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch threat feeds' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Junk titles/descriptions that scrapers sometimes return when a source page
// is unavailable or behind a block. Filtering these protects the feed's credibility.
const JUNK_PATTERNS = [
  /page not found/i,
  /\b404\b/,
  /access denied/i,
  /not found/i,
  /forbidden/i,
  /are you a robot/i,
  /verify you are human/i,
  /enable javascript/i,
  /just a moment/i,
  /attention required/i,
  /cloudflare/i,
];

function isJunkEntry(title: string, description: string): boolean {
  const text = `${title} ${description}`.trim();
  if (!title || title.length < 8) return true;
  return JUNK_PATTERNS.some((re) => re.test(text));
}

function extractThreatsFromContent(content: string, source: { name: string; url: string; type: string }): any[] {
  const threats: any[] = [];

  const lines = content.split('\n').filter((line) => line.trim());

  let currentTitle = '';
  let currentDescription = '';

  const pushIfValid = () => {
    if (currentTitle && currentDescription && !isJunkEntry(currentTitle, currentDescription)) {
      threats.push(createThreatEntry(currentTitle, currentDescription, source));
    }
  };

  for (const line of lines) {
    if (line.startsWith('#')) {
      pushIfValid();
      currentTitle = line.replace(/^#+\s*/, '').trim();
      currentDescription = '';
    } else if (currentTitle && line.length > 50) {
      currentDescription += ' ' + line;
    }
  }

  pushIfValid();

  return threats.slice(0, 5); // Limit entries per source
}

function createThreatEntry(title: string, description: string, source: { name: string; url: string; type: string }) {
  // Determine threat type from content
  const lowerContent = (title + description).toLowerCase();
  let threatType = 'general';
  
  if (lowerContent.includes('phish')) threatType = 'phishing';
  else if (lowerContent.includes('scam') || lowerContent.includes('fraud')) threatType = 'scam';
  else if (lowerContent.includes('malware') || lowerContent.includes('virus')) threatType = 'malware';
  else if (lowerContent.includes('ransomware')) threatType = 'ransomware';
  else if (lowerContent.includes('identity') || lowerContent.includes('theft')) threatType = 'identity_theft';
  else if (lowerContent.includes('payment') || lowerContent.includes('card')) threatType = 'payment_fraud';
  
  // Determine severity
  let severity = 'medium';
  if (lowerContent.includes('urgent') || lowerContent.includes('critical') || lowerContent.includes('warning')) {
    severity = 'high';
  } else if (lowerContent.includes('awareness') || lowerContent.includes('tip')) {
    severity = 'low';
  }

  return {
    source: source.name,
    source_url: source.url,
    title: title.substring(0, 200),
    description: description.trim().substring(0, 500),
    threat_type: threatType,
    severity,
    published_at: new Date().toISOString(),
  };
}
