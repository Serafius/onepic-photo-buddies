-- Create a proper posts system for portfolios

-- Create posts table for portfolio posts
CREATE TABLE IF NOT EXISTS public.portfolio_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photographer_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  is_featured BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0
);

-- Create post_images table to handle multiple images per post
CREATE TABLE IF NOT EXISTS public.post_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES portfolio_posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.portfolio_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for posts
CREATE POLICY "Anyone can view portfolio posts" 
ON portfolio_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage portfolio posts" 
ON portfolio_posts 
FOR ALL 
USING (true);

-- Create RLS policies for post images
CREATE POLICY "Anyone can view post images" 
ON post_images 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage post images" 
ON post_images 
FOR ALL 
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolio_posts_photographer_id ON portfolio_posts(photographer_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_posts_created_at ON portfolio_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_post_images_post_id ON post_images(post_id);
CREATE INDEX IF NOT EXISTS idx_post_images_order ON post_images(post_id, order_index);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for portfolio_posts
CREATE TRIGGER update_portfolio_posts_updated_at 
BEFORE UPDATE ON portfolio_posts 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();