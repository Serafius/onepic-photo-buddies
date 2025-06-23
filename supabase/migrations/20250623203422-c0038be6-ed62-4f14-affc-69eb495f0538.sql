
-- Create a table for photographer categories with pricing
CREATE TABLE IF NOT EXISTS photographer_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL,
  name TEXT NOT NULL,
  price_per_hour DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (photographer_id) REFERENCES "Photographers"(id) ON DELETE CASCADE,
  UNIQUE(photographer_id, name)
);

-- Add profile picture field to Photographers table
ALTER TABLE "Photographers" 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add bio field to Photographers table for additional profile info
ALTER TABLE "Photographers" 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_photographer_categories_photographer_id 
ON photographer_categories(photographer_id);
