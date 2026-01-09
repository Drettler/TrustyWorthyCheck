-- Drop the authenticated-only policy
DROP POLICY IF EXISTS "Authenticated users can view threat feeds" ON public.threat_feeds;

-- Restore public read access
CREATE POLICY "Anyone can view threat feeds" 
ON public.threat_feeds 
FOR SELECT 
USING (true);