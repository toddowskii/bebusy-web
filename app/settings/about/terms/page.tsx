'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/AppLayout'
import { ArrowLeft, FileText } from 'lucide-react'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import toast from 'react-hot-toast'

export default function TermsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const currentProfile = await getCurrentProfile()
      if (!currentProfile) {
        router.push('/login')
        return
      }
      setProfile(currentProfile)
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin h-8 w-8 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <AppLayout username={profile?.username}>
      <div className="flex items-center gap-4" style={{ marginBottom: '24px' }}>
        <Link
          href="/settings/about"
          className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
        </Link>

        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Terms of Service</h1>
      </div>

      <div className="rounded-[20px] border overflow-hidden" style={{ marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div style={{ padding: '24px' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            Effective date: <strong>2026-02-10</strong>
          </p>
          <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--text-primary)' }}>
            These Terms of Service ("Terms") govern your use of BeBusy. By creating an account or using the Service, you agree to these Terms.
          </p>
        </div>
      </div>

      <section className="rounded-[20px] border overflow-hidden" style={{ marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="border-b" style={{ padding: '12px 20px', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Using the Service</h2>
        </div>
        <div style={{ padding: '20px' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            You may use BeBusy for lawful purposes and must follow our community rules. You are responsible for your account and any activity that occurs under it. Don't attempt to circumvent security, abuse or harass other users, or post illegal content.
          </p>
        </div>
      </section>

      <section className="rounded-[20px] border overflow-hidden" style={{ marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="border-b" style={{ padding: '12px 20px', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>User Content</h2>
        </div>
        <div style={{ padding: '20px' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            You retain ownership of content you post (posts, comments, messages), but you grant BeBusy a license to host and display it. We may remove content that violates rules or is illegal, and we may sanitize or flag content using automated moderation tools.
          </p>
        </div>
      </section>

      <section className="rounded-[20px] border overflow-hidden" style={{ marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="border-b" style={{ padding: '12px 20px', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Account Suspension & Termination</h2>
        </div>
        <div style={{ padding: '20px' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            We may suspend or terminate accounts for violations of these Terms, abuse, or unlawful activity. Users can request account deletion via Settings or by contacting support.
          </p>
        </div>
      </section>

      <section className="rounded-[20px] border overflow-hidden" style={{ marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="border-b" style={{ padding: '12px 20px', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Disclaimers & Liability</h2>
        </div>
        <div style={{ padding: '20px' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            BeBusy is provided "as is" and we disclaim certain warranties to the extent permitted by law. We are not responsible for user content and limit liability to the maximum extent allowed.
          </p>
        </div>
      </section>

      <div className="rounded-[20px] border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div style={{ padding: '20px' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
            Contact
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            For questions about these Terms contact <a className="underline" href="mailto:info@bebusypp.com">info@bebusyapp.com</a>.
          </p>
          <div style={{ marginTop: '16px' }}>
            <Link href="/settings/about" className="text-sm font-medium" style={{ color: 'var(--primary)' }}>← Back to About</Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
