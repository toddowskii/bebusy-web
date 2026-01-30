'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchGroups, fetchUserGroups } from '@/lib/supabase/groups'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { Users, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { AppLayout } from '@/components/AppLayout'

export default function GroupsPage() {
  const router = useRouter()
  const [allGroups, setAllGroups] = useState<any[]>([])
  const [userGroups, setUserGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'explore' | 'yours'>('explore')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [allData, userData, userProfile] = await Promise.all([
        fetchGroups(),
        fetchUserGroups(),
        getCurrentProfile()
      ])
      setAllGroups(allData)
      setUserGroups(userData)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const groups = activeTab === 'explore' ? allGroups : userGroups

  return (
    <AppLayout username={profile?.username}>
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <h2 className="text-2xl font-bold text-[#ECEDEE]">Groups</h2>
        <button
          onClick={() => router.push('/groups/create')}
          className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center hover:bg-[#059669] transition-all shadow-lg"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2C2C2E]" style={{ marginBottom: '24px', gap: '24px' }}>
        <button
          onClick={() => setActiveTab('explore')}
          className="text-sm font-medium transition-colors relative"
          style={{ 
            paddingBottom: '12px',
            color: activeTab === 'explore' ? '#10B981' : '#9BA1A6'
          }}
        >
          Explore
          {activeTab === 'explore' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('yours')}
          className="text-sm font-medium transition-colors relative"
          style={{ 
            paddingBottom: '12px',
            color: activeTab === 'yours' ? '#10B981' : '#9BA1A6'
          }}
        >
          Your Groups
          {activeTab === 'yours' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981]" />
          )}
        </button>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <div className="p-12 text-center">
          <Users className="w-16 h-16 text-[#2D2D2D] mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-[#ECEDEE]">
            {activeTab === 'explore' ? 'No groups yet' : 'Not in any groups'}
          </h3>
          <p className="text-[#9BA1A6] mb-4">
            {activeTab === 'explore' ? 'Create the first group to get started!' : 'Join a group to get started!'}
          </p>
          {activeTab === 'explore' && (
            <button
              onClick={() => router.push('/groups/create')}
              className="px-6 py-3 bg-[#10B981] text-white font-semibold rounded-full hover:bg-[#059669] transition-all"
            >
              Create Group
            </button>
          )}
        </div>
      ) : (
        <div>
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="block"
              style={{ marginBottom: '16px' }}
            >
              <div className="bg-[#1C1C1E] rounded-[20px] p-4 border border-[#2C2C2E] hover:bg-[#252527] transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1 text-[#FFFFFF]">{group.name}</h3>
                    <p className="text-[#9BA1A6] text-sm mb-2 line-clamp-2">{group.description}</p>
                    <div className="flex items-center gap-3 text-sm text-[#8E8E93]">
                      <span>{group.group_members.length} members</span>
                      <span>·</span>
                      <span>Created by @{group.profiles.username}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
