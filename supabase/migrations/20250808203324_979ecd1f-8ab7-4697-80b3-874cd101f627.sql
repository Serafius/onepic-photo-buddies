-- Add author fields to portfolio_images
ALTER TABLE public.portfolio_images
ADD COLUMN IF NOT EXISTS author_name text,
ADD COLUMN IF NOT EXISTS author_avatar_url text;

-- Recreate view to include fallbacks for name and avatar
DROP VIEW IF EXISTS public.v_portfolio_images;

CREATE VIEW public.v_portfolio_images AS
SELECT
  pi.id,
  pi.photographer_id,
  pi.created_at,
  m.new_int AS photographer_int_id,
  pi.image_url,
  pi.title,
  pi.description,
  pi.category_name,
  COALESCE(pi.author_name, p.name, 'Guest Photographer')::varchar AS photographer_name,
  COALESCE(pi.author_avatar_url, pr.avatar_url, '/placeholder.svg') AS photographer_profile_url
FROM public.portfolio_images pi
LEFT JOIN public.photographers p ON p.id = pi.photographer_id
LEFT JOIN public.profiles pr ON pr.id = p.user_id
LEFT JOIN public.photographer_mappings m ON m.old_uuid = pi.photographer_id;