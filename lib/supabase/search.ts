import { supabase } from './client';

/**
 * Search for users by username, full name, or bio
 */
export async function searchUsers(query: string) {
  try {
    const searchTerm = `${query}%`;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, role')
      .or(`username.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
      .neq('role', 'banned')
      .limit(20);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchUsers:', error);
    return [];
  }
}

/**
 * Search for posts by content
 */
export async function searchPosts(query: string, currentUserId?: string) {
  try {
    const searchTerm = `%${query}%`;
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url,
          role
        ),
        likes (
          id,
          user_id
        ),
        comments (
          id
        )
      `)
      .ilike('content', searchTerm)
      .is('group_id', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error searching posts:', error);
      return [];
    }

    // Add is_liked status if user is logged in
    if (currentUserId && data) {
      const postsWithLikeStatus = data.map((post: any) => ({
        ...post,
        is_liked: post.likes?.some((like: any) => like.user_id === currentUserId) || false
      }));
      return postsWithLikeStatus;
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchPosts:', error);
    return [];
  }
}

/**
 * Search for groups by name or description
 */
export async function searchGroups(query: string) {
  try {
    const searchTerm = `${query}%`;
    
    const { data, error } = await supabase
      .from('groups')
      .select('id, name, description, members_count, created_at')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(20);

    if (error) {
      console.error('Error searching groups:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchGroups:', error);
    return [];
  }
}
