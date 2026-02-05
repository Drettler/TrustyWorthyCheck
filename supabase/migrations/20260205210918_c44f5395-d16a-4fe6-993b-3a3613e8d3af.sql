-- Fix honeypot_logs: Tighten service role policy to explicitly check role
DROP POLICY IF EXISTS "Service role full access" ON public.honeypot_logs;
CREATE POLICY "Service role full access" ON public.honeypot_logs
  FOR ALL
  TO authenticated
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Fix rate_limits: Allow service role to manage rate limits (currently blocks everything)
DROP POLICY IF EXISTS "Deny all direct access" ON public.rate_limits;

-- Keep the deny for public/anon access
CREATE POLICY "Deny public access" ON public.rate_limits
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Allow service role to manage rate limits
CREATE POLICY "Service role can manage rate limits" ON public.rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix url_analysis_cache: Tighten to explicitly check service_role
DROP POLICY IF EXISTS "Only service role can manage cache" ON public.url_analysis_cache;
CREATE POLICY "Service role can manage cache" ON public.url_analysis_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Remove redundant SELECT policies (ALL policies already cover SELECT)
DROP POLICY IF EXISTS "Only service role can view reports" ON public.site_reports;
DROP POLICY IF EXISTS "Only service role can view threat feeds" ON public.threat_feeds;
DROP POLICY IF EXISTS "Only service role can view feed sources" ON public.threat_feed_sources;