'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createGroup } from '@/lib/supabase/groups'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { TAG_OPTIONS } from '@/lib/tagCategories'
import TagPicker from '@/components/TagPicker'
import { ArrowLeft } from 'lucide-react'
import { AppLayout } from '@/components/AppLayout'
import toast from 'react-hot-toast'

export default function CreateGroupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        setLoadingProfile(true)
        const prof = await getCurrentProfile()
        setProfile(prof)
        if (prof && prof.role !== 'admin') {
          toast.error('Only admins can create groups')
          router.push('/')
          return
        }
      } catch (err) {
        // ignore
      } finally {
        setLoadingProfile(false)
      }
    }

    init()
  }, [])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (profile && profile.role !== 'admin') {
      toast.error('Only admins can create groups')
      return
    }

    if (!name.trim()) {
      toast.error('Group name is required')
      return
    }

    setCreating(true)
    try {
      const group = await createGroup(name.trim(), description.trim(), false, selectedTags)
      const groupId = (group as any)?.id

      if (!groupId) {
        toast.error('Group created but could not load it')
        router.push('/groups')
        return
      }

      toast.success('Group created!')
      router.push(`/groups/${groupId}`)
    } catch (error) {
      const err = error as any
      const message = err?.message || err?.error_description || err?.details || err?.hint
      console.error('Error creating group:', message || err, err)
      toast.error(message || 'Failed to create group')
    } finally {
      setCreating(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="animate-spin h-8 w-8 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <AppLayout>
      <main className="min-h-[70vh] flex items-start justify-center" style={{ paddingTop: '40px' }}>
        <div className="w-full max-w-[1100px] px-6 mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => router.back()} className="p-2 rounded-full transition-colors" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Create Group</h2>
          </div>

          <div className="rounded-[24px] border overflow-hidden shadow-md mx-auto" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Group Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter group name"
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-lg border focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                  required
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{name.length}/50</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this group about?"
                  maxLength={200}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors resize-none"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{description.length}/200</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Tags</label>
                <TagPicker value={selectedTags} onChange={setSelectedTags} options={TAG_OPTIONS} placeholder="Filter by tags (comma-separated) e.g. react, python, machine_learning" />
              </div>

              <div className="pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex gap-0">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-8 py-4 rounded-l-full text-base font-semibold"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating || !name.trim()}
                    className="flex-1 px-8 py-4 rounded-r-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg"
                  >
                    {creating ? 'Creating...' : 'Create Group'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
