-- Add thumbnail/cover image column to quizzes table
ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS thumbnail_url text NULL;