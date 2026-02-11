import { supabase } from './client';
import { Database } from '@/types/database.types';
import { createNotification } from './notifications';
import { sanitizePlainText, containsScriptLike } from '@/lib/security/sanitize';
import { validateContent } from '@/lib/security/moderation';

type Post = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];

export interface PostWithProfile extends Post {
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: string | null;
  };
  user_has_liked?: boolean;
}

/**
 * Fetch posts for the feed with user profiles. Includes group posts for groups the
 * current user is a member of (members-only groups will not be shown to non-members).
 */
export async function fetchPosts(limit: number = 20, offset: number = 0) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  const select = `
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
    ),
    groups:group_id (
      id,
      name
    )
  `;

  try {
    // Fetch public posts (not in groups)
    const { data: publicPosts, error: publicError } = await supabase
      .from('posts')
      .select(select)
      .is('group_id', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (publicError) {
      console.error('Error fetching public posts:', publicError);
      return { posts: [], error: publicError };
    }

    let combined: any[] = (publicPosts as any[]) || [];

    // If user is authenticated, also fetch posts from groups they are a member of
    if (userId) {
      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      const groupIds = (memberships || []).map((m: any) => m.group_id).filter(Boolean);

      if (groupIds.length > 0) {
        const { data: groupPosts, error: groupError } = await supabase
          .from('posts')
          .select(select)
          .in('group_id', groupIds)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (groupError) {
          console.warn('Error fetching group posts for feed:', groupError);
        } else {
          combined = combined.concat((groupPosts as any[]) || []);
        }
      }
    }

    // Deduplicate, sort, and apply pagination
    const map = new Map<string, any>();
    (combined || []).forEach((p: any) => {
      if (p && !map.has(p.id)) map.set(p.id, p);
    });

    const allPosts = Array.from(map.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const sliced = allPosts.slice(offset, offset + limit);

    // Attach like status
    if (userId && sliced.length > 0) {
      const postsWithLikeStatus = sliced.map((post: any) => ({
        ...post,
        is_liked: post.likes?.some((like: any) => like.user_id === userId) || false
      }));

      // Filter out posts without valid profiles
      const validPosts = postsWithLikeStatus.filter((p: any) => p.profiles) || [];

      return { posts: validPosts as any[], error: null };
    }

    const validPosts = sliced.filter((p: any) => p.profiles) || [];
    return { posts: validPosts as any[], error: null };
  } catch (error) {
    console.error('Error in fetchPosts:', error);
    return { posts: [], error };
  }
}

/**
 * Create a new post
 */
export async function createPost(content: string, imageUrl?: string | null, groupId?: string | null) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    return { data: null, error: new Error('User not authenticated') };
  }

  // Check if user is banned
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if ((profile as any)?.role === 'banned') {
    return { data: null, error: new Error('Your account has been banned. You cannot create posts.') };
  }

  if (containsScriptLike(content)) {
    return { data: null, error: new Error('Scripts are not allowed in posts.') };
  }

  let sanitizedContent = sanitizePlainText(content);

  // Reject posts that contain only whitespace/newlines (allow if there's an image)
  if (!sanitizedContent.trim() && !imageUrl) {
    return { data: null, error: new Error('Post must include text or an image.') };
  }

  if (sanitizedContent) {
    // Run async profanity check (server-side or via moderation API)
    const { checkProfanity } = await import('@/lib/security/moderation')
    const result = await checkProfanity(sanitizedContent)
    if (result.isProfane) {
      // Auto-clean profane words and proceed with cleaned content
      console.log('Profanity detected - applying automatic cleanup')
      sanitizedContent = result.cleaned
    }
  }

  // If this is a group post, ensure the user is a member of that group
  if (groupId) {
    const { data: membership } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!membership) {
      return { data: null, error: new Error('You must be a member of the group to post.') };
    }
  }

  // If profanity was detected, use the cleaned content before inserting
  const newPost: PostInsert = {
    user_id: userId,
    content: sanitizedContent,
    image_url: imageUrl || undefined,
    group_id: groupId || undefined,
  };

  const { data, error } = await supabase
    .from('posts')
    .insert(newPost as any)
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return { data: null, error };
  }

  // Indicate if content was auto-cleaned by moderation
  const wasCleaned = sanitizedContent !== sanitizePlainText(content);

  return { data: data as PostWithProfile, error: null, cleaned: wasCleaned } as any;
}

/**
 * Like a post
 */
export async function likePost(postId: string) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    return { error: new Error('User not authenticated') };
  }

  const { error } = await supabase
    .from('likes')
    .insert({ post_id: postId, user_id: userId } as any);

  if (error) {
    console.error('Error liking post:', error);
    return { error };
  }

  // Get post author and create notification
  const { data: post } = await supabase
    .from('posts')
    .select('user_id, content')
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
      type: 'like',
      content: `${(currentUser as any)?.username || 'Someone'} liked your post`,
      relatedId: postId,
    });
  }

  return { error: null };
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: string) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  if (!userId) {
    return { error: new Error('User not authenticated') };
  }

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error unliking post:', error);
    return { error };
  }

  return { error: null };
}

/**
 * Get a single post by ID
 */
export async function getPostById(postId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq('id', postId)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return { data: null, error };
  }

  return { data: data as PostWithProfile, error: null };
}

/**
 * Delete a post
 */
export async function deletePost(postId: string) {
  try {
    // Get current user's session token
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { error: new Error('Not authenticated') }
    }

    // Call the API route which has access to service role key
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const data = await response.json()
      return { error: new Error(data.error || 'Failed to delete post') }
    }

    return { error: null }
  } catch (error) {
    console.error('Error deleting post:', error)
    return { error: error as Error }
  }
}

/**
 * Update a post's content (and optionally image_url)
 */
export async function updatePost(postId: string, content: string, imageUrl?: string | null) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { data: null, error: new Error('Not authenticated') }

    const body: any = { content }
    if (typeof imageUrl !== 'undefined') body.image_url = imageUrl

    const response = await fetch(`/api/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    // Guard against empty or non-JSON responses (avoids "Unexpected end of JSON input")
    let data: any = null
    try {
      const text = await response.text()
      data = text ? JSON.parse(text) : null
    } catch (err) {
      console.warn('updatePost: failed to parse JSON response', err)
      data = null
    }

    if (!response.ok) {
      const errMsg = (data && (data.error || (data.message || null))) || `Failed to update post (${response.status})`
      return { data: null, error: new Error(errMsg) }
    }

    return { data: data as any, error: null }
  } catch (error) {
    console.error('Error updating post:', error)
    return { data: null, error }
  }
}
