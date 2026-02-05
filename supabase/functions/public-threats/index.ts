import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-client-id",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

// Rate limit: 50 requests per hour per IP (generous for browsing, blocks aggressive scraping)
const THREATS_RATE_LIMIT = 50;
const RATE_LIMIT_WINDOW_HOURS = 1;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limiting - use IP or client ID
    const clientId = req.headers.get("x-client-id")?.trim();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    
    const identifier = clientId || ip;
    const identifierType = clientId ? "client" : "ip";

    const { data: rateLimitData, error: rateLimitError } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_function_name: "public-threats",
      p_max_requests: THREATS_RATE_LIMIT,
      p_window_hours: RATE_LIMIT_WINDOW_HOURS,
    });

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      // Continue on error, don't block
    } else if (rateLimitData?.[0] && !rateLimitData[0].allowed) {
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded", 
          message: "Too many requests. Please try again later.",
          resetAt: rateLimitData[0].reset_at,
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(THREATS_RATE_LIMIT),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitData[0].reset_at,
          } 
        }
      );
    }

    // Parse query params for pagination
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Fetch sanitized fields - no domains, tactics, or metadata
    // Include description and source for detail view
    const { data, error, count } = await supabase
      .from("threat_feeds")
      .select("id, title, description, source, severity, threat_type, published_at, created_at", { count: "exact" })
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch threats" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return sanitized data with pagination info
    const response = {
      threats: data?.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || null,
        source: item.source,
        severity: item.severity || "medium",
        type: item.threat_type,
        date: item.published_at || item.created_at,
      })) || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
