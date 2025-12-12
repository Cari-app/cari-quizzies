-- Drop existing policies that require auth for viewing
DROP POLICY IF EXISTS "Qualquer um pode ver quizzes ativos" ON public.quizzes;
DROP POLICY IF EXISTS "Qualquer um pode ver etapas de quizzes ativos" ON public.etapas;

-- Create new policy for quizzes - allow anonymous access to active quizzes
CREATE POLICY "Quizzes ativos são públicos" 
ON public.quizzes 
FOR SELECT 
USING (
  is_active = true 
  OR (auth.uid() IS NOT NULL AND auth.uid() = criado_por)
);

-- Create new policy for etapas - allow anonymous access to stages of active quizzes
CREATE POLICY "Etapas de quizzes ativos são públicas" 
ON public.etapas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = etapas.quiz_id 
    AND (quizzes.is_active = true OR (auth.uid() IS NOT NULL AND auth.uid() = quizzes.criado_por))
  )
);