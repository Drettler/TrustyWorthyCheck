-- Fix honeypot_logs: The current policy uses USING (true) which allows everyone
-- Drop the problematic policy and recreate with proper restriction
DROP POLICY IF EXISTS "Service role full access" ON public.honeypot_logs;

-- Create proper service role policy for honeypot_logs
CREATE POLICY "Service role full access"
ON public.honeypot_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add explicit deny for public/anon on honeypot_logs
CREATE POLICY "Deny public read access"
ON public.honeypot_logs
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (false);

-- Add explicit deny for public/anon on threat_feeds
CREATE POLICY "Deny public read access"
ON public.threat_feeds
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (false);

-- Add explicit deny for public/anon on site_reports  
CREATE POLICY "Deny public read access"
ON public.site_reports
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (false);

-- Add explicit deny for public/anon on threat_feed_sources
CREATE POLICY "Deny public read access"
ON public.threat_feed_sources
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (false);