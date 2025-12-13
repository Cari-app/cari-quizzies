import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseQuizSessionProps {
  quizId: string | null;
  formData: Record<string, any>;
}

interface UseQuizSessionReturn {
  sessionId: string | null;
  stageStartTime: number;
  setStageStartTime: (time: number) => void;
  saveStageResponse: (stageId: string, stageOrder: number, responseValue: any, responseType: string) => Promise<void>;
  markSessionComplete: () => Promise<void>;
}

export function useQuizSession({ quizId, formData }: UseQuizSessionProps): UseQuizSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stageStartTime, setStageStartTime] = useState<number>(Date.now());

  // Create session when quiz loads
  useEffect(() => {
    const createSession = async () => {
      if (!quizId || sessionId) return;

      try {
        // Detect device type
        const userAgent = navigator.userAgent;
        let deviceType = 'desktop';
        if (/mobile/i.test(userAgent)) deviceType = 'mobile';
        else if (/tablet|ipad/i.test(userAgent)) deviceType = 'tablet';

        const { data, error } = await supabase
          .from('quiz_sessions')
          .insert({
            quiz_id: quizId,
            user_agent: userAgent,
            device_type: deviceType,
            referrer: document.referrer || null,
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating session:', error);
          return;
        }

        setSessionId(data.id);
        setStageStartTime(Date.now());
      } catch (error) {
        console.error('Error creating session:', error);
      }
    };

    createSession();
  }, [quizId, sessionId]);

  // Save response when navigating to a new stage
  const saveStageResponse = useCallback(async (
    stageId: string, 
    stageOrder: number, 
    responseValue: any, 
    responseType: string
  ) => {
    if (!sessionId) return;

    try {
      const timeSpent = Date.now() - stageStartTime;
      
      await supabase
        .from('quiz_responses')
        .insert({
          session_id: sessionId,
          stage_id: stageId,
          stage_order: stageOrder,
          response_value: responseValue,
          response_type: responseType,
          time_spent_ms: timeSpent,
        });

      // Reset stage start time for next stage
      setStageStartTime(Date.now());
    } catch (error) {
      console.error('Error saving response:', error);
    }
  }, [sessionId, stageStartTime]);

  // Mark session as completed
  const markSessionComplete = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Extract identification data from formData
      const email = formData.email || formData.e_mail || null;
      const phone = formData.phone || formData.telefone || formData.celular || null;
      const name = formData.name || formData.nome || null;

      await supabase
        .from('quiz_sessions')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          email,
          phone,
          name,
        })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error marking session complete:', error);
    }
  }, [sessionId, formData]);

  return {
    sessionId,
    stageStartTime,
    setStageStartTime,
    saveStageResponse,
    markSessionComplete,
  };
}
