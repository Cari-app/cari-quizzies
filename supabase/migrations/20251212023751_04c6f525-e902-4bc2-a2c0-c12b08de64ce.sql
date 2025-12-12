-- Create quizzes table with slug support
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  criado_por UUID NOT NULL,
  titulo TEXT NOT NULL,
  slug TEXT UNIQUE,
  descricao TEXT,
  is_active BOOLEAN DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster slug lookups
CREATE INDEX idx_quizzes_slug ON public.quizzes(slug);

-- Enable Row Level Security
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Qualquer um pode ver quizzes ativos" 
ON public.quizzes 
FOR SELECT 
USING (is_active = true OR auth.uid() = criado_por);

CREATE POLICY "Usuários podem criar quizzes" 
ON public.quizzes 
FOR INSERT 
WITH CHECK (auth.uid() = criado_por);

CREATE POLICY "Donos podem editar seus quizzes" 
ON public.quizzes 
FOR UPDATE 
USING (auth.uid() = criado_por);

CREATE POLICY "Donos podem deletar seus quizzes" 
ON public.quizzes 
FOR DELETE 
USING (auth.uid() = criado_por);

-- Create etapas (screens) table
CREATE TABLE public.etapas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'welcome',
  titulo TEXT,
  subtitulo TEXT,
  descricao TEXT,
  texto_botao TEXT,
  opcoes JSONB,
  configuracoes JSONB
);

-- Enable Row Level Security
ALTER TABLE public.etapas ENABLE ROW LEVEL SECURITY;

-- Create policies for etapas
CREATE POLICY "Qualquer um pode ver etapas de quizzes ativos" 
ON public.etapas 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.quizzes 
  WHERE quizzes.id = etapas.quiz_id 
  AND (quizzes.is_active = true OR quizzes.criado_por = auth.uid())
));

CREATE POLICY "Donos podem gerenciar etapas" 
ON public.etapas 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.quizzes 
  WHERE quizzes.id = etapas.quiz_id 
  AND quizzes.criado_por = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_quizzes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.update_quizzes_updated_at();