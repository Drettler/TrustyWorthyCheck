-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Anyone can read cached results" ON public.url_analysis_cache;

-- The "Service role can manage cache" policy already allows backend functions to read/write
-- No additional policies needed since cache lookups happen in edge functions with service role