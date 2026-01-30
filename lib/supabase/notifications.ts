import { supabase } from './client';
import { Database } from '@/types/database.types';

/**
 * Get notifications for current user
 */
export async function getNotifications() {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data || [];
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
