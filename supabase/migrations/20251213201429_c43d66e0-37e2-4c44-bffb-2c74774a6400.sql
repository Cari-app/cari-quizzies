-- Fix the policy to be PERMISSIVE (default behavior for allowing access)
DROP POLICY IF EXISTS "Quizzes ativos são públicos" ON public.quizzes;

CREATE POLICY "Quizzes ativos são públicos" 
ON public.quizzes 
FOR SELECT
TO PUBLIC
USING (is_active = true OR (auth.uid() IS NOT NULL AND auth.uid() = criado_por));

-- Also fix etapas policy to be PERMISSIVE
DROP POLICY IF EXISTS "Etapas de quizzes ativos são públicas" ON public.etapas;

CREATE POLICY "Etapas de quizzes ativos são públicas"
ON public.etapas
FOR SELECT
TO PUBLIC
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = etapas.quiz_id
    AND (quizzes.is_active = true OR (auth.uid() IS NOT NULL AND auth.uid() = quizzes.criado_por))
  )
);