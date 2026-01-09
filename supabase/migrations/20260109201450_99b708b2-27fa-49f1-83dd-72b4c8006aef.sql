-- Add explicit restrictive policy to deny public read access to honeypot_logs
CREATE POLICY "Deny public read access"
ON public.honeypot_logs
AS RESTRICTIVE
FOR SELECT
USING (false);