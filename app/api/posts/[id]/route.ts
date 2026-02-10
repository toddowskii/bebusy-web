import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sanitizePlainText, containsScriptLike } from '@/lib/security/sanitize'

// DELETE handler: deletes a post if the requester owns it or is admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = (profile as any)?.role === 'admin'

    const clientToCheck = isAdmin
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      : supabase

    const { data: post } = await clientToCheck
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single()

    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    if (post.user_id !== user.id && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (isAdmin) {
      const supabaseAdmin2 = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      const { error } = await supabaseAdmin2.from('posts').delete().eq('id', postId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      const { error } = await supabase.from('posts').delete().eq('id', postId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in delete post API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH handler: updates a post's content (sanitizes and runs moderation)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = (profile as any)?.role === 'admin'

    const clientToCheck = isAdmin
      ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      : supabase

    const { data: post } = await clientToCheck
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single()

    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    if (post.user_id !== user.id && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const json = await request.json()
    const { content, image_url } = json

    if (containsScriptLike(content || '')) return NextResponse.json({ error: 'Scripts are not allowed in posts.' }, { status: 400 })

    const sanitized = sanitizePlainText(content || '')

    let finalContent = sanitized
    if (finalContent) {
      const { checkProfanity } = await import('@/lib/security/moderation')
      const result = await checkProfanity(finalContent)
      if (result.isProfane) finalContent = result.cleaned
    }

    // Do not allow updates that leave the post with only whitespace/newlines unless an image is provided
    if (!finalContent.trim() && (typeof image_url === 'undefined' || image_url === null)) {
      return NextResponse.json({ error: 'Post must include text or an image.' }, { status: 400 })
    }

    if (isAdmin) {
      const supabaseAdmin2 = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      const { data: updated, error: updateError } = await supabaseAdmin2
        .from('posts')
        .update({ content: finalContent, image_url: image_url === null ? null : image_url })
        .eq('id', postId)
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .single()

      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
      return NextResponse.json(updated)
    } else {
      const { data: updated, error: updateError } = await supabase
        .from('posts')
        .update({ content: finalContent, image_url: image_url === null ? null : image_url })
        .eq('id', postId)
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .single()

      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
      return NextResponse.json(updated)
    }
  } catch (err) {
    console.error('Error in PATCH post API:', err)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}
