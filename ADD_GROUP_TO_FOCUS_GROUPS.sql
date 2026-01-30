-- Add group_id column to focus_groups table
ALTER TABLE focus_groups 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_focus_groups_group_id ON focus_groups(group_id);
