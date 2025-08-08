-- Ensure views run with invoker's permissions (RLS-aware)
ALTER VIEW public.v_portfolio_images SET (security_invoker = on);
ALTER VIEW public.v_portfolio_posts SET (security_invoker = on);