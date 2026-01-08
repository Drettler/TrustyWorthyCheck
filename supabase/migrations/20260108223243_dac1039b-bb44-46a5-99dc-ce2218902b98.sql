-- Create rate_limits table to track API usage
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP address for anonymous, user_id for authenticated
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'user')),
  function_name TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (identifier, identifier_type, function_name)
);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Service role can manage all rate limits
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create index for fast lookups
CREATE INDEX idx_rate_limits_lookup ON public.rate_limits (identifier, identifier_type, function_name);
CREATE INDEX idx_rate_limits_window ON public.rate_limits (window_start);

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_function_name TEXT,
  p_max_requests INTEGER,
  p_window_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_count INTEGER,
  remaining INTEGER,
  reset_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record rate_limits%ROWTYPE;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_reset_at TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := now() - (p_window_hours || ' hours')::INTERVAL;
  
  -- Try to get existing record
  SELECT * INTO v_record
  FROM rate_limits
  WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND function_name = p_function_name;
  
  -- If no record or window expired, create/reset
  IF v_record IS NULL OR v_record.window_start < v_window_start THEN
    INSERT INTO rate_limits (identifier, identifier_type, function_name, request_count, window_start)
    VALUES (p_identifier, p_identifier_type, p_function_name, 1, now())
    ON CONFLICT (identifier, identifier_type, function_name)
    DO UPDATE SET request_count = 1, window_start = now(), updated_at = now()
    RETURNING * INTO v_record;
    
    v_reset_at := v_record.window_start + (p_window_hours || ' hours')::INTERVAL;
    RETURN QUERY SELECT true, 1, p_max_requests - 1, v_reset_at;
    RETURN;
  END IF;
  
  v_reset_at := v_record.window_start + (p_window_hours || ' hours')::INTERVAL;
  
  -- Check if over limit
  IF v_record.request_count >= p_max_requests THEN
    RETURN QUERY SELECT false, v_record.request_count, 0, v_reset_at;
    RETURN;
  END IF;
  
  -- Increment counter
  UPDATE rate_limits
  SET request_count = request_count + 1, updated_at = now()
  WHERE id = v_record.id
  RETURNING * INTO v_record;
  
  RETURN QUERY SELECT true, v_record.request_count, p_max_requests - v_record.request_count, v_reset_at;
END;
$$;