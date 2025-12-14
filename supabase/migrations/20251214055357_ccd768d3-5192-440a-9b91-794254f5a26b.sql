-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Active domains are publicly readable for routing" ON public.custom_domains;

-- Create a restricted policy using a security definer function
CREATE OR REPLACE FUNCTION public.get_active_domain_for_routing(_domain TEXT)
RETURNS TABLE(domain TEXT, quiz_id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cd.domain, cd.quiz_id
  FROM public.custom_domains cd
  WHERE cd.domain = _domain
    AND cd.status = 'active';
$$;