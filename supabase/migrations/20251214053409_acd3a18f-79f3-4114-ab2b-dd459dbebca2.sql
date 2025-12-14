-- Drop existing SELECT policy and recreate as PERMISSIVE with proper restrictions
DROP POLICY IF EXISTS "Donos podem ver sessões do quiz" ON public.quiz_sessions;

-- Create proper SELECT policy - only quiz owners can view sessions
CREATE POLICY "Donos podem ver sessões do quiz"
ON public.quiz_sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quizzes
    WHERE quizzes.id = quiz_sessions.quiz_id
    AND quizzes.criado_por = auth.uid()
  )
);

-- Also fix quiz_responses table
DROP POLICY IF EXISTS "Donos podem ver respostas do quiz" ON public.quiz_responses;

-- Create proper SELECT policy for quiz_responses - only quiz owners can view
CREATE POLICY "Donos podem ver respostas do quiz"
ON public.quiz_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM quiz_sessions
    JOIN quizzes ON quizzes.id = quiz_sessions.quiz_id
    WHERE quiz_sessions.id = quiz_responses.session_id
    AND quizzes.criado_por = auth.uid()
  )
);