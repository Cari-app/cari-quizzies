-- Create webhooks table for multiple webhooks per quiz
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

-- Enable RLS
ALTER TABLE public.quiz_webhooks ENABLE ROW LEVEL SECURITY;

-- Owners can manage their quiz webhooks
CREATE POLICY "Donos podem gerenciar webhooks" 
ON public.quiz_webhooks 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM quizzes 
  WHERE quizzes.id = quiz_webhooks.quiz_id 
  AND quizzes.criado_por = auth.uid()
));

-- Migrate existing webhook data
INSERT INTO public.quiz_webhooks (quiz_id, name, url, enabled, settings)
SELECT 
  id as quiz_id,
  'Webhook' as name,
  webhook_url as url,
  COALESCE(webhook_enabled, false) as enabled,
  COALESCE(webhook_settings, '{}'::jsonb) as settings
FROM public.quizzes
WHERE webhook_url IS NOT NULL AND webhook_url != '';

-- Create trigger for updated_at
CREATE TRIGGER update_quiz_webhooks_updated_at
BEFORE UPDATE ON public.quiz_webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();