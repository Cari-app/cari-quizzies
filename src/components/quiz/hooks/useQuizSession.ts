import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseQuizSessionProps {
  quizId: string | null;
  formData: Record<string, any>;
}

interface UseQuizSessionReturn {
  sessionId: string | null;
  sessionToken: string | null;
  stageStartTime: number;
  setStageStartTime: (time: number) => void;
  saveStageResponse: (stageId: string, stageOrder: number, responseValue: any, responseType: string) => Promise<void>;
  markSessionComplete: () => Promise<void>;
}

export function useQuizSession({ quizId, formData }: UseQuizSessionProps): UseQuizSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
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
          .select('id, session_token')
          .single();

        if (error) {
          console.error('Error creating session:', error);
          return;
        }

        setSessionId(data.id);
        setSessionToken(data.session_token);
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

  // Mark session as completed using secure RPC function
  const markSessionComplete = useCallback(async () => {
    if (!sessionId || !sessionToken) return;

    try {
      // Extract identification data from formData
      const email = formData.email || formData.e_mail || null;
      const phone = formData.phone || formData.telefone || formData.celular || null;
      const name = formData.name || formData.nome || null;

      // Use the secure RPC function that validates session_token
      const { data: success, error } = await supabase.rpc('update_quiz_session', {
        _session_id: sessionId,
        _session_token: sessionToken,
        _email: email,
        _phone: phone,
        _name: name,
        _is_completed: true,
        _completed_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error updating session via RPC:', error);
      } else if (!success) {
        console.warn('Session update failed - token mismatch or session expired');
      }
    } catch (error) {
      console.error('Error marking session complete:', error);
    }
  }, [sessionId, sessionToken, formData]);

  return {
    sessionId,
    sessionToken,
    stageStartTime,
    setStageStartTime,
    saveStageResponse,
    markSessionComplete,
  };
}
