-- Backfill: decouple seeded Unsplash images from any photographer by nulling the FK
UPDATE public.portfolio_images
SET photographer_id = NULL
WHERE image_url LIKE 'https://images.unsplash.com/%'
  AND created_at < '2025-05-01';