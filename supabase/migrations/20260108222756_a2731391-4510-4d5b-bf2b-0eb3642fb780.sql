-- Drop the existing service role policy
DROP POLICY IF EXISTS "Service role can manage cache" ON public.url_analysis_cache;

-- Create a more explicit policy that only allows service role
-- Service role bypasses RLS anyway, but this makes the intent clear
-- and removes the "true" condition warning
CREATE POLICY "Only service role can manage cache"
ON public.url_analysis_cache
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);