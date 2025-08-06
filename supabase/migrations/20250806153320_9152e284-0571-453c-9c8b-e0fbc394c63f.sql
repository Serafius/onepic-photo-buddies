-- Create user_likes table for like functionality
CREATE TABLE public.user_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_id UUID NOT NULL REFERENCES public.portfolio_images(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, image_id)
);

-- Enable RLS
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own likes" 
ON public.user_likes 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own likes" 
ON public.user_likes 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own likes" 
ON public.user_likes 
FOR DELETE 
USING (user_id = auth.uid());

-- Create function to get authenticated user ID from localStorage (since we're not using Supabase auth)
-- We'll need to handle this differently in the frontend code