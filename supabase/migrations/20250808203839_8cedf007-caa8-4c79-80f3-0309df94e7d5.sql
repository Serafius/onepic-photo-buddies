-- Backfill author fields from linked photographers where available
UPDATE public.portfolio_images pi
SET 
  author_name = COALESCE(pi.author_name, p.name),
  author_avatar_url = COALESCE(pi.author_avatar_url, pr.avatar_url)
FROM public.photographers p
LEFT JOIN public.profiles pr ON pr.id = p.user_id
WHERE pi.photographer_id = p.id
  AND (pi.author_name IS NULL OR pi.author_avatar_url IS NULL);

-- Backfill remaining rows with a random photographer to ensure real names and avatars
UPDATE public.portfolio_images pi
SET 
  author_name = COALESCE(pi.author_name, rr.name),
  author_avatar_url = COALESCE(pi.author_avatar_url, rr.avatar_url)
FROM LATERAL (
  SELECT p.name, pr.avatar_url
  FROM public.photographers p
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  ORDER BY random()
  LIMIT 1
) AS rr
WHERE pi.author_name IS NULL OR pi.author_avatar_url IS NULL;

-- Recreate view with robust avatar fallback (Dicebear initials from name)
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
  COALESCE(pi.author_name, p.name) AS photographer_name,
  COALESCE(
    pi.author_avatar_url,
    pr.avatar_url,
    'https://api.dicebear.com/7.x/initials/svg?seed=' ||
      regexp_replace(COALESCE(pi.author_name, p.name, 'Guest Photographer'), '\\s+', '%20', 'g')
  ) AS photographer_profile_url
FROM public.portfolio_images pi
LEFT JOIN public.photographers p ON p.id = pi.photographer_id
LEFT JOIN public.profiles pr ON pr.id = p.user_id
LEFT JOIN public.photographer_mappings m ON m.old_uuid = pi.photographer_id;

-- Ensure invoker security so RLS policies are respected
ALTER VIEW public.v_portfolio_images SET (security_invoker = on);
