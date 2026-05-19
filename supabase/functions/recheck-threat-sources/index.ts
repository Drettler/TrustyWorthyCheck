// Re-scrapes threat feed sources that previously returned junk/filtered content
// and only re-adds entries that pass the junk + credibility checks.
//
// This runs on a separate, slower schedule from the main fetch-threat-feeds job
// so that sources which were temporarily blocked, rate-limited, or returning
// 404/Cloudflare interstitials get a second chance — without ever letting low
// quality entries back into the public feed.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// All known sources we want to keep retrying, including any that have
// previously been filtered out for returning junk.
const THREAT_SOURCES = [
  { name: "FTC Consumer Alerts", url: "https://consumer.ftc.gov/consumer-alerts", type: "government" },
  { name: "FBI IC3 Alerts", url: "https://www.ic3.gov/Media/Y2024/PSA240101", type: "government" },
  { name: "BBB Scam Tracker", url: "https://www.bbb.org/scamtracker", type: "nonprofit" },
  { name: "CISA Alerts", url: "https://www.cisa.gov/news-events/cybersecurity-advisories", type: "government" },
  { name: "Krebs on Security", url: "https://krebsonsecurity.com/", type: "blog" },
];

// Same junk detection used by fetch-threat-feeds + public-threats.
const JUNK_PATTERNS = [
  /page not found/i,
  /\b404\b/,
  /access denied/i,
  /^not found$/i,
  /forbidden/i,
  /are you a robot/i,
  /verify you are human/i,
  /enable javascript/i,
  /just a moment/i,
  /attention required/i,
  /cloudflare/i,
  /sign in to continue/i,
  /captcha/i,
];

// Credibility signals — at least one must appear for an entry to qualify.
const CREDIBILITY_KEYWORDS = [
  "scam", "fraud", "phish", "malware", "ransomware", "breach", "alert",
  "warning", "advisory", "vulnerab", "attack", "identity theft", "fake",
  "spoof", "impersonat", "data leak", "exploit", "compromise",
];

function isJunkEntry(title: string, description: string): boolean {
  const text = `${title} ${description}`.trim();
  if (!title || title.length < 8) return true;
  return JUNK_PATTERNS.some((re) => re.test(text));
}

function isCredible(title: string, description: string): boolean {
  // Require a meaningful description and at least one credibility keyword.
  if (!description || description.trim().length < 60) return false;
  const text = `${title} ${description}`.toLowerCase();
  return CREDIBILITY_KEYWORDS.some((kw) => text.includes(kw));
}

function classifyThreat(title: string, description: string) {
  const lower = (title + " " + description).toLowerCase();
  let threatType = "general";
  if (lower.includes("phish")) threatType = "phishing";
  else if (lower.includes("scam") || lower.includes("fraud")) threatType = "scam";
  else if (lower.includes("ransomware")) threatType = "ransomware";
  else if (lower.includes("malware") || lower.includes("virus")) threatType = "malware";
  else if (lower.includes("identity") || lower.includes("theft")) threatType = "identity_theft";
  else if (lower.includes("payment") || lower.includes("card")) threatType = "payment_fraud";

  let severity = "medium";
  if (lower.includes("urgent") || lower.includes("critical") || lower.includes("warning")) severity = "high";
  else if (lower.includes("awareness") || lower.includes("tip")) severity = "low";

  return { threatType, severity };
}

function extractCandidates(markdown: string, source: { name: string; url: string; type: string }) {
  const lines = markdown.split("\n").filter((l) => l.trim());
  const candidates: { title: string; description: string }[] = [];
  let title = "";
  let description = "";

  const flush = () => {
    if (title) candidates.push({ title: title.trim(), description: description.trim() });
  };

  for (const line of lines) {
    if (line.startsWith("#")) {
      flush();
      title = line.replace(/^#+\s*/, "").trim();
      description = "";
    } else if (title && line.length > 50) {
      description += " " + line;
    }
  }
  flush();

  return candidates
    .filter((c) => !isJunkEntry(c.title, c.description))
    .filter((c) => isCredible(c.title, c.description))
    .slice(0, 5)
    .map((c) => {
      const { threatType, severity } = classifyThreat(c.title, c.description);
      return {
        source: source.name,
        source_url: source.url,
        title: c.title.substring(0, 200),
        description: c.description.substring(0, 500),
        threat_type: threatType,
        severity,
        published_at: new Date().toISOString(),
      };
    });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Pull existing titles per source so we don't re-insert duplicates.
    const { data: existing } = await supabase
      .from("threat_feeds")
      .select("source, title")
      .gte("created_at", new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString());

    const seen = new Set((existing ?? []).map((r) => `${r.source}::${r.title}`));

    const allNew: any[] = [];
    const report: { source: string; candidates: number; inserted: number; skipped: number }[] = [];

    for (const source of THREAT_SOURCES) {
      try {
        console.log(`[recheck] scraping ${source.name}`);
        const res = await scrapeWithRetry(source.url, firecrawlKey);

        if (!res || !res.ok) {
          console.warn(`[recheck] ${source.name} -> ${res?.status ?? "no-response"} after retries`);
          report.push({ source: source.name, candidates: 0, inserted: 0, skipped: 0 });
          continue;
        }


        const data = await res.json();
        const markdown = data.data?.markdown || data.markdown || "";
        const candidates = extractCandidates(markdown, source);

        let inserted = 0;
        let skipped = 0;
        for (const entry of candidates) {
          const key = `${entry.source}::${entry.title}`;
          if (seen.has(key)) {
            skipped++;
            continue;
          }
          seen.add(key);
          allNew.push(entry);
          inserted++;
        }

        await supabase.from("threat_feed_sources").upsert(
          {
            name: source.name,
            url: source.url,
            feed_type: source.type,
            last_fetched_at: new Date().toISOString(),
            status: inserted > 0 ? "active" : "filtered",
          },
          { onConflict: "name" },
        );

        report.push({ source: source.name, candidates: candidates.length, inserted, skipped });
      } catch (err) {
        console.error(`[recheck] error on ${source.name}:`, err);
        report.push({ source: source.name, candidates: 0, inserted: 0, skipped: 0 });
      }
    }

    if (allNew.length > 0) {
      const { error } = await supabase.from("threat_feeds").insert(allNew);
      if (error) console.error("[recheck] insert error:", error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted: allNew.length,
        report,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[recheck] unexpected error:", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
