import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.208.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hash IP addresses for privacy - uses SHA-256 with a salt
async function hashIp(ip: string): Promise<string> {
  const salt = Deno.env.get("SUPABASE_PROJECT_ID") || "honeypot-salt";
  const data = new TextEncoder().encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return encodeHex(new Uint8Array(hashBuffer)).slice(0, 16); // First 16 chars for readability
}

// Fake data to return - looks enticing to scrapers
const FAKE_RESPONSES: Record<string, unknown> = {
  "api-keys": {
    keys: [
      { id: "key_live_xxxx", name: "Production API Key", created: "2024-01-15" },
      { id: "key_test_yyyy", name: "Test API Key", created: "2024-02-20" },
    ],
    total: 2,
  },
  "admin/users": {
    users: [
      { id: 1, email: "admin@example.com", role: "admin", last_login: "2024-03-01" },
      { id: 2, email: "user@example.com", role: "user", last_login: "2024-03-10" },
    ],
    pagination: { page: 1, total: 2 },
  },
  "internal/config": {
    database_url: "postgresql://user:password@localhost:5432/db",
    redis_url: "redis://localhost:6379",
    secret_key: "sk_live_fake_key_for_honeypot_detection",
  },
  "v2/threats/export": {
    format: "csv",
    download_url: "/api/download/threats-full-export.csv",
    expires_in: 3600,
  },
  "debug/logs": {
    logs: [
      { timestamp: "2024-03-15T10:00:00Z", level: "info", message: "System started" },
      { timestamp: "2024-03-15T10:01:00Z", level: "warn", message: "High memory usage" },
    ],
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint") || "unknown";
    
    // Extract and hash IP for privacy
    const rawIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const hashedIp = await hashIp(rawIp);
    
    const userAgent = req.headers.get("user-agent") || null;
    const referer = req.headers.get("referer") || null;
    
    // Collect all headers (sanitized)
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      // Don't log auth tokens
      if (!key.toLowerCase().includes("authorization") && !key.toLowerCase().includes("cookie")) {
        headers[key] = value;
      }
    });

    // Parse query params
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      if (key !== "endpoint") {
        queryParams[key] = value;
      }
    });

    // Log the suspicious access attempt with hashed IP
    const { error: logError } = await supabase.from("honeypot_logs").insert({
      endpoint,
      ip_address: hashedIp, // Hashed for privacy
      user_agent: userAgent,
      referer: referer,
      headers,
      request_method: req.method,
      query_params: Object.keys(queryParams).length > 0 ? queryParams : null,
    });

    if (logError) {
      console.error("Failed to log honeypot access:", logError);
    } else {
      console.log(`[HONEYPOT] Logged suspicious access to /${endpoint} from ${hashedIp}`);
    }

    // Return fake data based on endpoint (delay slightly to seem more realistic)
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    const fakeData = FAKE_RESPONSES[endpoint] || {
      error: "Endpoint not found",
      available_endpoints: Object.keys(FAKE_RESPONSES),
    };

    return new Response(JSON.stringify(fakeData), {
      status: endpoint in FAKE_RESPONSES ? 200 : 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Honeypot error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
