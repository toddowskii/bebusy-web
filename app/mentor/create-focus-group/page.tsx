'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createMentorFocusGroup } from '@/lib/supabase/mentor'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { TAG_OPTIONS } from '@/lib/tagCategories'
import TagPicker from '@/components/TagPicker'
import { ArrowLeft, Calendar, Users } from 'lucide-react'
import { AppLayout } from '@/components/AppLayout'
import toast from 'react-hot-toast'

export default function MentorCreateFocusGroupPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mentorName, setMentorName] = useState('')
  const [mentorRole, setMentorRole] = useState('')

  // Prefill mentor name/role from current profile for a smoother UX and default start date to today
  const [profile, setProfile] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        setLoadingProfile(true)
        const prof = await getCurrentProfile()
        setProfile(prof)
        if (prof) {
          setMentorName(prof.full_name || prof.username || '')
          setMentorRole(prof.role || '')
        }

        // Default start date to today's local date in YYYY-MM-DD format
        const today = new Date()
        const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        setStartDate(iso)

        // Only mentors and admins may access this page
        if (!prof || (prof.role !== 'mentor' && prof.role !== 'admin')) {
          toast.error('Only mentors and admins can create focus groups')
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
  const [totalSpots, setTotalSpots] = useState(10)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [creating, setCreating] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!title.trim() || !description.trim() || !mentorName.trim() || !mentorRole.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setCreating(true)
    try {
      await createMentorFocusGroup({
        title: title.trim(),
        description: description.trim(),
        mentor_name: mentorName.trim(),
        mentor_role: mentorRole.trim(),
        total_spots: totalSpots,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        tags: selectedTags,
      })

      toast.success('Focus group created successfully!')
      router.push('/mentor')
    } catch (error) {
      console.error('Error creating focus group:', error)
      toast.error('Failed to create focus group')
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
    <AppLayout username={profile?.username}>
      <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', paddingLeft: '20px', paddingRight: '20px'}}>
        <div className="w-full max-w-none">
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 rounded-full transition-colors" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Create Focus Group</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Set up a new mentorship program</p>
              </div>
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
                onClick={() => handleSubmit()}
                disabled={creating}
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
            <h3 className="text-lg font-semibold" style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Focus Group Details</h3>
            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
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
                <label className="block text-sm font-medium" style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Mentor Name *</label>
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
                <label className="block text-sm font-medium" style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Mentor Role *</label>
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
              <label className="block text-sm font-medium" style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Total Spots *</label>
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
                <label className="block text-sm font-medium" style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Start Date</label>
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
                <label className="block text-sm font-medium" style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>End Date</label>
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


        </form>
        </div>
       </div>
    </AppLayout>
  )
}
    
