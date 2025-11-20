-- Create the images table
CREATE TABLE public.images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
    filename TEXT NOT NULL,
    mimetype TEXT NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on the images table
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow authenticated users to view their own images
CREATE POLICY "Users can view their own images" ON public.images
FOR SELECT USING (auth.uid()::text = user_id);

-- Create a policy to allow authenticated users to insert their own images
CREATE POLICY "Users can insert their own images" ON public.images
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create a policy to allow authenticated users to update their own images
CREATE POLICY "Users can update their own images" ON public.images
FOR UPDATE USING (auth.uid()::text = user_id);

-- Create a policy to allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own images" ON public.images
FOR DELETE USING (auth.uid()::text = user_id);
