
-- 0) Safety: enable uuid generation (harmless if already present)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Ensure persistent counters exist (harmless if already present)
ALTER TABLE public.portfolio_images
  ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count integer NOT NULL DEFAULT 0;

-- 2) Make sure we never double-like the same image by the same user
CREATE UNIQUE INDEX IF NOT EXISTS user_likes_user_image_unique
  ON public.user_likes (user_id, image_id);

-- And for comment likes, keep one like per user per comment
CREATE UNIQUE INDEX IF NOT EXISTS comment_likes_user_comment_unique
  ON public.comment_likes (user_id, comment_id);

-- 3) Attach triggers that keep counts in sync (functions already exist)
DROP TRIGGER IF EXISTS user_likes_sync_count ON public.user_likes;
CREATE TRIGGER user_likes_sync_count
AFTER INSERT OR DELETE ON public.user_likes
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_likes_count();

DROP TRIGGER IF EXISTS image_comments_sync_count ON public.image_comments;
CREATE TRIGGER image_comments_sync_count
AFTER INSERT OR DELETE ON public.image_comments
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_comments_count();

-- 4) Backfill existing counters once from the source tables
-- Likes backfill
WITH agg AS (
  SELECT image_id, COUNT(*)::int AS cnt
  FROM public.user_likes
  GROUP BY image_id
)
UPDATE public.portfolio_images pi
SET likes_count = COALESCE(agg.cnt, 0)
FROM agg
WHERE pi.id = agg.image_id;

UPDATE public.portfolio_images
SET likes_count = 0
WHERE likes_count IS NULL;

-- Comments backfill
WITH agg AS (
  SELECT image_id, COUNT(*)::int AS cnt
  FROM public.image_comments
  GROUP BY image_id
)
UPDATE public.portfolio_images pi
SET comments_count = COALESCE(agg.cnt, 0)
FROM agg
WHERE pi.id = agg.image_id;

UPDATE public.portfolio_images
SET comments_count = 0
WHERE comments_count IS NULL;

-- 5) Replace the view to include the persistent counters
-- This reuses your legacy Photographers (int) via photographer_mappings to enrich image rows.
CREATE OR REPLACE VIEW public.v_portfolio_images AS
SELECT
  pi.id,
  pi.image_url,
  pi.title,
  pi.description,
  pi.category_name,
  pi.photographer_id,
  pm.new_int AS photographer_int_id,
  p.name AS photographer_name,
  p.profile_picture_url AS photographer_profile_url,
  pi.created_at,
  pi.likes_count,
  pi.comments_count
FROM public.portfolio_images pi
LEFT JOIN public.photographer_mappings pm
  ON pm.old_uuid = pi.photographer_id
LEFT JOIN public."Photographers" p
  ON p.id = pm.new_int;
