-- Drop existing problematic policies
DROP POLICY IF EXISTS "Deny public read access" ON public.honeypot_logs;
DROP POLICY IF EXISTS "Only service role can manage honeypot logs" ON public.honeypot_logs;

-- Create proper PERMISSIVE policy for service role only
-- This allows ONLY the service_role to access the table (used by edge functions)
CREATE POLICY "Service role full access" 
ON public.honeypot_logs 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled (it already is, but confirm)
ALTER TABLE public.honeypot_logs ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner as well (extra security)
ALTER TABLE public.honeypot_logs FORCE ROW LEVEL SECURITY;