'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchFocusGroups, fetchUserFocusGroups } from '@/lib/supabase/focusgroups'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { Target, Users, Calendar, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { AppLayout } from '@/components/AppLayout'

export default function FocusGroupsPage() {
  const router = useRouter()
  const [allFocusGroups, setAllFocusGroups] = useState<any[]>([])
  const [userFocusGroups, setUserFocusGroups] = useState<any[]>([])
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
        fetchFocusGroups(),
        fetchUserFocusGroups(),
        getCurrentProfile()
      ])
      setAllFocusGroups(allData)
      setUserFocusGroups(userData)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading focus groups:', error)
      toast.error('Failed to load focus groups')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBA'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const focusGroups = activeTab === 'explore' ? allFocusGroups : userFocusGroups

  return (
    <AppLayout username={profile?.username}>
      <div style={{ marginBottom: '24px' }}>
        <h2 className="text-2xl font-bold text-[#ECEDEE]">Focus Groups & Challenges</h2>
        <p className="text-sm text-[#9BA1A6]" style={{ marginTop: '8px' }}>Join exclusive mentorship programs</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2C2C2E]" style={{ marginBottom: '24px', gap: '24px' }}>
        <button
          onClick={() => setActiveTab('explore')}
          className={`text-sm font-medium transition-colors relative`}
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
          className={`text-sm font-medium transition-colors relative`}
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

      {/* Focus Groups List */}
      {focusGroups.length === 0 ? (
        <div className="p-12 text-center">
          <Target className="w-16 h-16 text-[#2D2D2D] mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-[#ECEDEE]">
            {activeTab === 'explore' ? 'No focus groups available' : 'Not in any focus groups'}
          </h3>
          <p className="text-[#9BA1A6]">
            {activeTab === 'explore' ? 'Check back soon for new opportunities!' : 'Join a focus group to get started!'}
          </p>
        </div>
      ) : (
        <div>
          {focusGroups.map((fg) => (
            <Link
              key={fg.id}
              href={`/focus-groups/${fg.id}`}
              className="block"
              style={{ marginBottom: '20px' }}
            >
              <div className="bg-[#1C1C1E] rounded-[20px] border border-[#2C2C2E] hover:bg-[#252527] transition-all cursor-pointer" style={{ padding: '20px' }}>
                <div className="flex items-start" style={{ gap: '20px' }}>
                  {/* Mentor Avatar */}
                  {fg.mentor_image_url ? (
                    <img
                      src={fg.mentor_image_url}
                      alt={fg.mentor_name}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-[#10B981]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl ring-2 ring-[#10B981]">
                      {fg.mentor_name[0]}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-[#FFFFFF]" style={{ marginBottom: '8px' }}>{fg.title}</h3>
                    <p className="text-[#9BA1A6] text-sm line-clamp-2" style={{ marginBottom: '12px' }}>{fg.description}</p>
                    
                    {/* Mentor Info */}
                    <div className="flex items-center" style={{ gap: '8px', marginBottom: '16px' }}>
                      <span className="text-sm font-medium text-[#10B981]">{fg.mentor_name}</span>
                      <span className="text-[#4D4D4D]">·</span>
                      <span className="text-sm text-[#9BA1A6]">{fg.mentor_role}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center text-sm text-[#8E8E93]" style={{ gap: '16px' }}>
                      <div className="flex items-center" style={{ gap: '6px' }}>
                        <Users className="w-4 h-4" />
                        <span>{fg.total_spots - fg.available_spots}/{fg.total_spots} spots filled</span>
                      </div>
                      {fg.start_date && (
                        <>
                          <span className="text-[#4D4D4D]">|</span>
                          <div className="flex items-center" style={{ gap: '6px' }}>
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(fg.start_date)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Status Badge */}
                    {fg.is_full ? (
                      <div className="inline-flex items-center rounded-full text-xs font-medium" style={{ gap: '6px', marginTop: '16px', paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
                        <Clock className="w-3.5 h-3.5" />
                        Waitlist Available
                      </div>
                    ) : (
                      <div className="inline-flex items-center rounded-full text-xs font-medium" style={{ gap: '6px', marginTop: '16px', paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                        <Target className="w-3.5 h-3.5" />
                        {fg.available_spots} spots available
                      </div>
                    )}
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
