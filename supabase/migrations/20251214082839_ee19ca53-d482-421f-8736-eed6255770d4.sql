-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Quizzes ativos são públicos" ON public.quizzes;
DROP POLICY IF EXISTS "Etapas de quizzes ativos são públicas" ON public.etapas;

-- Recreate SELECT policy for quizzes to allow anon access
CREATE POLICY "Quizzes ativos são públicos" 
ON public.quizzes 
FOR SELECT 
TO anon, authenticated
USING (
  (is_active = true) OR 
  (auth.uid() IS NOT NULL AND auth.uid() = criado_por)
);

-- Recreate SELECT policy for etapas to allow anon access  
CREATE POLICY "Etapas de quizzes ativos são públicas"
ON public.etapas
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = etapas.quiz_id 
    AND (
      quizzes.is_active = true OR 
      (auth.uid() IS NOT NULL AND auth.uid() = quizzes.criado_por)
    )
  )
);