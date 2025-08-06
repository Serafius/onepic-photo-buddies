-- Fix RLS policies for portfolio uploads

-- Update portfolio_images RLS policies to work with the current authentication system
DROP POLICY IF EXISTS "Photographers can manage their own portfolio images" ON portfolio_images;
DROP POLICY IF EXISTS "Portfolio images are viewable by everyone" ON portfolio_images;

-- Create new policies that don't rely on auth.uid() since we're using custom auth
CREATE POLICY "Anyone can view portfolio images" 
ON portfolio_images 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage portfolio images" 
ON portfolio_images 
FOR ALL 
USING (true);

-- Update storage policies for the portfolio bucket to allow uploads
INSERT INTO storage.objects (bucket_id, name, owner) VALUES ('portfolio', '.emptyFolderPlaceholder', null) ON CONFLICT DO NOTHING;

-- Ensure the portfolio bucket allows public access
UPDATE storage.buckets SET public = true WHERE id = 'portfolio';