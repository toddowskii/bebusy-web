'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { getMessages, sendMessage } from '@/lib/supabase/messages'
import { ArrowLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadChat()

    // Subscribe to new messages
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              profiles:sender_id (
                id,
                username,
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChat = async () => {
    setLoading(true)
    try {
      const currentProfile = await getCurrentProfile()
      setCurrentUser(currentProfile)

      // Get conversation details
      const { data: conversation } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:user1_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          user2:user2_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('id', conversationId)
        .single()

      if (!conversation) {
        toast.error('Conversation not found')
        router.push('/messages')
        return
      }

      const other = (conversation as any).user1_id === currentProfile?.id ? (conversation as any).user2 : (conversation as any).user1
      setOtherUser(other)

      // Load messages
      const messagesData = await getMessages(conversationId)
      setMessages(messagesData)
    } catch (error) {
      console.error('Error loading chat:', error)
      toast.error('Failed to load chat')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    try {
      await sendMessage(conversationId, messageContent)
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      setNewMessage(messageContent)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!otherUser) return null

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-gray-800 p-4 z-10 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-900 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Link href={`/profile/${otherUser.username}`} className="flex items-center gap-3 flex-1">
          {otherUser.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-800"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold ring-2 ring-gray-800">
              {otherUser.username[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-bold">{otherUser.full_name || otherUser.username}</h2>
            <p className="text-sm text-gray-500">@{otherUser.username}</p>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Say hi! 👋</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUser.id
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                        : 'bg-gray-900 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-full outline-none focus:ring-2 focus:ring-green-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-green-500/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
