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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', paddingLeft: '20px', paddingRight: '20px', paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="w-full max-w-none">
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 rounded-full transition-colors" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Create Group</h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 font-semibold rounded-full"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', paddingLeft: '24px', paddingRight: '24px', paddingTop: '10px', paddingBottom: '10px' }}
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={creating || !name.trim()}
                className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-full disabled:opacity-50 transition-all"
                style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '10px', paddingBottom: '10px' }}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-[20px] border" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-semibold" style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Group Details</h3>

              {/* Group Name */}
              <div style={{ marginBottom: '20px' }}>
                <label className="block text-sm font-medium" style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Group Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter group name"
                  maxLength={50}
                  className="w-full rounded-xl border focus:border-[#10B981] focus:outline-none transition-colors"
                  style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                  required
                />
                <p className="text-xs" style={{ marginTop: '4px', color: 'var(--text-muted)' }}>{name.length}/50</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium" style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this group about?"
                  maxLength={200}
                  rows={4}
                  className="w-full rounded-xl border focus:border-[#10B981] focus:outline-none transition-colors resize-none"
                  style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                />
                <p className="text-xs" style={{ marginTop: '4px', color: 'var(--text-muted)' }}>{description.length}/200</p>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label className="block text-sm font-medium" style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Tags</label>
                <TagPicker value={selectedTags} onChange={setSelectedTags} options={TAG_OPTIONS} placeholder="Filter by tags (comma-separated) e.g. react, python, machine_learning" />
              </div>
            </div>


          </form>
        </div>
      </div>
    </AppLayout>
  )
}
