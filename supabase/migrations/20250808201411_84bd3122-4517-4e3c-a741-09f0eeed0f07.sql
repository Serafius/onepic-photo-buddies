-- Address linter warnings
-- Ensure views run with invoker's rights (not definer)
alter view public.v_portfolio_images set (security_invoker = true);
alter view public.v_portfolio_posts set (security_invoker = true);

-- Set immutable search_path on functions
alter function public.update_updated_at_column() set search_path = public;
alter function public.handle_new_user() set search_path = public;