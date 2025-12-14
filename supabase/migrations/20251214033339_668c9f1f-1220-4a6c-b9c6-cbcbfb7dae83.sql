-- Tabela para gerenciar domínios customizados dos clientes
CREATE TABLE public.custom_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verifying', 'active', 'failed', 'removed')),
  cloudflare_hostname_id TEXT,
  verification_txt TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  ssl_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(domain)
);

-- Índices para performance
CREATE INDEX idx_custom_domains_user_id ON public.custom_domains(user_id);
CREATE INDEX idx_custom_domains_domain ON public.custom_domains(domain);
CREATE INDEX idx_custom_domains_status ON public.custom_domains(status);

-- Enable RLS
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seus próprios domínios
CREATE POLICY "Users can view their own domains"
ON public.custom_domains
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Usuários podem criar domínios
CREATE POLICY "Users can create their own domains"
ON public.custom_domains
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar seus próprios domínios
CREATE POLICY "Users can update their own domains"
ON public.custom_domains
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Usuários podem deletar seus próprios domínios
CREATE POLICY "Users can delete their own domains"
ON public.custom_domains
FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Leitura pública para domínios ativos (para roteamento)
CREATE POLICY "Active domains are publicly readable for routing"
ON public.custom_domains
FOR SELECT
USING (status = 'active');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_custom_domains_updated_at
  BEFORE UPDATE ON public.custom_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();