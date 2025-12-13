import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WebhookTriggerRendererProps {
  component: {
    id: string;
    config?: Record<string, any>;
  };
  quizId: string | undefined;
  sessionId: string | null;
  formData: Record<string, any>;
}

export function WebhookTriggerRenderer({ 
  component, 
  quizId, 
  sessionId, 
  formData 
}: WebhookTriggerRendererProps) {
  const hasTriggered = useRef(false);
  const config = component.config || {};

  useEffect(() => {
    const triggerWebhook = async () => {
      // Only trigger once and if active
      if (hasTriggered.current || config.webhookActive === false || !quizId) {
        return;
      }

      hasTriggered.current = true;

      try {
        console.log('[WebhookTrigger] Triggering webhook for quiz:', quizId);
        
        await supabase.functions.invoke('n8n-webhook', {
          body: {
            quiz_id: quizId,
            session_id: sessionId,
            event_type: 'trigger_point',
            data: { 
              formData,
              trigger_description: config.webhookDescription || 'Webhook Trigger Point',
            },
          },
        });

        console.log('[WebhookTrigger] Webhook triggered successfully');
      } catch (error) {
        console.error('[WebhookTrigger] Error triggering webhook:', error);
      }
    };

    triggerWebhook();
  }, [quizId, sessionId, formData, config.webhookActive, config.webhookDescription]);

  // This component is invisible - it just triggers the webhook
  return null;
}