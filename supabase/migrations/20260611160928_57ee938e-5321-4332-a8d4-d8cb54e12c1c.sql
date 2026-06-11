
-- 1) Fix honeypot_logs service role policy: previously applied to {authenticated} which never satisfies auth.role()='service_role'.
DROP POLICY IF EXISTS "Service role full access" ON public.honeypot_logs;
CREATE POLICY "Service role full access"
  ON public.honeypot_logs
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2) Lock down the SECURITY DEFINER rate-limit helper so only backend (service_role) code can invoke it.
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, text, integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, text, integer, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, text, integer, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, text, integer, integer) TO service_role;
