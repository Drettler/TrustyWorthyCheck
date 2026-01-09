-- Drop the public read policy that exposes threat intelligence
DROP POLICY IF EXISTS "Anyone can view threat feeds" ON public.threat_feeds;

-- Create a restrictive policy - only service role can read threat data
-- Edge functions use service role and can expose filtered data via API
CREATE POLICY "Only service role can view threat feeds"
ON public.threat_feeds
FOR SELECT
USING (auth.role() = 'service_role'::text);