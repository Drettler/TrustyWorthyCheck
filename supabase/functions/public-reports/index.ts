import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-client-id",
};

// Rate limit: 30 requests per hour per IP
const REPORTS_RATE_LIMIT = 30;
const RATE_LIMIT_WINDOW_HOURS = 1;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limiting
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
      p_function_name: "public-reports",
      p_max_requests: REPORTS_RATE_LIMIT,
      p_window_hours: RATE_LIMIT_WINDOW_HOURS,
    });

    if (!rateLimitError && rateLimitData?.[0] && !rateLimitData[0].allowed) {
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded", 
          resetAt: rateLimitData[0].reset_at,
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Parse query params
    const url = new URL(req.url);
    const sortBy = url.searchParams.get("sort") || "recent";
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);

    // Fetch reports - only return safe fields (no detailed info that could help attackers)
    let query = supabase
      .from("site_reports")
      .select("id, url_domain, reasons, trust_score, report_count, first_reported_at, last_reported_at")
      .limit(limit);

    if (sortBy === "trending") {
      query = query.order("report_count", { ascending: false });
    } else {
      query = query.order("last_reported_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch reports" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return sanitized data - remove full URLs, only show domains
    const reports = data?.map((report) => ({
      id: report.id,
      domain: report.url_domain,
      reasons: report.reasons,
      trustScore: report.trust_score,
      reportCount: report.report_count,
      firstReportedAt: report.first_reported_at,
      lastReportedAt: report.last_reported_at,
    })) || [];

    return new Response(JSON.stringify({ reports, total: reports.length }), {
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
