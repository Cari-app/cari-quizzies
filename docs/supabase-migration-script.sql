-- ============================================
-- QUIZZIES - SCRIPT DE MIGRAÇÃO COMPLETO
-- Execute este script no SQL Editor do novo projeto Supabase
-- ============================================

-- ============================================
-- PARTE 1: ENUMS
-- ============================================

-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');

-- ============================================
-- PARTE 2: FUNÇÕES UTILITÁRIAS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Função para atualizar atualizado_em (quizzes)
CREATE OR REPLACE FUNCTION public.update_quizzes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

-- Função para verificar se usuário tem role (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- ============================================
-- PARTE 3: TABELAS
-- ============================================

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de roles de usuário
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'editor',
  UNIQUE (user_id, role)
);

-- Tabela de quizzes
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  criado_por UUID NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  slug TEXT UNIQUE,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT false,
  webhook_url TEXT,
  webhook_enabled BOOLEAN DEFAULT false,
  webhook_settings JSONB DEFAULT '{}'::jsonb,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de etapas (stages do quiz)
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

-- Tabela de sessões do quiz
CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  session_token UUID DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  last_stage_index INTEGER DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  referrer TEXT
);

-- Tabela de respostas do quiz
CREATE TABLE public.quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.etapas(id) ON DELETE CASCADE,
  stage_order INTEGER NOT NULL,
  response_type TEXT,
  response_value JSONB,
  time_spent_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de webhooks do quiz
CREATE TABLE public.quiz_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Webhook',
  url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de mídia do usuário
CREATE TABLE public.user_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de configurações do site
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  site_name TEXT DEFAULT 'Meu Site',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  secondary_color TEXT DEFAULT '#8b5cf6',
  accent_color TEXT DEFAULT '#f59e0b',
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#1f2937',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de domínios customizados
CREATE TABLE public.custom_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verifying', 'active', 'failed', 'removed')),
  cloudflare_hostname_id TEXT,
  verification_txt TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  ssl_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- PARTE 4: ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_quizzes_criado_por ON public.quizzes(criado_por);
CREATE INDEX idx_quizzes_slug ON public.quizzes(slug);
CREATE INDEX idx_quizzes_is_active ON public.quizzes(is_active);

CREATE INDEX idx_etapas_quiz_id ON public.etapas(quiz_id);
CREATE INDEX idx_etapas_ordem ON public.etapas(ordem);

CREATE INDEX idx_quiz_sessions_quiz_id ON public.quiz_sessions(quiz_id);
CREATE INDEX idx_quiz_sessions_email ON public.quiz_sessions(email);
CREATE INDEX idx_quiz_sessions_started_at ON public.quiz_sessions(started_at);

CREATE INDEX idx_quiz_responses_session_id ON public.quiz_responses(session_id);
CREATE INDEX idx_quiz_responses_stage_id ON public.quiz_responses(stage_id);

CREATE INDEX idx_quiz_webhooks_quiz_id ON public.quiz_webhooks(quiz_id);

CREATE INDEX idx_user_media_user_id ON public.user_media(user_id);

CREATE INDEX idx_custom_domains_user_id ON public.custom_domains(user_id);
CREATE INDEX idx_custom_domains_domain ON public.custom_domains(domain);
CREATE INDEX idx_custom_domains_status ON public.custom_domains(status);

-- ============================================
-- PARTE 5: TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at em profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar atualizado_em em quizzes
CREATE TRIGGER update_quizzes_atualizado_em
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quizzes_updated_at();

-- Trigger para atualizar updated_at em quiz_webhooks
CREATE TRIGGER update_quiz_webhooks_updated_at
  BEFORE UPDATE ON public.quiz_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em user_media
CREATE TRIGGER update_user_media_updated_at
  BEFORE UPDATE ON public.user_media
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em site_settings
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em custom_domains
CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PARTE 6: FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cria perfil para novo usuário
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  
  -- Primeiro usuário se torna admin, demais viram editors
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'editor');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil quando usuário se registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PARTE 7: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: profiles
-- ============================================

CREATE POLICY "Authenticated users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can delete their own profile"
ON public.profiles FOR DELETE
USING (auth.uid() = id);

-- ============================================
-- POLICIES: user_roles
-- ============================================

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- POLICIES: quizzes
-- ============================================

CREATE POLICY "Quizzes ativos são públicos"
ON public.quizzes FOR SELECT
USING (
  (is_active = true) OR 
  ((auth.uid() IS NOT NULL) AND (auth.uid() = criado_por))
);

