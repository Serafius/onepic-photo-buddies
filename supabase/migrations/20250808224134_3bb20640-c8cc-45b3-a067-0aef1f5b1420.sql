-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Add persistent counters to images
ALTER TABLE public.portfolio_images
  ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count integer NOT NULL DEFAULT 0;

-- 2) Backfill current counters from existing data
-- Likes
UPDATE public.portfolio_images pi
SET likes_count = COALESCE(ul.cnt, 0)
FROM (
  SELECT image_id, COUNT(*)::int AS cnt
  FROM public.user_likes
  GROUP BY image_id
) ul
WHERE pi.id = ul.image_id;

UPDATE public.portfolio_images
SET likes_count = 0
WHERE likes_count IS NULL;

-- Comments
UPDATE public.portfolio_images pi
SET comments_count = COALESCE(ic.cnt, 0)
FROM (
  SELECT image_id, COUNT(*)::int AS cnt
  FROM public.image_comments
  GROUP BY image_id
) ic
WHERE pi.id = ic.image_id;

UPDATE public.portfolio_images
SET comments_count = 0
WHERE comments_count IS NULL;

-- 3) Create trigger to keep likes_count in sync on like insert/delete
CREATE OR REPLACE FUNCTION public.trg_sync_likes_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.portfolio_images
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.image_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.portfolio_images
    SET likes_count = GREATEST(0, COALESCE(likes_count, 0) - 1)
    WHERE id = OLD.image_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS user_likes_sync_count ON public.user_likes;
CREATE TRIGGER user_likes_sync_count
AFTER INSERT OR DELETE ON public.user_likes
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_likes_count();

-- 4) Create trigger to keep comments_count in sync on comment insert/delete
CREATE OR REPLACE FUNCTION public.trg_sync_comments_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.portfolio_images
    SET comments_count = COALESCE(comments_count, 0) + 1
    WHERE id = NEW.image_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.portfolio_images
    SET comments_count = GREATEST(0, COALESCE(comments_count, 0) - 1)
    WHERE id = OLD.image_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS image_comments_sync_count ON public.image_comments;
CREATE TRIGGER image_comments_sync_count
AFTER INSERT OR DELETE ON public.image_comments
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_comments_count();