import { supabase } from './client';
import { Database } from '@/types/database.types';

/**
 * Get notifications for current user with profiles and posts
 */
export async function getNotifications() {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) {
      return [];
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    if (!notifications || notifications.length === 0) {
      return [];
    }

    // Fetch profiles for all from_user_ids
    const fromUserIds = [...new Set(notifications.map(n => (n as any).from_user_id).filter(Boolean))];
    
    if (fromUserIds.length === 0) {
      return notifications.map((n: any) => ({ ...(n as any), profiles: null, posts: null }));
    }
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', fromUserIds);

    // Fetch posts for all related_ids where type is like or comment
    const postIds = [...new Set(notifications
      .filter(n => ((n as any).type === 'like' || (n as any).type === 'comment') && (n as any).related_id)
      .map(n => (n as any).related_id))];
    
    const { data: posts } = postIds.length > 0 
      ? await supabase
          .from('posts')
          .select('id, content')
          .in('id', postIds)
      : { data: [] };

    // Combine the data
    const profilesMap = new Map(((profiles as any[]) || []).map(p => [p.id, p]));
    const postsMap = new Map(((posts as any[]) || []).map(p => [p.id, p]));

    return notifications.map((n: any) => ({
      ...(n as any),
      profiles: profilesMap.get((n as any).from_user_id),
      posts: postsMap.get((n as any).related_id),
    }));
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
  const { error } = await (supabase
    .from('notifications') as any)
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount() {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) {
      return 0;
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getUnreadNotificationCount:', error);
    return 0;
  }
}

/**
 * Create a notification
 */
export async function createNotification({
  userId,
  type,
  content,
  relatedId,
}: {
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  content: string;
  relatedId?: string;
}) {
  try {
    const { data: session } = await supabase.auth.getSession();
    const currentUserId = session?.session?.user?.id;

    // Don't create notification for own actions
    if (currentUserId === userId) {
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        from_user_id: currentUserId,
        type,
        content,
        related_id: relatedId || null,
        is_read: false,
      } as any);

    if (error) {
      console.error('Error creating notification:', error);
    }
  } catch (error) {
    console.error('Error in createNotification:', error);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { error } = await (supabase
    .from('notifications') as any)
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) return 0;
  return count || 0;
}
