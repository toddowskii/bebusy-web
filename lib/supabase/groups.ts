import { supabase } from './client';
import { Database } from '@/types/database.types';

/**
 * Create a new group
 */
export async function createGroup(name: string, description: string, isPrivate: boolean = false) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('groups')
    .insert({
      name,
      description,
      created_by: userId,
    } as any)
    .select()
    .single();

  if (error) throw error;

  // Add creator as member
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: (data as any).id,
      user_id: userId,
      role: 'admin'
    } as any);

  if (memberError) throw memberError;

  return data;
}

/**
 * Update a group
 */
export async function updateGroup(groupId: string, name: string, description: string) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('groups')
    .update({
      name,
      description,
    } as any)
    .eq('id', groupId)
    .eq('created_by', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all groups
 */
export async function fetchGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      profiles:created_by (
        id,
        username,
        full_name,
        avatar_url
      ),
      group_members (
        id
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch user's groups (groups they are a member of)
 */
export async function fetchUserGroups() {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) return [];

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      group_id,
      role,
      groups (
        *,
        profiles:created_by (
          id,
          username,
          full_name,
          avatar_url
        ),
        group_members (
          id
        )
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  
  return (data || []).map((item: any) => ({
    ...item.groups,
    user_role: item.role
  }));
}

/**
 * Get a single group by ID
 */
export async function getGroup(groupId: string) {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      profiles:created_by (
        id,
        username,
        full_name,
        avatar_url
      ),
      group_members (
        id,
        user_id,
        role
      )
    `)
    .eq('id', groupId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw error;
  }
  return data;
}

/**
 * Join a group
 */
export async function joinGroup(groupId: string) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: userId,
      role: 'member',
    } as any);

  if (error) throw error;
}

/**
 * Leave a group
 */
export async function leaveGroup(groupId: string) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Check if user is member of group
 */
export async function isMember(groupId: string) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) return false;

  const { data, error } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .maybeSingle();

  return !!data;
}

/**
 * Get group posts
 */
export async function getGroupPosts(groupId: string) {
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        likes (
          id,
          user_id
        ),
        comments (
          id
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (error) {
      // group_id column might not exist yet
      console.warn('Error fetching group posts:', error);
      return [];
    }

    if (userId && data) {
      const postsWithLikeStatus = (data as any[]).map((post: any) => ({
        ...post,
        is_liked: post.likes?.some((like: any) => like.user_id === userId) || false
      }));
      return postsWithLikeStatus;
    }

    return data || [];
  } catch (error) {
    console.warn('Error in getGroupPosts:', error);
    return [];
  }
}

/**
 * Create a post in a group
 */
export async function createGroupPost(groupId: string, content: string, imageUrl?: string) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      content,
      image_url: imageUrl,
      group_id: groupId,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}
