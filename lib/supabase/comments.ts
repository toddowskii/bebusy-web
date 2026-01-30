import { supabase } from './client';
import { Database } from '@/types/database.types';

/**
 * Create a new comment on a post
 */
export async function createComment(postId: string, content: string) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content
    } as any)
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get comments for a post
 */
export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Verify user owns the comment
  const { data: comment } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single();

  if ((comment as any)?.user_id !== userId) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}
