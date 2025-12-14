-- Create a separate protected table for contact data
CREATE TABLE public.quiz_session_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_session_contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can INSERT contact info (write-only for anonymous)
CREATE POLICY "Anyone can insert contact info"
ON public.quiz_session_contacts
FOR INSERT
WITH CHECK (true);

-- Policy: Only quiz owners can view contact info
CREATE POLICY "Quiz owners can view contacts"
ON public.quiz_session_contacts
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM quiz_sessions qs
    JOIN quizzes q ON q.id = qs.quiz_id
    WHERE qs.id = quiz_session_contacts.session_id
      AND q.criado_por = auth.uid()
  )
);

-- Policy: Quiz owners can delete contacts
CREATE POLICY "Quiz owners can delete contacts"
ON public.quiz_session_contacts
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM quiz_sessions qs
    JOIN quizzes q ON q.id = qs.quiz_id
    WHERE qs.id = quiz_session_contacts.session_id
      AND q.criado_por = auth.uid()
  )
);

-- Migrate existing data to new table
INSERT INTO public.quiz_session_contacts (session_id, email, phone, name, created_at)
SELECT id, email, phone, name, started_at
FROM public.quiz_sessions
WHERE email IS NOT NULL OR phone IS NOT NULL OR name IS NOT NULL;

-- Drop columns from quiz_sessions
ALTER TABLE public.quiz_sessions DROP COLUMN IF EXISTS email;
ALTER TABLE public.quiz_sessions DROP COLUMN IF EXISTS phone;
ALTER TABLE public.quiz_sessions DROP COLUMN IF EXISTS name;

-- Update the RPC function to write to the new table
CREATE OR REPLACE FUNCTION public.update_quiz_session(
  _session_id UUID,
  _session_token UUID,
  _email TEXT DEFAULT NULL,
  _phone TEXT DEFAULT NULL,
  _name TEXT DEFAULT NULL,
  _last_stage_index INTEGER DEFAULT NULL,
  _is_completed BOOLEAN DEFAULT NULL,
  _completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _existing_token UUID;
BEGIN
  -- Verify token matches and session is recent and not completed
  SELECT session_token INTO _existing_token
  FROM quiz_sessions
  WHERE id = _session_id
    AND started_at > (now() - interval '2 hours')
    AND (is_completed = false OR is_completed IS NULL);
  
  -- If no matching session or token mismatch, return false
  IF _existing_token IS NULL OR _existing_token != _session_token THEN
    RETURN false;
  END IF;
  
  -- Update quiz_sessions (non-PII fields only)
  UPDATE quiz_sessions
  SET 
    last_stage_index = COALESCE(_last_stage_index, last_stage_index),
    is_completed = COALESCE(_is_completed, is_completed),
    completed_at = COALESCE(_completed_at, completed_at)
  WHERE id = _session_id;
  
  -- Upsert contact info to separate protected table
  IF _email IS NOT NULL OR _phone IS NOT NULL OR _name IS NOT NULL THEN
    INSERT INTO quiz_session_contacts (session_id, email, phone, name)
    VALUES (_session_id, _email, _phone, _name)
    ON CONFLICT (session_id) 
    DO UPDATE SET
      email = COALESCE(EXCLUDED.email, quiz_session_contacts.email),
      phone = COALESCE(EXCLUDED.phone, quiz_session_contacts.phone),
      name = COALESCE(EXCLUDED.name, quiz_session_contacts.name);
  END IF;
  
  RETURN true;
END;
$$;