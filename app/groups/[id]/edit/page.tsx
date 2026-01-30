'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getGroup, updateGroup } from '@/lib/supabase/groups'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditGroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadGroup()
  }, [groupId])

  const loadGroup = async () => {
    setLoading(true)
    try {
      const [currentProfile, groupData] = await Promise.all([
        getCurrentProfile(),
        getGroup(groupId)
      ])

      if (!groupData) {
        toast.error('Group not found')
        router.push('/groups')
        return
      }

      // Check if user is the creator
      if ((groupData as any).created_by !== currentProfile?.id) {
        toast.error('Only the group creator can edit')
        router.push(`/groups/${groupId}`)
        return
      }

      setName((groupData as any).name)
      setDescription((groupData as any).description || '')
      setLoading(false)
    } catch (error) {
      console.error('Error loading group:', error)
      toast.error('Failed to load group')
      router.push('/groups')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Group name is required')
      return
    }

    setSaving(true)
    try {
      await updateGroup(groupId, name.trim(), description.trim())
      toast.success('Group updated!')
      router.push(`/groups/${groupId}`)
    } catch (error) {
      console.error('Error updating group:', error)
      toast.error('Failed to update group')
    } finally {
      setSaving(false)
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
      <div className="max-w-[600px] mx-auto border-x border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-gray-800 p-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-900 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">Edit Group</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving || !name.trim()}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-green-500/20"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Group Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              maxLength={50}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
              required
            />
            <p className="text-xs text-gray-600 mt-1">{name.length}/50</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              maxLength={200}
              rows={4}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors resize-none"
            />
            <p className="text-xs text-gray-600 mt-1">{description.length}/200</p>
          </div>
        </form>
      </div>
    </div>
  )
}
