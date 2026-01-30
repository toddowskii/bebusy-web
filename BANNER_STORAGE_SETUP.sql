-- Run this in Supabase SQL Editor to set up banner/cover image storage
-- Go to: https://supabase.com/dashboard/project/qxmzaitokuygenbsqhql/sql/new

-- Create banners storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for banners bucket

-- Allow anyone to view banners (public access)
CREATE POLICY "Public banners are accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'banners');

-- Allow authenticated users to upload banners
CREATE POLICY "Authenticated users can upload banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'banners');

-- Allow authenticated users to update banners
CREATE POLICY "Authenticated users can update banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'banners');

-- Allow authenticated users to delete banners
CREATE POLICY "Authenticated users can delete banners"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'banners');
