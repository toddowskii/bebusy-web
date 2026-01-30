'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { getComments, createComment, deleteComment } from '@/lib/supabase/comments'
import { likePost, unlikePost } from '@/lib/supabase/posts'
import { ArrowLeft, Heart, MessageCircle, Share2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    loadPost()
  }, [postId])

  const loadPost = async () => {
    setLoading(true)
    try {
      const currentProfile = await getCurrentProfile()
      setCurrentUser(currentProfile)

      // Fetch post
      const { data: postData, error } = await supabase
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
          )
        `)
        .eq('id', postId)
        .single()

      if (error || !postData) {
        toast.error('Post not found')
        router.push('/')
        return
      }

      setPost(postData as any)
      setLikeCount((postData as any).likes.length)
      setIsLiked((postData as any).likes?.some((like: any) => like.user_id === currentProfile?.id) || false)

      // Fetch comments
      const commentsData = await getComments(postId)
      setComments(commentsData)
    } catch (error) {
      console.error('Error loading post:', error)
      toast.error('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!currentUser) return

    const previousState = { isLiked, likeCount }
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)

    try {
      if (isLiked) {
        await unlikePost(postId)
      } else {
        await likePost(postId)
      }
    } catch (error) {
      setIsLiked(previousState.isLiked)
      setLikeCount(previousState.likeCount)
      toast.error('Failed to update like')
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return

    setSubmitting(true)
    try {
      const comment = await createComment(postId, newComment.trim())
      setComments([...comments, comment])
      setNewComment('')
      toast.success('Comment added!')
    } catch (error) {
      console.error('Error creating comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId)
      setComments(comments.filter(c => c.id !== commentId))
      toast.success('Comment deleted')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[600px] mx-auto border-x border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-gray-800 p-4 z-10 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-900 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Post</h2>
        </div>

        {/* Post */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-3 mb-4">
            <Link href={`/profile/${post.profiles.username}`}>
              {post.profiles.avatar_url ? (
                <img
                  src={post.profiles.avatar_url}
                  alt={post.profiles.username}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-800"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-gray-800">
                  {post.profiles.username[0].toUpperCase()}
                </div>
              )}
            </Link>
            <div>
              <Link href={`/profile/${post.profiles.username}`} className="font-bold hover:underline">
                {post.profiles.full_name || post.profiles.username}
              </Link>
              <Link href={`/profile/${post.profiles.username}`} className="block text-gray-500 text-sm hover:underline">
                @{post.profiles.username}
              </Link>
            </div>
          </div>

          <p className="text-xl whitespace-pre-wrap mb-4">{post.content}</p>

          {post.image_url && (
            <div className="mb-4 rounded-2xl overflow-hidden border border-gray-700">
              <img src={post.image_url} alt="Post image" className="w-full h-auto object-cover" />
            </div>
          )}

          <p className="text-gray-500 text-sm mb-4">{formatDate(post.created_at)}</p>

          <div className="flex items-center gap-4 py-3 border-y border-gray-800 mb-3">
            <div className="flex items-center gap-1">
              <span className="font-bold">{likeCount}</span>
              <span className="text-gray-500">Likes</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold">{comments.length}</span>
              <span className="text-gray-500">Comments</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-all group ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <div className={`p-2 rounded-full transition-all ${
                isLiked ? 'bg-red-500/10' : 'group-hover:bg-red-500/10'
              }`}>
                <Heart className={`w-5 h-5 transition-all ${isLiked ? 'fill-current scale-110' : ''}`} />
              </div>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-all">
                <MessageCircle className="w-5 h-5" />
              </div>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-all">
                <Share2 className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>

        {/* Comment Form */}
        {currentUser && (
          <form onSubmit={handleSubmitComment} className="p-4 border-b border-gray-800">
            <div className="flex gap-3">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.username}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-800"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-gray-800">
                  {currentUser.username[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Post your reply"
                  className="w-full bg-transparent text-white text-lg placeholder-gray-600 outline-none resize-none min-h-[60px]"
                  disabled={submitting}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-green-500/20"
                  >
                    {submitting ? 'Replying...' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comments */}
        <div>
          {comments.length === 0 ? (
            <div className="p-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">No comments yet. Be the first to reply!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-4 border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
                <div className="flex gap-3">
                  <Link href={`/profile/${comment.profiles.username}`}>
                    {comment.profiles.avatar_url ? (
                      <img
                        src={comment.profiles.avatar_url}
                        alt={comment.profiles.username}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-800"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold ring-2 ring-gray-800">
                        {comment.profiles.username[0].toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/profile/${comment.profiles.username}`} className="font-bold hover:underline">
                        {comment.profiles.full_name || comment.profiles.username}
                      </Link>
                      <Link href={`/profile/${comment.profiles.username}`} className="text-gray-500 text-sm hover:underline">
                        @{comment.profiles.username}
                      </Link>
                      <span className="text-gray-600">·</span>
                      <span className="text-gray-500 text-sm">
                        {formatDate(comment.created_at)}
                      </span>
                      {currentUser?.id === comment.user_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="ml-auto p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-white whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
