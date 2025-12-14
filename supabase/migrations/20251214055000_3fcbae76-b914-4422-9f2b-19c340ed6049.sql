-- Create a SECURITY DEFINER function to safely update quiz sessions with token validation
CREATE OR REPLACE FUNCTION public.update_quiz_session(
  _session_id UUID,
  _session_token UUID,
  _email TEXT DEFAULT NULL,
  _phone TEXT DEFAULT NULL,
  _name TEXT DEFAULT NULL,
  _last_stage_index INTEGER DEFAULT NULL,
  _is_completed BOOLEAN DEFAULT NULL,
  _completed_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _existing_token UUID;
BEGIN
  -- Verify token matches and session is recent and not completed
  SELECT session_token INTO _existing_token
  FROM quiz_sessions
  WHERE id = _session_id
    AND started_at > (now() - interval '2 hours')
    AND (is_completed = false OR is_completed IS NULL);
  
  -- If no matching session or token mismatch, return false
  IF _existing_token IS NULL OR _existing_token != _session_token THEN
    RETURN false;
  END IF;
  
  -- Perform update with only provided fields
  UPDATE quiz_sessions
  SET 
    email = COALESCE(_email, email),
    phone = COALESCE(_phone, phone),
    name = COALESCE(_name, name),
    last_stage_index = COALESCE(_last_stage_index, last_stage_index),
    is_completed = COALESCE(_is_completed, is_completed),
    completed_at = COALESCE(_completed_at, completed_at)
  WHERE id = _session_id;
  
  RETURN true;
END;
$$;

-- Drop the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Sessões recentes e incompletas podem ser atualizadas" ON public.quiz_sessions;

-- Create a restrictive UPDATE policy - only quiz owners can update via direct queries
-- Anonymous users must use the update_quiz_session RPC function
CREATE POLICY "Donos podem atualizar sessões do quiz"
ON public.quiz_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM quizzes
    WHERE quizzes.id = quiz_sessions.quiz_id
    AND quizzes.criado_por = auth.uid()
  )
);