CREATE POLICY "Usuários podem criar quizzes"
ON public.quizzes FOR INSERT
WITH CHECK (auth.uid() = criado_por);

CREATE POLICY "Donos podem editar seus quizzes"
ON public.quizzes FOR UPDATE
USING (auth.uid() = criado_por);

CREATE POLICY "Donos podem deletar seus quizzes"
ON public.quizzes FOR DELETE
USING (auth.uid() = criado_por);

-- ============================================
-- POLICIES: etapas
-- ============================================

CREATE POLICY "Etapas de quizzes ativos são públicas"
ON public.etapas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM quizzes
    WHERE quizzes.id = etapas.quiz_id
    AND ((quizzes.is_active = true) OR 
         ((auth.uid() IS NOT NULL) AND (auth.uid() = quizzes.criado_por)))
  )
);

CREATE POLICY "Donos podem gerenciar etapas"
ON public.etapas FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM quizzes
    WHERE quizzes.id = etapas.quiz_id
    AND quizzes.criado_por = auth.uid()
  )
);

-- ============================================
-- POLICIES: quiz_sessions
-- ============================================

CREATE POLICY "Donos podem ver sessões do quiz"
ON public.quiz_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM quizzes
    WHERE quizzes.id = quiz_sessions.quiz_id
    AND quizzes.criado_por = auth.uid()
  )
);

CREATE POLICY "Qualquer pessoa pode criar sessão"
ON public.quiz_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Sessões recentes e incompletas podem ser atualizadas"
ON public.quiz_sessions FOR UPDATE
USING (
  (started_at > (now() - '02:00:00'::interval)) 
  AND ((is_completed = false) OR (is_completed IS NULL))
);

CREATE POLICY "Donos podem deletar sessões"
ON public.quiz_sessions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM quizzes
    WHERE quizzes.id = quiz_sessions.quiz_id
    AND quizzes.criado_por = auth.uid()
  )
);

-- ============================================
-- POLICIES: quiz_responses
-- ============================================

CREATE POLICY "Donos podem ver respostas do quiz"
ON public.quiz_responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM quiz_sessions
    JOIN quizzes ON quizzes.id = quiz_sessions.quiz_id
    WHERE quiz_sessions.id = quiz_responses.session_id
    AND quizzes.criado_por = auth.uid()
  )
);

CREATE POLICY "Qualquer pessoa pode criar resposta"
ON public.quiz_responses FOR INSERT
WITH CHECK (true);

CREATE POLICY "Donos podem deletar respostas"
ON public.quiz_responses FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM quiz_sessions
    JOIN quizzes ON quizzes.id = quiz_sessions.quiz_id
    WHERE quiz_sessions.id = quiz_responses.session_id
    AND quizzes.criado_por = auth.uid()
  )
);

-- ============================================
-- POLICIES: quiz_webhooks
-- ============================================

CREATE POLICY "Donos podem gerenciar webhooks"
ON public.quiz_webhooks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM quizzes
    WHERE quizzes.id = quiz_webhooks.quiz_id
    AND quizzes.criado_por = auth.uid()
  )
);

-- ============================================
-- POLICIES: user_media
-- ============================================

CREATE POLICY "Users can view their own media"
ON public.user_media FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own media"
ON public.user_media FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media"
ON public.user_media FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: site_settings
-- ============================================

CREATE POLICY "Users can view their own settings"
ON public.site_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
ON public.site_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.site_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
ON public.site_settings FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: custom_domains
-- ============================================

CREATE POLICY "Users can view their own domains"
ON public.custom_domains FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own domains"
ON public.custom_domains FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own domains"
ON public.custom_domains FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own domains"
ON public.custom_domains FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Active domains are publicly readable for routing"
ON public.custom_domains FOR SELECT
USING (status = 'active');

-- ============================================
-- PARTE 8: STORAGE BUCKET
-- ============================================

-- Criar bucket para imagens do quiz (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('quiz-images', 'quiz-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies para storage
CREATE POLICY "Quiz images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'quiz-images');

CREATE POLICY "Authenticated users can upload quiz images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'quiz-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own quiz images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'quiz-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own quiz images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'quiz-images' 
  AND auth.uid() IS NOT NULL
);

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Após executar este script:
-- 1. Vá em Authentication > Providers e habilite Email
-- 2. Configure o SMTP se quiser emails de confirmação
-- 3. Copie a URL e ANON KEY do projeto
-- 4. Atualize o .env do Lovable com as novas credenciais
