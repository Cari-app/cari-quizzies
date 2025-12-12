-- Remove the email column from profiles table to eliminate duplicate PII exposure
-- Email is already securely stored in auth.users and can be accessed via supabase.auth.getUser()

-- First, update the trigger function to not insert email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  
  -- First user becomes admin, others become editors
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'editor');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Now remove the email column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;