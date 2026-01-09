-- Create table for threat feed entries
CREATE TABLE public.threat_feeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  source_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  threat_type TEXT NOT NULL,
  domains TEXT[],
  tactics TEXT[],
  severity TEXT DEFAULT 'medium',
  published_at TIMESTAMP WITH TIME ZONE,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Create index for sorting by recent
CREATE INDEX idx_threat_feeds_published ON public.threat_feeds(published_at DESC);
CREATE INDEX idx_threat_feeds_source ON public.threat_feeds(source);
CREATE INDEX idx_threat_feeds_type ON public.threat_feeds(threat_type);

-- Enable Row Level Security
ALTER TABLE public.threat_feeds ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view threat feeds" 
ON public.threat_feeds 
FOR SELECT 
USING (true);

-- Only service role can manage
CREATE POLICY "Service role can manage threat feeds" 
ON public.threat_feeds 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create table to track feed fetch status
CREATE TABLE public.threat_feed_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  feed_type TEXT NOT NULL,
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.threat_feed_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feed sources" 
ON public.threat_feed_sources 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage feed sources" 
ON public.threat_feed_sources 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');