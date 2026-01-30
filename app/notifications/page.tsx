'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/supabase/notifications'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { AppLayout } from '@/components/AppLayout'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const userProfile = await getCurrentProfile()
      setProfile(userProfile)
      
      const notifs = await getNotifications()
      setNotifications(notifs)
    } catch (error) {
      console.error('Error loading notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      toast.success('All marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500 fill-current" />
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationText = (notification: any) => {
    const user = notification.profiles
    const username = user?.full_name || user?.username || 'Someone'
    
    switch (notification.type) {
      case 'like':
        return `${username} liked your post`
      case 'comment':
        return `${username} commented on your post`
      case 'follow':
        return `${username} started following you`
      default:
        return 'New notification'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <AppLayout username={profile?.username}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#ECEDEE]">Notifications</h2>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-[#10B981] hover:text-[#059669] font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="p-12 text-center relative">
          <Bell className="w-80 h-80 text-[#2D2D2D] mx-auto mb-4 absolute left-1/2 -translate-x-1/2" style={{ top: '80px', zIndex: 0 }} />
          <h3 className="text-xl font-semibold mb-2 text-[#ECEDEE] relative" style={{ zIndex: 10 }}>No notifications yet</h3>
          <p className="text-[#9BA1A6] relative" style={{ zIndex: 10 }}>When you get notifications, they'll show up here</p>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => {
                if (!notification.is_read) {
                  handleMarkAsRead(notification.id)
                }
                if (notification.post_id) {
                  router.push(`/post/${notification.post_id}`)
                } else if (notification.type === 'follow' && notification.profiles) {
                  router.push(`/profile/${notification.profiles.username}`)
                }
              }}
              className={`bg-[#1C1C1E] rounded-[20px] p-4 border border-[#2C2C2E] hover:bg-[#252527] transition-all cursor-pointer ${
                !notification.is_read ? 'ring-2 ring-[#10B981]/20' : ''
              }`}
              style={{ marginBottom: '16px' }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    {notification.profiles?.avatar_url ? (
                      <img
                        src={notification.profiles.avatar_url}
                        alt={notification.profiles.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                        {notification.profiles?.username[0].toUpperCase() || '?'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-[#FFFFFF]">
                        <span className="font-semibold">
                          {notification.profiles?.full_name || notification.profiles?.username}
                        </span>{' '}
                        <span className="text-[#9BA1A6]">
                          {notification.type === 'like' && 'liked your post'}
                          {notification.type === 'comment' && 'commented on your post'}
                          {notification.type === 'follow' && 'started following you'}
                        </span>
                      </p>

                      {notification.posts?.content && (
                        <p className="text-[#9BA1A6] text-sm mt-1 line-clamp-1">
                          "{notification.posts.content}"
                        </p>
                      )}

                      <p className="text-[#8E8E93] text-sm mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>

                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-[#10B981] rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
