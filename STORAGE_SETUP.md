# Supabase Storage Setup

You need to create storage buckets in your Supabase dashboard before image uploads will work.

## Steps:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your BeBusy project
3. Go to **Storage** in the left sidebar
4. Create two new buckets:

### Bucket 1: `posts`
- **Name:** `posts`
- **Public:** ✅ Yes (make bucket public)
- **File size limit:** 5MB
- **Allowed MIME types:** image/jpeg, image/png, image/gif, image/webp

### Bucket 2: `avatars` (if not already created)
- **Name:** `avatars`
- **Public:** ✅ Yes (make bucket public)
- **File size limit:** 2MB
- **Allowed MIME types:** image/jpeg, image/png, image/webp

## RLS Policies for `posts` bucket:

After creating the bucket, go to **Policies** and add:

### Policy 1: Allow authenticated users to upload
```sql
CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts');
```

### Policy 2: Allow public read
```sql
CREATE POLICY "Public can view post images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts');
```

### Policy 3: Allow users to delete their own images
```sql
CREATE POLICY "Users can delete their own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Quick Setup via Supabase SQL Editor:

You can also run this SQL directly in the SQL Editor:

```sql
-- Create policies for posts bucket (assumes bucket already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for posts bucket
CREATE POLICY IF NOT EXISTS "Authenticated users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts');

CREATE POLICY IF NOT EXISTS "Public can view post images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posts');

CREATE POLICY IF NOT EXISTS "Users can delete their own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'posts');
```

## Verify Setup:

After setup, test by:
1. Creating a new post with an image
2. Check that image displays in feed
3. Try deleting the post (image should also be deleted from storage)

## Current Status:
- ✅ Code is ready (CreatePost.tsx has upload logic)
- ⏳ Storage bucket needs to be created in Supabase dashboard
- ⏳ RLS policies need to be configured
