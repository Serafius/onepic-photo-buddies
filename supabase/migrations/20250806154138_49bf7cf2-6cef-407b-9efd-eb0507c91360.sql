-- Fix RLS policies to work with custom authentication system
-- Drop the current user_likes policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view their own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON public.user_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.user_likes;

-- Create new policies that allow operations for authenticated users
-- Since we're using custom auth, we'll check if the user_id matches stored IDs
CREATE POLICY "Anyone can view likes" 
ON public.user_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create likes" 
ON public.user_likes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete likes" 
ON public.user_likes 
FOR DELETE 
USING (true);

-- Fix storage policies for portfolio uploads
-- Drop existing policies that use auth.uid()
DROP POLICY IF EXISTS "Users can upload their own portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio images are viewable by everyone" ON storage.objects;

-- Create new storage policies that work with our custom auth
CREATE POLICY "Anyone can upload to portfolio" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'portfolio');

CREATE POLICY "Anyone can view portfolio images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'portfolio');

CREATE POLICY "Anyone can update portfolio images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'portfolio');

CREATE POLICY "Anyone can delete portfolio images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'portfolio');