import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, reasons, details, trustScore } = await req.json();

    // Validate required fields
    if (!url || !reasons || !Array.isArray(reasons) || reasons.length === 0) {
      return new Response(
        JSON.stringify({ error: 'URL and at least one reason are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract domain from URL
    let domain: string;
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = urlObj.hostname.replace(/^www\./, '');
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for bypassing RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if domain already exists
    const { data: existing } = await supabase
      .from('site_reports')
      .select('id, reasons, report_count')
      .eq('url_domain', domain)
      .maybeSingle();

    if (existing) {
      // Update existing report - merge reasons and increment count
      const mergedReasons = [...new Set([...existing.reasons, ...reasons])];
      
      const { error: updateError } = await supabase
        .from('site_reports')
        .update({
          reasons: mergedReasons,
          report_count: existing.report_count + 1,
          last_reported_at: new Date().toISOString(),
          details: details || undefined,
          trust_score: trustScore || undefined,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }
    } else {
      // Insert new report
      const { error: insertError } = await supabase
        .from('site_reports')
        .insert({
          url,
          url_domain: domain,
          reasons,
          details: details || null,
          trust_score: trustScore || null,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Report submitted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error submitting report:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to submit report' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
