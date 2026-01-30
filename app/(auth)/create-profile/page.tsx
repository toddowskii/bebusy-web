'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { createProfile, isUsernameAvailable } from '@/lib/supabase/profiles'
import toast from 'react-hot-toast'
import { User, AtSign, FileText, Upload, ArrowRight } from 'lucide-react'

export default function CreateProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Get the current user
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)
        setEmail(data.user.email || '')
      } else {
        router.push('/signup')
      }
    }
    getUser()
  }, [router])

  useEffect(() => {
    // Check username availability with debounce
    if (username.length < 3) {
      setUsernameValid(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setUsernameChecking(true)
      const available = await isUsernameAvailable(username)
      setUsernameValid(available)
      setUsernameChecking(false)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [username])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
      toast.error('User not found. Please sign up again.')
      return
    }

    if (username.length < 3) {
      toast.error('Username must be at least 3 characters')
      return
    }

    if (!usernameValid) {
      toast.error('Username is already taken')
      return
    }

    setLoading(true)

    try {
      // Create profile
      const profile = await createProfile({
        id: userId,
        email: email,
        full_name: fullName,
        username: username,
        bio: bio || null,
      })

      if (!profile) {
        throw new Error('Failed to create profile')
      }

      // Upload avatar if provided
      if (avatar) {
        const fileExt = avatar.name.split('.').pop()
        const fileName = `${userId}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatar, { upsert: true })

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

          // Update profile with avatar URL
          await supabase
            .from('profiles')
            // @ts-expect-error - Supabase type inference issue
            .update({ avatar_url: publicUrl })
            .eq('id', userId)
        }
      }

      toast.success('Profile created successfully!')
      router.push('/')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-[#262626] p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
      <p className="text-gray-400 mb-6">Tell us a bit about yourself</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#262626] flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-gray-500" />
              )}
            </div>
            <label
              htmlFor="avatar"
              className="absolute bottom-0 right-0 bg-[#10B981] p-2 rounded-full cursor-pointer hover:bg-[#059669] transition-colors"
            >
              <Upload className="h-4 w-4 text-white" />
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-gray-400 mt-2">Click to upload avatar</p>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-black border border-[#262626] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] transition-colors"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
            Username *
          </label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
              className={`w-full pl-10 pr-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                usernameValid === false
                  ? 'border-red-500 focus:border-red-500'
                  : usernameValid === true
                  ? 'border-green-500 focus:border-green-500'
                  : 'border-[#262626] focus:border-[#10B981]'
              }`}
              placeholder="johndoe"
            />
            {usernameChecking && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-[#10B981] border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          {usernameValid === false && (
            <p className="text-red-500 text-sm mt-1">Username already taken</p>
          )}
          {usernameValid === true && (
            <p className="text-green-500 text-sm mt-1">Username available</p>
          )}
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
            Bio (optional)
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={160}
              className="w-full pl-10 pr-4 py-3 bg-black border border-[#262626] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] transition-colors resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
          <p className="text-sm text-gray-500 mt-1 text-right">{bio.length}/160</p>
        </div>

        <button
          type="submit"
          disabled={loading || !usernameValid}
          className="w-full bg-[#10B981] hover:bg-[#059669] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? 'Creating profile...' : 'Complete Profile'}
          {!loading && <ArrowRight className="h-5 w-5" />}
        </button>
      </form>
    </div>
  )
}
