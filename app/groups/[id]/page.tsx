'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getGroup, isMember, joinGroup, leaveGroup, getGroupPosts } from '@/lib/supabase/groups'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { PostCard } from '@/components/PostCard'
import { ArrowLeft, Users, Settings } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AppLayout } from '@/components/AppLayout'

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string

  const [group, setGroup] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMemberOfGroup, setIsMemberOfGroup] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    loadGroup()
  }, [groupId])

  const loadGroup = async () => {
    setLoading(true)
    try {
      const currentProfile = await getCurrentProfile()
      setCurrentUser(currentProfile)

      const groupData = await getGroup(groupId)
      
      if (!groupData) {
        setLoading(false)
        toast.error('Group not found')
        router.push('/groups')
        return
      }
      
      setGroup(groupData as any)

      const memberStatus = await isMember(groupId)
      setIsMemberOfGroup(memberStatus)

      // Load posts
      const postsData = await getGroupPosts(groupId)
      setPosts(postsData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading group:', error)
      toast.error('Failed to load group')
      setLoading(false)
      router.push('/groups')
    }
  }

  const handleJoinLeave = async () => {
    if (!currentUser) return

    setIsJoining(true)
    try {
      if (isMemberOfGroup) {
        await leaveGroup(groupId)
        setIsMemberOfGroup(false)
        toast.success('Left group')
      } else {
        await joinGroup(groupId)
        setIsMemberOfGroup(true)
        toast.success('Joined group!')
        // Reload posts after joining
        const postsData = await getGroupPosts(groupId)
        setPosts(postsData)
      }
      // Update member count
      const groupData = await getGroup(groupId)
      setGroup(groupData)
    } catch (error) {
      console.error('Error toggling membership:', error)
      toast.error('Failed to update membership')
    } finally {
      setIsJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!group) return null

  const isCreator = currentUser?.id === group.created_by

  return (
    <AppLayout username={currentUser?.username}>
      {/* Header with Back Button */}
      <div className="flex items-center gap-3" style={{ marginBottom: '24px' }}>
        <button onClick={() => router.back()} className="p-2 hover:bg-[#1C1C1E] rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#ECEDEE]" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#ECEDEE]">{group.name}</h2>
          <p className="text-sm text-[#8E8E93]">{group.group_members?.length || 0} members</p>
        </div>
      </div>

      {/* Group Header Card */}
      <div className="bg-[#1C1C1E] rounded-[20px] border border-[#2C2C2E] overflow-hidden" style={{ marginBottom: '24px' }}>
        {/* Cover/Banner */}
        <div className="h-32 bg-gradient-to-r from-green-500/20 to-emerald-600/20 relative"></div>
        
        {/* Group Info */}
        <div style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '12px', paddingBottom: '20px' }}>
          {/* Icon & Action */}
          <div className="flex justify-between items-start -mt-12 mb-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center border-4 border-[#1C1C1E] ring-2 ring-[#2C2C2E] shadow-lg">
              <Users className="w-12 h-12 text-white" />
            </div>

            {/* Action Button */}
            {isCreator ? (
              <Link
                href={`/groups/${groupId}/edit`}
                className="mt-3 bg-[#2C2C2E] hover:bg-[#3C3C3E] rounded-full font-semibold transition-colors text-[#ECEDEE] flex items-center gap-2"
                style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '8px', paddingBottom: '8px' }}
              >
                <Settings className="w-4 h-4" />
                Edit Group
              </Link>
            ) : (
              <button
                onClick={handleJoinLeave}
                disabled={isJoining}
                className={`mt-3 rounded-full font-semibold transition-all ${
                  isMemberOfGroup
                    ? 'bg-[#2C2C2E] hover:bg-red-500/10 hover:border hover:border-red-500 text-[#ECEDEE] hover:text-red-500'
                    : 'bg-[#10B981] hover:bg-[#059669] text-white'
                }`}
                style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '8px', paddingBottom: '8px' }}
              >
                {isJoining ? '...' : isMemberOfGroup ? 'Leave' : 'Join'}
              </button>
            )}
          </div>

          {/* Name & Description */}
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-[#FFFFFF]">{group.name}</h1>
          </div>

          {/* Description */}
          {group.description && (
            <p className="mb-3 text-[#ECEDEE] whitespace-pre-wrap">{group.description}</p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-[#8E8E93] text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{group.group_members?.length || 0} members</span>
            </div>
            <span>·</span>
            <span>Created by @{group.profiles?.username}</span>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div>
        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2 text-[#ECEDEE]">No posts yet</h3>
            <p className="text-[#9BA1A6]">
              {isMemberOfGroup ? "Be the first to post in this group!" : "Join the group to see posts"}
            </p>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
