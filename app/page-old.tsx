'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Home, Users, MessageSquare, Bell, User, Target, Shield, Award } from 'lucide-react'
import { fetchPosts } from '@/lib/supabase/posts'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { CreatePost } from '@/components/CreatePost'
import { PostCard } from '@/components/PostCard'
import { FeedSkeleton } from '@/components/PostSkeleton'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      
      if (data.user) {
        const userProfile = await getCurrentProfile()
        setProfile(userProfile)
      }
      
      setLoading(false)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!loading) {
      loadPosts()
    }
  }, [loading])

  const loadPosts = async () => {
    setLoadingPosts(true)
    try {
      const { posts: fetchedPosts } = await fetchPosts()
      setPosts(fetchedPosts || [])
    } catch (error) {
      console.error('Error loading posts:', error)
      setPosts([])
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Clear session cookie
    document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Be<span className="text-[#10B981]">Busy</span>
          </h1>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <div className="flex max-w-7xl mx-auto">
          {/* Sidebar */}
          <aside className="w-64 border-r border-gray-800 p-4 hidden lg:block sticky top-16 h-[calc(100vh-4rem)]">
            <nav className="space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/20"
              >
                <Home className="h-5 w-5" />
                Home
              </Link>
              <Link
                href="/groups"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-900 text-gray-400 hover:text-white transition-all"
              >
                <Users className="h-5 w-5" />
                Groups
              </Link>
              <Link
                href="/focus-groups"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-900 text-gray-400 hover:text-white transition-all"
              >
                <Target className="h-5 w-5" />
                Focus Groups
              </Link>
              <Link
                href="/messages"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-900 text-gray-400 hover:text-white transition-all"
              >
                <MessageSquare className="h-5 w-5" />
                Messages
              </Link>
              <Link
                href="/notifications"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-900 text-gray-400 hover:text-white transition-all"
              >
                <Bell className="h-5 w-5" />
                Notifications
              </Link>
              <Link
                href={profile ? `/profile/${profile.username}` : '#'}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-900 text-gray-400 hover:text-white transition-all"
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
              {(profile?.role === 'mentor' || profile?.role === 'admin') && (
                <Link
                  href="/mentor"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-900 text-gray-400 hover:text-white transition-all border border-green-800/50"
                >
                  <Award className="h-5 w-5 text-green-500" />
                  <span>Mentor Dashboard</span>
                </Link>
              )}
              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-900 text-gray-400 hover:text-white transition-all border border-purple-800/50"
                >
                  <Shield className="h-5 w-5 text-purple-500" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-h-screen border-x border-gray-800 max-w-[600px]">
            {/* Header */}
            <div className="sticky top-16 bg-black/95 backdrop-blur-md border-b border-gray-800 p-4 z-10">
              <h2 className="text-xl font-bold">Home</h2>
            </div>

            {/* Create Post */}
            {profile && (
              <CreatePost 
                userAvatar={profile.avatar_url}
                username={profile.username}
                onPostCreated={loadPosts}
              />
            )}

            {/* Feed */}
            {loadingPosts ? (
              <FeedSkeleton />
            ) : posts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mb-4 text-5xl">📝</div>
                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                <p className="text-gray-500">Be the first to share something!</p>
              </div>
            ) : (
              <div>
                {posts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar - Suggestions/Trends (Optional) */}
          <aside className="w-80 p-4 hidden xl:block sticky top-16 h-[calc(100vh-4rem)]">
            <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800">
              <h3 className="font-bold text-lg mb-4">What's happening</h3>
              <div className="space-y-4">
                <div className="hover:bg-gray-800/50 p-3 rounded-xl transition-colors cursor-pointer">
                  <p className="text-gray-500 text-xs mb-1">Trending</p>
                  <p className="font-semibold text-sm">#BeBusy</p>
                  <p className="text-gray-500 text-xs mt-1">1,234 posts</p>
                </div>
                <div className="hover:bg-gray-800/50 p-3 rounded-xl transition-colors cursor-pointer">
                  <p className="text-gray-500 text-xs mb-1">Technology</p>
                  <p className="font-semibold text-sm">#WebDev</p>
                  <p className="text-gray-500 text-xs mt-1">890 posts</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
