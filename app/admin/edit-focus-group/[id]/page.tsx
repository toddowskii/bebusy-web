'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { updateFocusGroup, deleteFocusGroup } from '@/lib/supabase/admin'
import { getFocusGroup } from '@/lib/supabase/focusgroups'
import { ArrowLeft, Calendar, Users, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AppLayout } from '@/components/AppLayout'

export default function EditFocusGroupPage() {
  const router = useRouter()
  const params = useParams() as { id?: string }
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mentorName, setMentorName] = useState('')
  const [mentorRole, setMentorRole] = useState('')
  const [totalSpots, setTotalSpots] = useState(10)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!params?.id) return
    loadFocusGroup()
  }, [params?.id])

  const loadFocusGroup = async () => {
    try {
      if (!params?.id) return
      const group = await getFocusGroup(params.id)
      if (!group) {
        toast.error('Focus group not found')
        router.push('/admin')
        return
      }

      setTitle((group as any).title)
      setDescription((group as any).description || '')
      setMentorName((group as any).mentor_name || '')
      setMentorRole((group as any).mentor_role || '')
      setTotalSpots((group as any).total_spots)
      setStartDate((group as any).start_date || '')
      setEndDate((group as any).end_date || '')
    } catch (error) {
      console.error('Error loading focus group:', error)
      toast.error('Failed to load focus group')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim() || !mentorName.trim() || !mentorRole.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setUpdating(true)
    try {
      if (!params?.id) {
        toast.error('Missing group id')
        return
      }

      await updateFocusGroup(params.id, {        title: title.trim(),
        description: description.trim(),
        mentor_name: mentorName.trim(),
        mentor_role: mentorRole.trim(),
        total_spots: totalSpots,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      } as any)

      toast.success('Focus group updated successfully!')
      router.push('/admin')
    } catch (error) {
      console.error('Error updating focus group:', error)
      toast.error('Failed to update focus group')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this focus group? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      if (!params?.id) { toast.error('Missing group id'); return }
      await deleteFocusGroup(params.id)
      toast.success('Focus group deleted successfully!')
      router.push('/admin')
    } catch (error) {
      console.error('Error deleting focus group:', error)
      toast.error('Failed to delete focus group')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    )
  }

return (
    <AppLayout>
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', paddingLeft: '20px', paddingRight: '20px'}}>
        <div className="w-full max-w-none">
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 rounded-full transition-colors" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Edit Focus Group</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Update your mentorship program</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 font-semibold rounded-full"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' , paddingLeft: '24px', paddingRight: '24px', paddingTop: '10px', paddingBottom: '10px' }}
              >
                Cancel
              </button>
              <button
                onClick={(e) => handleSubmit(e)}
                disabled={updating}
                className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-full disabled:opacity-50 transition-all"
                style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '10px', paddingBottom: '10px' }}
              >
                {updating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div> 

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-[20px] border" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            {/* Title */}
            <div>
              <label className="block text-sm font-medium" style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="30-Day Startup Challenge"
                maxLength={100}
                className="w-full rounded-xl border focus:border-[#10B981] focus:outline-none transition-colors"
                style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                required
              />
              <p className="text-xs" style={{ marginTop: '4px', color: 'var(--text-muted)' }}>{title.length}/100</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium" style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Learn how to validate your startup idea and build an MVP in 30 days..."
                maxLength={500}
                rows={4}
                className="w-full rounded-xl border focus:border-[#10B981] focus:outline-none transition-colors resize-none"
                style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                required
              />
              <p className="text-xs" style={{ marginTop: '4px', color: 'var(--text-muted)' }}>{description.length}/500</p>
            </div>

            {/* Mentor Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium" style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Your Name *</label>
                <input
                  type="text"
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border focus:border-[#10B981] focus:outline-none transition-colors"
                  style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium" style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Your Role *</label>
                <input
                  type="text"
                  value={mentorRole}
                  onChange={(e) => setMentorRole(e.target.value)}
                  placeholder="Founder & CEO"
                  className="w-full rounded-xl border focus:border-[#10B981] focus:outline-none transition-colors"
                  style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                  required
                />
              </div>
            </div>

            {/* Total Spots */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Spots *
              </label>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <input
                  type="number"
                  value={totalSpots}
                  onChange={(e) => setTotalSpots(parseInt(e.target.value) || 0)}
                  min={1}
                  max={100}
                  className="flex-1 rounded-xl border focus:border-[#10B981] focus:outline-none transition-colors"
                  style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                  required
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 rounded-xl border focus:border-[#10B981] focus:outline-none transition-colors"
                    style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="flex-1 rounded-xl border focus:border-[#10B981] focus:outline-none transition-colors"
                    style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                  />
                </div>
              </div>
            </div>
          </div>
          <br />
          {/* Danger Zone */}
          <div className="rounded-[20px] border" style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold text-red-400" style={{ marginBottom: '12px' }}>Danger Zone</h3>
            <p className="text-sm" style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>
              This action cannot be undone. All members will be removed from the focus group.
            </p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 border border-red-500/40 text-red-400 hover:text-red-300 disabled:opacity-50"
              style={{ paddingTop: '12px', paddingBottom: '12px', backgroundColor: 'var(--bg-tertiary)' }}
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete Focus Group'}
            </button>
          </div>
        </form>
      </div>
      </div>
      </div>
  </AppLayout>
  )
}
