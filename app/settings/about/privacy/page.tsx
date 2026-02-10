'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/AppLayout'
import { ArrowLeft, Shield } from 'lucide-react'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import toast from 'react-hot-toast'

export default function PrivacyPage() {
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

        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Privacy Policy</h1>
      </div>

      <div className="rounded-[20px] border overflow-hidden" style={{ marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div style={{ padding: '24px' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            Effective date: <strong>2026-02-10</strong>
          </p>
          <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--text-primary)' }}>
            BeBusy ("we", "us", or "the Service") provides a social productivity platform for daily check-ins, focused groups, posts, messaging, and mentor interactions. This Privacy Policy explains what data we collect, how we use it, and your choices.
          </p>
        </div>
      </div>

      <section className="rounded-[20px] border overflow-hidden" style={{ marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="border-b" style={{ padding: '12px 20px', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>What we collect</h2>
        </div>
        <div style={{ padding: '20px' }}>
          <ul className="list-disc pl-5 space-y-2 text-sm" style={{ color: 'var(--text-primary)' }}>
            <li><strong>Account & Authentication:</strong> Email, password (managed by Supabase Auth), and session tokens.</li>
            <li><strong>Profile Data:</strong> Username, full name, avatar, role, website, bio.</li>
            <li><strong>User Content:</strong> Posts, comments, messages and images you upload.</li>
            <li><strong>Usage & Diagnostics:</strong> Check-ins, streaks, likes, timestamps, IP address, device and browser metadata, and logs for abuse prevention.</li>
            <li><strong>Moderation Data:</strong> Profanity flags, sanitized content, and moderation actions.</li>
          </ul>
        </div>
      </section>

      <section className="rounded-[20px] border overflow-hidden" style={{ marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="border-b" style={{ padding: '12px 20px', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>How we use data</h2>
        </div>
        <div style={{ padding: '20px' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            We use data to provide and improve the Service, to authenticate and secure accounts, to moderate content, send transactional emails (like password resets), and for analytics and product improvement. We also may use data to comply with legal obligations or to protect users and the Service.
          </p>
        </div>
      </section>

      <section className="rounded-[20px] border overflow-hidden" style={{ marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="border-b" style={{ padding: '12px 20px', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Sharing & Third Parties</h2>
        </div>
        <div style={{ padding: '20px' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            We work with service providers (e.g., Supabase for hosting/auth and our email provider) who process data on our behalf under contract. We may disclose data to comply with legal obligations, to respond to abuse reports, or to protect our rights.
          </p>
        </div>
      </section>

      <section className="rounded-[20px] border overflow-hidden" style={{ marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="border-b" style={{ padding: '12px 20px', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Cookies & Tracking</h2>
        </div>
        <div style={{ padding: '20px' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            We use cookies for authentication and session management. We may use analytics cookies to measure and improve the product; these are optional and can be controlled where applicable.
          </p>
        </div>
      </section>

      <section className="rounded-[20px] border overflow-hidden" style={{ marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="border-b" style={{ padding: '12px 20px', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Data retention & transfers</h2>
        </div>
        <div style={{ padding: '20px' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            We retain personal data while your account exists and for a limited time after for backups or legal compliance. Your data may be processed or stored in other countries where our service providers operate.
          </p>
        </div>
      </section>

      <section className="rounded-[20px] border overflow-hidden" style={{ marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="border-b" style={{ padding: '12px 20px', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Your rights</h2>
        </div>
        <div style={{ padding: '20px' }}>
          <ul className="list-disc pl-5 space-y-2 text-sm" style={{ color: 'var(--text-primary)' }}>
            <li>Access and correct your profile information via Settings.</li>
            <li>Request deletion or a copy of your data by contacting <a className="underline" href="mailto:privacy@bebusy.com">privacy@bebusy.com</a>.</li>
            <li>Opt out of non-essential communications via email settings.</li>
          </ul>
        </div>
      </section>

      <section className="rounded-[20px] border overflow-hidden" style={{ marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="border-b" style={{ padding: '12px 20px', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Children</h2>
        </div>
        <div style={{ padding: '20px' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            The Service is not intended for children under 13. If we learn an account belongs to a child under the applicable age we will take steps to remove it.
          </p>
        </div>
      </section>

      <div className="rounded-[20px] border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div style={{ padding: '20px' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
            Contact
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            For privacy questions or requests contact <a className="underline" href="mailto:info@bebusypp.com">info@bebusyapp.com</a>.
          </p>
          <div style={{ marginTop: '16px' }}>
            <Link href="/settings/about" className="text-sm font-medium" style={{ color: 'var(--primary)' }}>← Back to About</Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
