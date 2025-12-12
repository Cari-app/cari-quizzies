-- Revoke all privileges from anon on quizzes table first
REVOKE ALL ON public.quizzes FROM anon;

-- Grant SELECT only on non-sensitive columns to anon
-- This excludes criado_por (creator UUID) from public access
GRANT SELECT (id, titulo, descricao, slug, is_active, criado_em, atualizado_em) ON public.quizzes TO anon;

-- Authenticated users keep full access to their own quizzes (controlled by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quizzes TO authenticated;