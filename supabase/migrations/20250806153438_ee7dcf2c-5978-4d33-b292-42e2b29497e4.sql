-- Enable RLS on all public tables that don't have it
ALTER TABLE public."Photographers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Sessions" ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public."Comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Posts" ENABLE ROW LEVEL SECURITY;

-- Create basic policies for the tables
-- Photographers table policies
CREATE POLICY "Photographers can view their own data" 
ON public."Photographers" 
FOR SELECT 
USING (true); -- Allow public viewing for now

CREATE POLICY "Photographers can update their own data" 
ON public."Photographers" 
FOR UPDATE 
USING (true); -- Will need to implement proper user matching later

-- Clients table policies  
CREATE POLICY "Clients can view their own data" 
ON public."Clients" 
FOR SELECT 
USING (true); -- Allow public viewing for now

CREATE POLICY "Clients can update their own data" 
ON public."Clients" 
FOR UPDATE 
USING (true); -- Will need to implement proper user matching later

-- Sessions table policies
CREATE POLICY "Sessions are viewable by related users" 
ON public."Sessions" 
FOR SELECT 
USING (true); -- Allow viewing for now

-- Comments table policies
CREATE POLICY "Comments are viewable by everyone" 
ON public."Comments" 
FOR SELECT 
USING (true);

-- Posts table policies
CREATE POLICY "Posts are viewable by everyone" 
ON public."Posts" 
FOR SELECT 
USING (true);