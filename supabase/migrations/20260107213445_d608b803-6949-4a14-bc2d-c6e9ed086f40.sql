-- Create table for caching URL analysis results
CREATE TABLE public.url_analysis_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url_hash TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

-- Create index for fast lookups by URL hash
CREATE INDEX idx_url_analysis_cache_url_hash ON public.url_analysis_cache(url_hash);

-- Create index for cleanup of expired entries
CREATE INDEX idx_url_analysis_cache_expires_at ON public.url_analysis_cache(expires_at);

-- Enable RLS but allow public read/write for edge function access
ALTER TABLE public.url_analysis_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cached results (public data)
CREATE POLICY "Anyone can read cached results"
ON public.url_analysis_cache
FOR SELECT
USING (true);

-- Allow service role to insert/update/delete (edge functions use service role)
CREATE POLICY "Service role can manage cache"
ON public.url_analysis_cache
FOR ALL
USING (true)
WITH CHECK (true);