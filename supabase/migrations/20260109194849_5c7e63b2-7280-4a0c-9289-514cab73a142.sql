-- Drop the public read policy that exposes detailed threat data
DROP POLICY IF EXISTS "Anyone can view reports" ON public.site_reports;

-- Create a restrictive policy - only service role can read reports
-- Edge functions use service role and will return limited data to users
CREATE POLICY "Only service role can view reports"
ON public.site_reports
FOR SELECT
USING (auth.role() = 'service_role'::text);