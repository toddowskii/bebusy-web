-- Add cover_url column to profiles table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qxmzaitokuygenbsqhql/sql/new

ALTER TABLE profiles
ADD COLUMN cover_url TEXT;

-- Add comment to column
COMMENT ON COLUMN profiles.cover_url IS 'URL to user profile cover/banner image';
