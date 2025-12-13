-- Add webhook_settings JSONB column to quizzes table
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS webhook_settings jsonb DEFAULT '{}'::jsonb;