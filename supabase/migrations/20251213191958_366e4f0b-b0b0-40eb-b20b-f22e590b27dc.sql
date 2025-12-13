-- Drop the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Qualquer pessoa pode atualizar sessão" ON public.quiz_sessions;

-- Create a more restrictive UPDATE policy
-- Only allow updating sessions that:
-- 1. Were created within the last 24 hours (prevents modifying old sessions)
-- 2. Are not yet completed (prevents modifying finished sessions)
CREATE POLICY "Sessões recentes podem ser atualizadas" 
ON public.quiz_sessions 
FOR UPDATE 
USING (
  started_at > (now() - interval '24 hours') 
  AND (is_completed = false OR is_completed IS NULL)
);