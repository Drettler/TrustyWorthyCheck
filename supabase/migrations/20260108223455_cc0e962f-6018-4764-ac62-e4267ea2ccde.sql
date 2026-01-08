-- Fix RLS for rate_limits table - deny all public access
-- The table should only be accessed via the check_rate_limit function which uses SECURITY DEFINER
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

-- Create policy that denies all access except through security definer functions
CREATE POLICY "Deny all direct access"
ON public.rate_limits
FOR ALL
TO public, anon, authenticated
USING (false)
WITH CHECK (false);

-- Service role bypasses RLS, so no explicit policy needed for it

-- Fix RLS for url_analysis_cache table - ensure no public reads
-- Check current state and add explicit deny policy
CREATE POLICY "Deny public read access"
ON public.url_analysis_cache
FOR SELECT
TO public, anon, authenticated
USING (false);