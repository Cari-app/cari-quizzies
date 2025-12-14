-- Grant SELECT permission on quizzes to anon and authenticated roles
GRANT SELECT ON public.quizzes TO anon;
GRANT SELECT ON public.quizzes TO authenticated;

-- Grant SELECT permission on etapas to anon and authenticated roles
GRANT SELECT ON public.etapas TO anon;
GRANT SELECT ON public.etapas TO authenticated;