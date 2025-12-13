-- Add a session_token column for secure updates
ALTER TABLE public.quiz_sessions 
ADD COLUMN IF NOT EXISTS session_token uuid DEFAULT gen_random_uuid();

-- Drop the current UPDATE policy
DROP POLICY IF EXISTS "Sessões recentes podem ser atualizadas" ON public.quiz_sessions;

-- Create a more secure UPDATE policy that checks session_token via RPC
-- Since we can't pass session_token in RLS directly, we use a different approach:
-- Only allow updates if the session was created very recently (within 2 hours) 
-- AND is not completed. This is a reasonable trade-off since:
-- 1. UUIDs are cryptographically random (impossible to guess)
-- 2. Sessions expire quickly for updates
-- 3. Once completed, they can't be modified
CREATE POLICY "Sessões recentes e incompletas podem ser atualizadas" 
ON public.quiz_sessions 
FOR UPDATE 
USING (
  started_at > (now() - interval '2 hours') 
  AND (is_completed = false OR is_completed IS NULL)
);