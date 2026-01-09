import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Rate limits per 24 hours
export const RATE_LIMITS = {
  anonymous: 3,      // Anonymous users: 3 checks per day
  authenticated: 20, // Logged-in users: 20 checks per day
  paid: 100,         // Paid users: 100 checks per day (future)
};

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  remaining: number;
  resetAt: string;
  isAuthenticated: boolean;
  userId?: string;
}

export async function checkRateLimit(
  req: Request,
  functionName: string
): Promise<RateLimitResult> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Try to get authenticated user
  let userId: string | undefined;
  let isAuthenticated = false;
  const authHeader = req.headers.get("Authorization");
  
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    try {
      const { data: userData, error } = await supabase.auth.getUser(token);
      if (!error && userData.user) {
        userId = userData.user.id;
        isAuthenticated = true;
      }
    } catch (e) {
      // Token invalid, treat as anonymous
      console.log("Auth token validation failed:", e);
    }
  }

  // Determine identifier and limit
  let identifier: string;
  let identifierType: "ip" | "user" | "client";
  let maxRequests: number;

  if (isAuthenticated && userId) {
    identifier = userId;
    identifierType = "user";
    maxRequests = RATE_LIMITS.authenticated;
  } else {
    // Prefer a browser-stable client id to avoid NAT/shared-IP collisions.
    // (The web app sends this as `x-client-id`.)
    const clientId = req.headers.get("x-client-id")?.trim();

    if (clientId) {
      identifier = clientId;
      identifierType = "client";
    } else {
      // Fallback to IP for anonymous users
      identifier =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("cf-connecting-ip") ||
        req.headers.get("x-real-ip") ||
        "unknown";
      identifierType = "ip";
    }

    maxRequests = RATE_LIMITS.anonymous;
  }

  console.log(`[RATE-LIMIT] Checking ${identifierType}: ${identifier.substring(0, 20)}... for ${functionName}, max: ${maxRequests}`);

  // Call the rate limit check function
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_identifier: identifier,
    p_identifier_type: identifierType,
    p_function_name: functionName,
    p_max_requests: maxRequests,
    p_window_hours: 24,
  });

  if (error) {
    console.error("[RATE-LIMIT] Error checking rate limit:", error);
    // On error, allow the request but log it
    return {
      allowed: true,
      currentCount: 0,
      remaining: maxRequests,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isAuthenticated,
      userId,
    };
  }

  const result = data?.[0];
  if (!result) {
    // No result, allow request
    return {
      allowed: true,
      currentCount: 0,
      remaining: maxRequests,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isAuthenticated,
      userId,
    };
  }

  console.log(`[RATE-LIMIT] Result: allowed=${result.allowed}, count=${result.current_count}/${maxRequests}, remaining=${result.remaining}`);

  return {
    allowed: result.allowed,
    currentCount: result.current_count,
    remaining: result.remaining,
    resetAt: result.reset_at,
    isAuthenticated,
    userId,
  };
}

export function rateLimitResponse(result: RateLimitResult, corsHeaders: Record<string, string>) {
  const message = result.isAuthenticated
    ? `Rate limit exceeded. You've used ${result.currentCount} of your ${RATE_LIMITS.authenticated} daily checks. Resets at ${new Date(result.resetAt).toLocaleString()}.`
    : `Rate limit exceeded. Anonymous users get ${RATE_LIMITS.anonymous} free checks per day. Sign up for more! Resets at ${new Date(result.resetAt).toLocaleString()}.`;

  return new Response(
    JSON.stringify({
      success: false,
      error: "rate_limit_exceeded",
      message,
      remaining: result.remaining,
      resetAt: result.resetAt,
      isAuthenticated: result.isAuthenticated,
      limit: result.isAuthenticated ? RATE_LIMITS.authenticated : RATE_LIMITS.anonymous,
    }),
    {
      // Return 200 so the web client can handle the structured JSON payload without surfacing
      // a hard "Edge function returned 429" runtime error.
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-RateLimit-Limit": String(result.isAuthenticated ? RATE_LIMITS.authenticated : RATE_LIMITS.anonymous),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": result.resetAt,
      },
    }
  );
}
