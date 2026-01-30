# Database Migrations Required

## 1. Focus Groups → Group Chat Integration

Run this SQL in your Supabase SQL editor:

```sql
-- Add group_id column to focus_groups table
ALTER TABLE focus_groups 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_focus_groups_group_id ON focus_groups(group_id);
```

**What this does:**
- Links focus groups to their associated group chats
- When users join a focus group (status='active'), they're automatically added to the group chat
- When users leave a focus group, they're removed from the group chat

## 2. Conversations/Messaging Setup

Run this SQL in your Supabase SQL editor:

```sql
-- Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT different_users CHECK (user1_id <> user2_id),
  CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id)
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Ensure messages table has proper structure
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
```

**What this does:**
- Creates the conversations table to track 1-on-1 chats between users
- Sets up proper RLS policies so users can only see their own conversations
- Ensures messages table is properly linked to conversations

## What's Been Updated in the Code

### Focus Groups:
✅ **lib/supabase/admin.ts** - `createFocusGroup()` now auto-creates group chat
✅ **lib/supabase/mentor.ts** - `createMentorFocusGroup()` now auto-creates group chat
✅ **lib/supabase/focusgroups.ts** - `applyToFocusGroup()` auto-adds users to group chat
✅ **lib/supabase/focusgroups.ts** - `leaveFocusGroup()` removes users from group chat
✅ **app/focus-groups/[id]/page.tsx** - Shows group chat feed for active members
✅ **types/database.types.ts** - Added `group_id` field to focus_groups table

### Messaging:
✅ **lib/supabase/messages.ts** - `getConversations()` properly fetches conversations with user profiles
✅ **lib/supabase/messages.ts** - Already has `getOrCreateConversation()`, `getMessages()`, `sendMessage()`
✅ **app/messages/page.tsx** - Lists all conversations with last message preview
✅ **app/messages/[id]/page.tsx** - Individual chat view with real-time updates
✅ **types/database.types.ts** - Updated conversations table structure

## Testing Checklist

After running the migrations:

1. **Focus Groups:**
   - [ ] Create a new focus group as mentor/admin
   - [ ] Verify a group chat is automatically created
   - [ ] Join the focus group as a user
   - [ ] Verify you're automatically added to the group chat
   - [ ] Post in the group chat
   - [ ] Leave the focus group
   - [ ] Verify you're removed from the group chat

2. **Messaging:**
   - [ ] Visit someone's profile (when profile view is implemented)
   - [ ] Start a conversation
   - [ ] Send messages
   - [ ] Verify real-time message updates
   - [ ] Check messages list shows conversations with last message
   - [ ] Verify conversations are sorted by most recent

## Next Steps

1. **Run both SQL migrations** in Supabase SQL editor
2. **Test focus group creation** - Create a new focus group and verify the group chat is created
3. **Test messaging** - Start a conversation and send messages
4. **Implement "Message" button** on user profiles to start conversations
