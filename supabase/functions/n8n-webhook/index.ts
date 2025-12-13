import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quiz_id, session_id, event_type, data } = await req.json();
    
    console.log(`[n8n-webhook] Received request for quiz: ${quiz_id}, event: ${event_type}`);

    // Create Supabase client with service role for accessing webhook_url
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get quiz webhook configuration
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('webhook_url, webhook_enabled, titulo, slug')
      .eq('id', quiz_id)
      .maybeSingle();

    if (quizError) {
      console.error('[n8n-webhook] Error fetching quiz:', quizError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch quiz configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!quiz || !quiz.webhook_enabled || !quiz.webhook_url) {
      console.log('[n8n-webhook] Webhook not configured or disabled for this quiz');
      return new Response(
        JSON.stringify({ message: 'Webhook not configured or disabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get session data if provided
    let sessionData = null;
    if (session_id) {
      const { data: session } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('id', session_id)
        .maybeSingle();
      sessionData = session;
    }

    // Get responses if this is a completion event
    let responses = [];
    if (session_id && event_type === 'quiz_completed') {
      const { data: respData } = await supabase
        .from('quiz_responses')
        .select('*')
        .eq('session_id', session_id)
        .order('stage_order');
      responses = respData || [];
    }

    // Prepare payload for N8N
    const webhookPayload = {
      event_type,
      timestamp: new Date().toISOString(),
      quiz: {
        id: quiz_id,
        title: quiz.titulo,
        slug: quiz.slug,
      },
      session: sessionData,
      responses: responses,
      custom_data: data || {},
    };

    console.log('[n8n-webhook] Sending to N8N:', quiz.webhook_url);

    // Call N8N webhook
    const webhookResponse = await fetch(quiz.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    const responseText = await webhookResponse.text();
    console.log('[n8n-webhook] N8N response status:', webhookResponse.status);
    console.log('[n8n-webhook] N8N response:', responseText);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook triggered successfully',
        n8n_status: webhookResponse.status 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[n8n-webhook] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
