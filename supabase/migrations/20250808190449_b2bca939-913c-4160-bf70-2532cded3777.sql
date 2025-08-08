-- Backfill seeded demo images so they no longer use the current photographer UUID
-- This reassigns photographer_id for old Unsplash-seeded rows to a new UUID
-- Safe-guard: only affect early seeded content (before 2025-05-01) hosted on images.unsplash.com
UPDATE public.portfolio_images
SET photographer_id = gen_random_uuid()
WHERE image_url LIKE 'https://images.unsplash.com/%'
  AND created_at < '2025-05-01';