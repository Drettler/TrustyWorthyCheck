-- Drop the existing public read policy
DROP POLICY IF EXISTS "Anyone can view threat feeds" ON public.threat_feeds;

-- Create new policy that only allows authenticated users to read
CREATE POLICY "Authenticated users can view threat feeds" 
ON public.threat_feeds 
FOR SELECT 
TO authenticated
USING (true);