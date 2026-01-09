-- Drop the public read policy that exposes infrastructure details
DROP POLICY IF EXISTS "Anyone can view feed sources" ON public.threat_feed_sources;

-- Create a restrictive policy - only service role can read infrastructure data
CREATE POLICY "Only service role can view feed sources"
ON public.threat_feed_sources
FOR SELECT
USING (auth.role() = 'service_role'::text);