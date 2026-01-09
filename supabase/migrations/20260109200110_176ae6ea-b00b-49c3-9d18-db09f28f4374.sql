-- Create table to log honeypot access attempts
CREATE TABLE public.honeypot_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referer TEXT,
  headers JSONB,
  request_method TEXT,
  query_params JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS - only service role can access
ALTER TABLE public.honeypot_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role can manage honeypot logs"
ON public.honeypot_logs
FOR ALL
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- Add index for querying by IP
CREATE INDEX idx_honeypot_logs_ip ON public.honeypot_logs(ip_address);
CREATE INDEX idx_honeypot_logs_created_at ON public.honeypot_logs(created_at DESC);