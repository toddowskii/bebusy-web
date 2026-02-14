'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getConversations, getUserGroupChats } from '@/lib/supabase/messages'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { MessageSquare, Users, Inbox, Mail, Users2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AppLayout } from '@/components/AppLayout'
import { supabase } from '@/lib/supabase/client'

export default function MessagesPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<any[]>([])
  const [groupChats, setGroupChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'groups'>('all')
  const processedMessageIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!profile) return

    // Subscribe to new messages in real-time
    const channel = supabase
      .channel('messages-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          // Only update the specific conversation affected
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            let message = payload.new as any
            if (!message?.id) return

            // If payload is missing sender_id (some realtime payloads are partial),
            // fetch the row so decisions (increment/decrement) are based on real data.
            if (typeof message.sender_id === 'undefined') {
              try {
                const { data: fetched } = await supabase
                  .from('messages')
                  .select('id,conversation_id,group_id,sender_id,is_read,created_at,content')
                  .eq('id', message.id)
                  .single()
                if (fetched) message = fetched
              } catch (err) {
                // if fetch fails, skip processing this event to avoid wrong counts
                console.debug('messages-updates: skipping incomplete payload for id=', message.id, err)
                return
              }
            }

            // dedupe across handlers
            if (processedMessageIdsRef.current.has(message.id)) return
            processedMessageIdsRef.current.add(message.id)
            setTimeout(() => processedMessageIdsRef.current.delete(message.id), 5000)

            const conversationId = message.conversation_id
            const groupId = message.group_id

            // Debug: log event so we can trace duplicate increments
            console.debug('messages-updates event:', payload.eventType, 'id=', message.id, 'sender=', message.sender_id, 'profile=', profile?.id)

            // Update conversations state for 1-on-1 chats
            if (conversationId) {
              setConversations(prev => {
                const index = prev.findIndex(c => c.id === conversationId)
                if (index === -1) {
                  return prev
                }

                const updated = [...prev]
                const conv = updated[index]

                if (payload.eventType === 'INSERT' && message.sender_id !== profile.id) {
                  conv.unreadCount = (conv.unreadCount || 0) + 1
                } else if (payload.eventType === 'UPDATE' && message.is_read) {
                  conv.unreadCount = Math.max((conv.unreadCount || 0) - 1, 0)
                }

                conv.lastMessage = message
                conv.updated_at = message.created_at

                updated.sort((a, b) => 
                  new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                )

                return updated
              })
            }

            // Update group chats state for group messages
            if (groupId) {
              setGroupChats(prev => {
                const index = prev.findIndex(g => g.id === groupId)
                if (index === -1) {
                  return prev
                }

                const updated = [...prev]
                const group = updated[index]

                if (payload.eventType === 'INSERT' && message.sender_id !== profile.id) {
                  group.unreadCount = (group.unreadCount || 0) + 1
                } else if (payload.eventType === 'UPDATE' && message.is_read) {
                  group.unreadCount = Math.max((group.unreadCount || 0) - 1, 0)
                }

                group.lastMessage = message
                group.updated_at = message.created_at

                updated.sort((a, b) => 
                  new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                )

                return updated
              })
            }
          }
        }
      )
      .subscribe()

    // Listen for immediate client-side "conversation read" events (optimistic UI updates)
    const onMessagesRead = (e: any) => {
      const conversationId = e?.detail?.conversationId
      const unreadCount = e?.detail?.unreadCount || 0
      if (!conversationId) return
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unreadCount: Math.max((c.unreadCount || 0) - unreadCount, 0) } : c))
    }
    window.addEventListener('bb:messages-read', onMessagesRead)

    // Listen for global message events emitted by AppLayout so the conversations
    // list updates instantly even when supabase channel isn't used directly.
    const onAppMessageInserted = (e: any) => {
      const payload = e?.detail
      if (!payload || !payload.new) return
      const message = payload.new as any
      if (!message?.id) return
      if (processedMessageIdsRef.current.has(message.id)) return
      processedMessageIdsRef.current.add(message.id)
      setTimeout(() => processedMessageIdsRef.current.delete(message.id), 5000)

      // Reuse the same update logic but keep it idempotent (skip if lastMessage.id matches)
      if (message.conversation_id) {
        setConversations(prev => {
          const index = prev.findIndex(c => c.id === message.conversation_id)
          if (index === -1) return prev
          const updated = [...prev]
          const conv = updated[index]
          if (conv.lastMessage?.id === message.id) return prev

          if (payload.eventType === 'INSERT' && message.sender_id !== profile.id) {
            conv.unreadCount = (conv.unreadCount || 0) + 1
          } else if (payload.eventType === 'UPDATE' && message.is_read) {
            conv.unreadCount = Math.max((conv.unreadCount || 0) - 1, 0)
          }
          conv.lastMessage = message
          conv.updated_at = message.created_at
          updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          return updated
        })
      }

      if (message.group_id) {
        setGroupChats(prev => {
          const index = prev.findIndex(g => g.id === message.group_id)
          if (index === -1) return prev
          const updated = [...prev]
          const group = updated[index]
          if (group.lastMessage?.id === message.id) return prev

          if (payload.eventType === 'INSERT' && message.sender_id !== profile.id) {
            group.unreadCount = (group.unreadCount || 0) + 1
          } else if (payload.eventType === 'UPDATE' && message.is_read) {
            group.unreadCount = Math.max((group.unreadCount || 0) - 1, 0)
          }
          group.lastMessage = message
          group.updated_at = message.created_at
          updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          return updated
        })
      }
    }

    window.addEventListener('bb:message-inserted', onAppMessageInserted)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('bb:messages-read', onMessagesRead)
      window.removeEventListener('bb:message-inserted', onAppMessageInserted)
    }
  }, [profile])

  const loadData = async () => {
    setLoading(true)
    try {
      const userProfile = await getCurrentProfile()
      setProfile(userProfile)
      
      const [convos, groups] = await Promise.all([
        getConversations(),
        getUserGroupChats()
      ])
      setConversations(convos)
      setGroupChats(groups)
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <AppLayout username={profile?.username}>
      <h2 className="text-2xl font-bold text-foreground" style={{ marginBottom: '24px' }}>Messages</h2>

      {/* Tabs */}
      <div className="flex gap-2" style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'all'
              ? 'bg-primary/10 text-primary'
              : 'text-muted bg-card hover:bg-muted'
          }`}
          style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px' }}
        >
          <Inbox className="w-4 h-4" />
          All
        </button>
        <button
          onClick={() => setActiveTab('direct')}
          className={`flex-1 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'direct'
              ? 'bg-primary/10 text-primary'
              : 'text-muted bg-card hover:bg-muted'
          }`}
          style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px' }}
        >
          <Mail className="w-4 h-4" />
          Direct
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'groups'
              ? 'bg-primary/10 text-primary'
              : 'text-muted bg-card hover:bg-muted'
          }`}
          style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px' }}
        >
          <Users2 className="w-4 h-4" />
          Groups
        </button>
      </div>

      {/* Messages List */}
      {(() => {
        const allMessages = [
          ...conversations.map(c => ({ ...c, type: 'direct' })),
          ...groupChats.map(g => ({ ...g, type: 'group' }))
        ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        const filteredMessages = activeTab === 'all' 
          ? allMessages 
          : activeTab === 'direct' 
            ? allMessages.filter(m => m.type === 'direct')
            : allMessages.filter(m => m.type === 'group');

        if (filteredMessages.length === 0) {
          return (
            <div className="p-12 text-center relative">
              <MessageSquare className="w-80 h-80 text-muted mx-auto mb-4 absolute left-1/2 -translate-x-1/2" style={{ top: '80px', zIndex: 0 }} />
              <h3 className="text-xl font-semibold mb-2 text-foreground relative" style={{ zIndex: 10 }}>
                {activeTab === 'groups' ? 'No group chats yet' : 'No messages yet'}
              </h3>
              <p className="text-muted-foreground relative" style={{ zIndex: 10 }}>
                {activeTab === 'groups' 
                  ? 'Join a group to start chatting!' 
                  : 'Start a conversation by visiting someone\'s profile!'}
              </p>
            </div>
          );
        }

        return (
          <div>
            {filteredMessages.map((item) => (
              <Link
                key={item.id}
                href={item.type === 'group' ? `/messages/group/${item.id}` : `/messages/${item.id}`}
                className="block"
                style={{ marginBottom: '16px' }}
              >
                <div className="bg-card rounded-[20px] border border-border hover:bg-card-hover transition-all cursor-pointer" style={{ padding: '20px' }}>
                  <div className="flex items-center" style={{ gap: '16px' }}>
                    {item.type === 'group' ? (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    ) : item.otherUser?.avatar_url ? (
                      <img
                        src={item.otherUser.avatar_url}
                        alt={item.otherUser.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                        {item.otherUser?.username[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className="font-bold truncate text-foreground">
                            {item.type === 'group' 
                              ? item.name 
                              : (item.otherUser?.full_name || item.otherUser?.username)}
                          </h3>
                          {item.unreadCount > 0 && (
                            <span className="flex-shrink-0 bg-primary text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                              {item.unreadCount}
                            </span>
                          )}
                        </div>
                        {item.lastMessage && (
                          <span className="text-sm text-muted flex-shrink-0 ml-2">
                            {formatTime(item.lastMessage.created_at)}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm truncate ${item.unreadCount > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        {(() => {
                          if (!item.lastMessage) return 'No messages yet';
                          if (item.lastMessage.content) return item.lastMessage.content;
                          if (item.lastMessage.file_url) {
                            if (item.lastMessage.file_type?.startsWith('image/')) return '📷 Image';
                            if (item.lastMessage.file_type?.startsWith('video/')) return '🎥 Video';
                            if (item.lastMessage.file_type === 'application/pdf') return '📄 PDF';
                            return '📎 File';
                          }
                          return 'No messages yet';
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        );
      })()}
    </AppLayout>
  )
}
