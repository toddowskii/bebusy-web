'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { AppLayout } from '@/components/AppLayout'
import { 
  User, 
  Bell, 
  Lock, 
  Eye, 
  Globe, 
  Trash2, 
  LogOut,
  ChevronRight,
  Shield,
  Palette,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SettingsPage() {
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <AppLayout username={profile?.username}>
      <h1 className="text-2xl font-bold text-[#ECEDEE]" style={{ marginBottom: '24px' }}>Settings</h1>

      {/* Account Section */}
      <div className="bg-[#1C1C1E] rounded-[20px] border border-[#2C2C2E] overflow-hidden" style={{ marginBottom: '16px' }}>
        <div className="border-b border-[#2C2C2E]" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '12px', paddingBottom: '12px' }}>
          <h2 className="text-sm font-semibold text-[#9BA1A6] uppercase">Account</h2>
        </div>
        
        <Link href="/settings/edit-profile" className="flex items-center justify-between hover:bg-[#252527] transition-colors border-b border-[#2C2C2E]" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '16px', paddingBottom: '16px' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="font-medium text-[#ECEDEE]">Edit Profile</p>
              <p className="text-sm text-[#8E8E93]">Change your profile information</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
        </Link>

        <Link href="/settings/notifications" className="flex items-center justify-between hover:bg-[#252527] transition-colors border-b border-[#2C2C2E]" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '16px', paddingBottom: '16px' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="font-medium text-[#ECEDEE]">Notifications</p>
              <p className="text-sm text-[#8E8E93]">Manage notification preferences</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
        </Link>

        <Link href="/settings/privacy" className="flex items-center justify-between hover:bg-[#252527] transition-colors" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '16px', paddingBottom: '16px' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="font-medium text-[#ECEDEE]">Privacy & Security</p>
              <p className="text-sm text-[#8E8E93]">Control your privacy settings</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
        </Link>
      </div>

      {/* Preferences Section */}
      <div className="bg-[#1C1C1E] rounded-[20px] border border-[#2C2C2E] overflow-hidden" style={{ marginBottom: '16px' }}>
        <div className="border-b border-[#2C2C2E]" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '12px', paddingBottom: '12px' }}>
          <h2 className="text-sm font-semibold text-[#9BA1A6] uppercase">Preferences</h2>
        </div>
        
        <Link href="/settings/appearance" className="flex items-center justify-between hover:bg-[#252527] transition-colors border-b border-[#2C2C2E]" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '16px', paddingBottom: '16px' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="font-medium text-[#ECEDEE]">Appearance</p>
              <p className="text-sm text-[#8E8E93]">Theme and display settings</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
        </Link>

        <Link href="/settings/language" className="flex items-center justify-between hover:bg-[#252527] transition-colors" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '16px', paddingBottom: '16px' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="font-medium text-[#ECEDEE]">Language</p>
              <p className="text-sm text-[#8E8E93]">English</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
        </Link>
      </div>

      {/* Support Section */}
      <div className="bg-[#1C1C1E] rounded-[20px] border border-[#2C2C2E] overflow-hidden" style={{ marginBottom: '16px' }}>
        <div className="border-b border-[#2C2C2E]" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '12px', paddingBottom: '12px' }}>
          <h2 className="text-sm font-semibold text-[#9BA1A6] uppercase">Support</h2>
        </div>
        
        <Link href="/settings/help" className="flex items-center justify-between hover:bg-[#252527] transition-colors border-b border-[#2C2C2E]" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '16px', paddingBottom: '16px' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="font-medium text-[#ECEDEE]">Help & Support</p>
              <p className="text-sm text-[#8E8E93]">Get help with BeBusy</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
        </Link>

        <Link href="/settings/about" className="flex items-center justify-between hover:bg-[#252527] transition-colors" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '16px', paddingBottom: '16px' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="font-medium text-[#ECEDEE]">About BeBusy</p>
              <p className="text-sm text-[#8E8E93]">Version 1.0.0</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
        </Link>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#1C1C1E] rounded-[20px] border border-[#2C2C2E] overflow-hidden" style={{ marginBottom: '24px' }}>
        <div className="border-b border-[#2C2C2E]" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '12px', paddingBottom: '12px' }}>
          <h2 className="text-sm font-semibold text-[#9BA1A6] uppercase">Danger Zone</h2>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between hover:bg-[#252527] transition-colors border-b border-[#2C2C2E]"
          style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '16px', paddingBottom: '16px' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-red-500">Log Out</p>
              <p className="text-sm text-[#8E8E93]">Sign out of your account</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
        </button>

        <Link href="/settings/delete-account" className="flex items-center justify-between hover:bg-[#252527] transition-colors" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '16px', paddingBottom: '16px' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-red-500">Delete Account</p>
              <p className="text-sm text-[#8E8E93]">Permanently delete your account</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
        </Link>
      </div>
    </AppLayout>
  )
}
