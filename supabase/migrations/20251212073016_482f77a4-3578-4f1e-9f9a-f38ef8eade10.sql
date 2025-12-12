-- Revoke all privileges from the anonymous role on profiles table
-- This adds defense in depth - even if RLS had a bug, anon users couldn't access it
REVOKE ALL ON public.profiles FROM anon;

-- Grant only to authenticated role (the policies will still control row-level access)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;