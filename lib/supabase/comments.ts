import { supabase } from './client';
import { Database } from '@/types/database.types';
import { sanitizePlainText } from '@/lib/security/sanitize';
import { validateContent } from '@/lib/security/moderation';
import { createNotification } from './notifications';

/**
 * Create a new comment on a post
 */
export async function createComment(postId: string, content: string) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Check if user is banned
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if ((profile as any)?.role === 'banned') {
    throw new Error('Your account has been banned. You cannot post comments.');
  }

  // Async profanity check (server-side or via moderation API)
  const { checkProfanity } = await import('@/lib/security/moderation')
  const profanity = await checkProfanity(content)
  if (profanity.isProfane) {
    console.log('Profanity detected in comment - applying automatic cleanup')
    content = profanity.cleaned
  }

  const sanitizedContent = sanitizePlainText(content);

  const { data, error} = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content: sanitizedContent
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

  // Get post author and create notification
  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single();

  if (post) {
    const { data: currentUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    await createNotification({
      userId: (post as any).user_id,
      type: 'comment',
      content: `${(currentUser as any)?.username || 'Someone'} commented on your post`,
      relatedId: postId,
    });
  }

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
      ),
      comment_likes (
        id,
        user_id
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Like a comment
 */
export async function likeComment(commentId: string) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('comment_likes')
    .insert({
      comment_id: commentId,
      user_id: userId
    } as any);

  if (error) throw error;
}

/**
 * Unlike a comment
 */
export async function unlikeComment(commentId: string) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('comment_likes')
    .delete()
    .eq('comment_id', commentId)
    .eq('user_id', userId);

  if (error) throw error;
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

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  const isAdmin = (profile as any)?.role === 'admin';

  // Verify user owns the comment or is admin
  if (!isAdmin) {
    const { data: comment } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if ((comment as any)?.user_id !== userId) {
      throw new Error('Unauthorized');
    }
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}

/**
 * Update a comment
 */
export async function updateComment(commentId: string, content: string) {
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

  // Async profanity check (auto-clean on match)
  const { checkProfanity } = await import('@/lib/security/moderation')
  const profanity = await checkProfanity(content)
  if (profanity.isProfane) {
    console.log('Profanity detected in comment update - applying automatic cleanup')
    content = profanity.cleaned
  }

  const sanitizedContent = sanitizePlainText(content);

  const { data, error } = await (supabase
    .from('comments') as any)
    .update({ content: sanitizedContent })
    .eq('id', commentId)
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
