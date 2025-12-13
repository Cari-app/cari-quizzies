-- Drop all SELECT policies for quizzes and create a single one that works for all
DROP POLICY IF EXISTS "Quizzes ativos são públicos" ON public.quizzes;

-- Create policy explicitly for public role (includes anon)
CREATE POLICY "Quizzes ativos são públicos" 
ON public.quizzes 
FOR SELECT
USING (is_active = true OR (auth.uid() IS NOT NULL AND auth.uid() = criado_por));