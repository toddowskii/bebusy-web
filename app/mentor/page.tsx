'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isMentor, getMentorFocusGroups } from '@/lib/supabase/mentor'
import { ArrowLeft, Plus, Users, Calendar, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MentorDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [focusGroups, setFocusGroups] = useState<any[]>([])

  useEffect(() => {
    checkMentorAndLoadData()
  }, [])

  const checkMentorAndLoadData = async () => {
    try {
      const mentor = await isMentor()
      if (!mentor) {
        toast.error('Access denied: Mentors only')
        router.push('/')
        return
      }

      const groups = await getMentorFocusGroups()
      setFocusGroups(groups)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1200px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
              <p className="text-gray-400 mt-1">Manage your focus groups</p>
            </div>
          </div>

          <Link
            href="/mentor/create-focus-group"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold shadow-lg shadow-green-500/20"
          >
            <Plus className="w-5 h-5" />
            Create Focus Group
          </Link>
        </div>

        {/* Focus Groups */}
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold">My Focus Groups</h2>
            <p className="text-gray-400 text-sm mt-1">
              {focusGroups.length} focus group{focusGroups.length !== 1 ? 's' : ''}
            </p>
          </div>

          {focusGroups.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-4 text-5xl">🎯</div>
              <h3 className="text-xl font-semibold mb-2">No focus groups yet</h3>
              <p className="text-gray-500 mb-6">Create your first focus group to start mentoring</p>
              <Link
                href="/mentor/create-focus-group"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create Focus Group
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {focusGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-black border border-gray-800 rounded-lg p-6 hover:border-green-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{group.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{group.description}</p>
                    </div>
                    <Link
                      href={`/mentor/edit-focus-group/${group.id}`}
                      className="p-2 hover:bg-gray-900 rounded-lg transition-colors text-green-500"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">
                        {group.current_members} / {group.total_spots} members
                      </span>
                      {group.current_members >= group.total_spots && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">
                          Full
                        </span>
                      )}
                    </div>

                    {(group.start_date || group.end_date) && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>
                          {group.start_date && new Date(group.start_date).toLocaleDateString()}
                          {group.start_date && group.end_date && ' - '}
                          {group.end_date && new Date(group.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="text-xs text-gray-500">
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
