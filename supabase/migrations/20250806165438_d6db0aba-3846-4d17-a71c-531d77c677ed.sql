-- Fix portfolio_posts table to use UUID for photographer_id
-- First, drop existing foreign key if it exists
ALTER TABLE portfolio_posts DROP CONSTRAINT IF EXISTS portfolio_posts_photographer_id_fkey;

-- Change the column type to UUID 
ALTER TABLE portfolio_posts ALTER COLUMN photographer_id TYPE uuid USING photographer_id::text::uuid;

-- Add proper foreign key constraint to the photographers table
ALTER TABLE portfolio_posts 
ADD CONSTRAINT portfolio_posts_photographer_id_fkey 
FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE;

-- Update RLS policies for portfolio_posts to use auth
DROP POLICY IF EXISTS "Anyone can manage portfolio posts" ON portfolio_posts;
DROP POLICY IF EXISTS "Anyone can view portfolio posts" ON portfolio_posts;

-- Create new RLS policies
CREATE POLICY "Portfolio posts are viewable by everyone" 
ON portfolio_posts FOR SELECT USING (true);

CREATE POLICY "Photographers can manage their own posts" 
ON portfolio_posts FOR ALL 
USING (photographer_id IN (
  SELECT id FROM photographers WHERE user_id = auth.uid()
))
WITH CHECK (photographer_id IN (
  SELECT id FROM photographers WHERE user_id = auth.uid()
));

-- Update RLS policies for post_images to match
DROP POLICY IF EXISTS "Anyone can manage post images" ON post_images;
DROP POLICY IF EXISTS "Anyone can view post images" ON post_images;

CREATE POLICY "Post images are viewable by everyone" 
ON post_images FOR SELECT USING (true);

CREATE POLICY "Photographers can manage their own post images" 
ON post_images FOR ALL 
USING (post_id IN (
  SELECT pp.id FROM portfolio_posts pp 
  JOIN photographers p ON pp.photographer_id = p.id 
  WHERE p.user_id = auth.uid()
))
WITH CHECK (post_id IN (
  SELECT pp.id FROM portfolio_posts pp 
  JOIN photographers p ON pp.photographer_id = p.id 
  WHERE p.user_id = auth.uid()
));