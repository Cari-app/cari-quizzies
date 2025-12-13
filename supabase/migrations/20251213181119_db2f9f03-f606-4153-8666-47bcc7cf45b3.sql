-- Tabela para armazenar sessões de quiz (cada visitante)
CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_stage_index INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  -- Metadata do visitante
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT, -- mobile, tablet, desktop
  referrer TEXT,
  -- Dados de identificação (se coletados no quiz)
  email TEXT,
  phone TEXT,
  name TEXT
);

-- Tabela para armazenar respostas individuais por etapa
CREATE TABLE public.quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.etapas(id) ON DELETE CASCADE,
  stage_order INTEGER NOT NULL,
  response_value JSONB, -- Valor da resposta (texto, opção selecionada, etc)
  response_type TEXT, -- clicked, selected, submitted, etc
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_spent_ms INTEGER -- Tempo gasto na etapa em milissegundos
);

-- Índices para performance
CREATE INDEX idx_quiz_sessions_quiz_id ON public.quiz_sessions(quiz_id);
CREATE INDEX idx_quiz_sessions_started_at ON public.quiz_sessions(started_at DESC);
CREATE INDEX idx_quiz_responses_session_id ON public.quiz_responses(session_id);
CREATE INDEX idx_quiz_responses_stage_id ON public.quiz_responses(stage_id);

-- Habilitar RLS
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Políticas para quiz_sessions
-- Donos do quiz podem ver todas as sessões
CREATE POLICY "Donos podem ver sessões do quiz"
ON public.quiz_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = quiz_sessions.quiz_id
    AND quizzes.criado_por = auth.uid()
  )
);

-- Qualquer pessoa pode criar uma sessão (usuários anônimos respondendo quiz)
CREATE POLICY "Qualquer pessoa pode criar sessão"
ON public.quiz_sessions
FOR INSERT
WITH CHECK (true);

-- Qualquer pessoa pode atualizar sua própria sessão
CREATE POLICY "Qualquer pessoa pode atualizar sessão"
ON public.quiz_sessions
FOR UPDATE
USING (true);

-- Donos podem deletar sessões
CREATE POLICY "Donos podem deletar sessões"
ON public.quiz_sessions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = quiz_sessions.quiz_id
    AND quizzes.criado_por = auth.uid()
  )
);

-- Políticas para quiz_responses
-- Donos do quiz podem ver todas as respostas
CREATE POLICY "Donos podem ver respostas do quiz"
ON public.quiz_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_sessions
    JOIN public.quizzes ON quizzes.id = quiz_sessions.quiz_id
    WHERE quiz_sessions.id = quiz_responses.session_id
    AND quizzes.criado_por = auth.uid()
  )
);

-- Qualquer pessoa pode criar uma resposta
CREATE POLICY "Qualquer pessoa pode criar resposta"
ON public.quiz_responses
FOR INSERT
WITH CHECK (true);

-- Donos podem deletar respostas
CREATE POLICY "Donos podem deletar respostas"
ON public.quiz_responses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_sessions
    JOIN public.quizzes ON quizzes.id = quiz_sessions.quiz_id
    WHERE quiz_sessions.id = quiz_responses.session_id
    AND quizzes.criado_por = auth.uid()
  )
);