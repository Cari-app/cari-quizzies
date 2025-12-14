-- Verify policies exist and add any missing ones
-- The quiz_session_contacts table should have these policies:
-- 1. Anyone can INSERT (anonymous write-only)
-- 2. Only quiz owners can SELECT
-- 3. Only quiz owners can DELETE

-- Just to be safe, let's drop and recreate the SELECT policy to ensure it's correct
DROP POLICY IF EXISTS "Quiz owners can view contacts" ON public.quiz_session_contacts;

CREATE POLICY "Quiz owners can view contacts"
ON public.quiz_session_contacts
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM quiz_sessions qs
    JOIN quizzes q ON q.id = qs.quiz_id
    WHERE qs.id = quiz_session_contacts.session_id
      AND q.criado_por = auth.uid()
  )
);