-- Create conversations table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qxmzaitokuygenbsqhql/sql/new

CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user1_id, user2_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS conversations_user1_id_idx ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS conversations_user2_id_idx ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON conversations(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
