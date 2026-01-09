-- Create a table for site reports
CREATE TABLE public.site_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  url_domain TEXT NOT NULL,
  reasons TEXT[] NOT NULL,
  details TEXT,
  trust_score INTEGER,
  report_count INTEGER NOT NULL DEFAULT 1,
  first_reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on domain to aggregate reports
CREATE UNIQUE INDEX idx_site_reports_domain ON public.site_reports(url_domain);

-- Create index for sorting by recent reports
CREATE INDEX idx_site_reports_last_reported ON public.site_reports(last_reported_at DESC);

-- Create index for trending (most reported)
CREATE INDEX idx_site_reports_count ON public.site_reports(report_count DESC);

-- Enable Row Level Security
ALTER TABLE public.site_reports ENABLE ROW LEVEL SECURITY;

-- Allow public read access for the reports page
CREATE POLICY "Anyone can view reports" 
ON public.site_reports 
FOR SELECT 
USING (true);

-- Only allow inserts/updates via service role (edge function)
CREATE POLICY "Service role can manage reports" 
ON public.site_reports 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');