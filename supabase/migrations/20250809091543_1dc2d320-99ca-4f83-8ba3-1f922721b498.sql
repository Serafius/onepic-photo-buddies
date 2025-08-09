-- Add rating column to public."Photographers" and related index/constraint
ALTER TABLE public."Photographers"
  ADD COLUMN IF NOT EXISTS rating numeric NOT NULL DEFAULT 0;

-- Ensure rating stays within 0-5
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'photographers_rating_range'
  ) THEN
    ALTER TABLE public."Photographers"
      ADD CONSTRAINT photographers_rating_range CHECK (rating >= 0 AND rating <= 5);
  END IF;
END$$;

-- Index to optimize ordering by rating
CREATE INDEX IF NOT EXISTS idx_photographers_rating ON public."Photographers" (rating DESC);
