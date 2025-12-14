import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookSettings {
  sendName?: boolean;
  sendEmail?: boolean;
  sendPhone?: boolean;
  customFieldIds?: string;
  triggerOnFirstResponse?: boolean;
}

interface QuizWebhook {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  settings: WebhookSettings;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quiz_id, session_id, event_type, data } = await req.json();
    
    console.log(`[webhook] Received request for quiz: ${quiz_id}, event: ${event_type}`);

    // Create Supabase client with service role for accessing webhooks
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get quiz info
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('titulo, slug')
      .eq('id', quiz_id)
      .maybeSingle();

    if (quizError) {
      console.error('[webhook] Error fetching quiz:', quizError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch quiz configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all enabled webhooks for this quiz
    const { data: webhooks, error: webhooksError } = await supabase
      .from('quiz_webhooks')
      .select('*')
      .eq('quiz_id', quiz_id)
      .eq('enabled', true);

    if (webhooksError) {
      console.error('[webhook] Error fetching webhooks:', webhooksError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch webhooks' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!webhooks || webhooks.length === 0) {
      console.log('[webhook] No enabled webhooks for this quiz');
      return new Response(
        JSON.stringify({ message: 'No enabled webhooks' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[webhook] Found ${webhooks.length} enabled webhook(s)`);

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

    // Get responses if this is a completion event or trigger point
    let responses: any[] = [];
    if (session_id && (event_type === 'quiz_completed' || event_type === 'first_response' || event_type === 'trigger_point')) {
      const { data: respData } = await supabase
        .from('quiz_responses')
        .select('*')
        .eq('session_id', session_id)
        .order('stage_order');
      responses = respData || [];
    }

    const results: { webhookName: string; success: boolean; status?: number; error?: string }[] = [];

    // Trigger each webhook
    for (const webhook of webhooks) {
      const typedWebhook: QuizWebhook = {
        id: webhook.id,
        name: webhook.name,
        url: webhook.url,
        enabled: webhook.enabled,
        settings: (webhook.settings || {}) as WebhookSettings,
      };

      // Check if this event should trigger based on settings
      if (event_type === 'first_response' && !typedWebhook.settings.triggerOnFirstResponse) {
        console.log(`[webhook] First response trigger disabled for webhook: ${typedWebhook.name}`);
        results.push({ webhookName: typedWebhook.name, success: false, error: 'First response trigger disabled' });
        continue;
      }

      // Build filtered data based on settings
      const formData = data?.formData || {};
      const filteredData: Record<string, any> = {};

      // Add standard fields based on settings
      if (typedWebhook.settings.sendName !== false) {
        const name = formData.name || formData.nome || sessionData?.name;
        if (name) filteredData.name = name;
      }
      if (typedWebhook.settings.sendEmail !== false) {
        const email = formData.email || formData.e_mail || sessionData?.email;
        if (email) filteredData.email = email;
      }
      if (typedWebhook.settings.sendPhone !== false) {
        const phone = formData.phone || formData.telefone || formData.celular || sessionData?.phone;
        if (phone) filteredData.phone = phone;
      }

      // Add custom fields based on IDs
      if (typedWebhook.settings.customFieldIds) {
        const customIds = typedWebhook.settings.customFieldIds.split(',').map(id => id.trim()).filter(Boolean);
        for (const customId of customIds) {
          if (formData[customId] !== undefined) {
            filteredData[customId] = formData[customId];
          }
        }
      }

      // Prepare payload
      const webhookPayload = {
        event_type,
        timestamp: new Date().toISOString(),
        webhook_name: typedWebhook.name,
        quiz: {
          id: quiz_id,
          title: quiz?.titulo,
          slug: quiz?.slug,
        },
        session: sessionData ? {
          id: sessionData.id,
          started_at: sessionData.started_at,
          completed_at: sessionData.completed_at,
          device_type: sessionData.device_type,
          referrer: sessionData.referrer,
        } : null,
        data: filteredData,
        responses: responses,
      };

      console.log(`[webhook] Sending to ${typedWebhook.name}: ${typedWebhook.url}`);

      try {
        const webhookResponse = await fetch(typedWebhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });

        const responseText = await webhookResponse.text();
        console.log(`[webhook] ${typedWebhook.name} response status: ${webhookResponse.status}`);
        console.log(`[webhook] ${typedWebhook.name} response: ${responseText}`);

        results.push({ 
          webhookName: typedWebhook.name, 
          success: webhookResponse.ok, 
          status: webhookResponse.status 
        });
      } catch (fetchError) {
        const errorMsg = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
        console.error(`[webhook] Error calling ${typedWebhook.name}:`, errorMsg);
        results.push({ webhookName: typedWebhook.name, success: false, error: errorMsg });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Triggered ${results.filter(r => r.success).length}/${webhooks.length} webhooks`,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[webhook] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
