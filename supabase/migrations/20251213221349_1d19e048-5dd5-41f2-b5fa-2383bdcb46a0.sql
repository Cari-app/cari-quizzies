-- Add webhook configuration columns to quizzes table
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS webhook_enabled BOOLEAN DEFAULT false;