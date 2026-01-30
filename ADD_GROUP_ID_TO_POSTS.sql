-- Add group_id column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE CASCADE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON posts(group_id);

-- Add index for querying posts by group
CREATE INDEX IF NOT EXISTS idx_posts_group_created ON posts(group_id, created_at DESC);
