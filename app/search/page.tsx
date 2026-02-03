'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/AppLayout'
import { getCurrentProfile } from '@/lib/supabase/profiles'
import { searchUsers, searchPosts, searchGroups } from '@/lib/supabase/search'
import { Search as SearchIcon, User, FileText, Users, X } from 'lucide-react'
import Link from 'next/link'
import { PostCard } from '@/components/PostCard'
import toast from 'react-hot-toast'

export default function SearchPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'groups'>('users')
  const [users, setUsers] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounce = setTimeout(() => {
        handleSearch()
      }, 300)
      return () => clearTimeout(debounce)
    } else {
      setUsers([])
      setPosts([])
      setGroups([])
      setHasSearched(false)
    }
  }, [searchQuery, activeTab])

  const loadCurrentUser = async () => {
    try {
      const profile = await getCurrentProfile()
      setCurrentUser(profile)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setHasSearched(true)

    try {
      if (activeTab === 'users') {
        const results = await searchUsers(searchQuery)
        setUsers(results)
      } else if (activeTab === 'posts') {
        const results = await searchPosts(searchQuery, currentUser?.id)
        setPosts(results)
      } else if (activeTab === 'groups') {
        const results = await searchGroups(searchQuery)
        setGroups(results)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setUsers([])
    setPosts([])
    setGroups([])
    setPosts([])
    setHasSearched(false)
  }

  return (
    <AppLayout username={currentUser?.username}>
      <div>
        {/* Search Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 className="text-2xl font-bold text-[#ECEDEE]" style={{ marginBottom: '20px' }}>Search</h1>
          
          {/* Search Input */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <SearchIcon className="w-5 h-5 text-[#8E8E93]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for users or posts..."
              className="w-full bg-[#1C1C1E] text-[#ECEDEE] rounded-full outline-none focus:ring-2 focus:ring-[#10B981] border border-[#2C2C2E]"
              style={{ paddingLeft: '48px', paddingRight: '48px', paddingTop: '12px', paddingBottom: '12px' }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-[#2C2C2E] rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-[#8E8E93]" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2" style={{ marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'users'
                ? 'bg-[#10B981]/10 text-[#10B981]'
                : 'text-[#8E8E93] bg-[#1C1C1E] hover:bg-[#2C2C2E]'
            }`}
            style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px' }}
          >
            <User className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'groups'
                ? 'bg-[#10B981]/10 text-[#10B981]'
                : 'text-[#8E8E93] bg-[#1C1C1E] hover:bg-[#2C2C2E]'
            }`}
            style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px' }}
          >
            <Users className="w-4 h-4" />
            Groups
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'posts'
                ? 'bg-[#10B981]/10 text-[#10B981]'
                : 'text-[#8E8E93] bg-[#1C1C1E] hover:bg-[#2C2C2E]'
            }`}
            style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px' }}
          >
            <FileText className="w-4 h-4" />
            Posts
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-[#10B981] border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Results */}
        {!loading && hasSearched && (
          <>
            {/* Users Results */}
            {activeTab === 'users' && (
              <div className="space-y-3">
                {users.length === 0 ? (
                  <div className="text-center p-12">
                    <User className="w-12 h-12 text-[#8E8E93] mx-auto mb-3" />
                    <p className="text-[#8E8E93]">No users found</p>
                  </div>
                ) : (
                  users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      className="block bg-[#1C1C1E] rounded-[20px] border border-[#2C2C2E] hover:border-[#10B981]/30 transition-all"
                      style={{ padding: '16px' }}
                    >
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#2C2C2E]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-[#2C2C2E]">
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#ECEDEE] truncate">
                            {user.full_name || user.username}
                          </h3>
                          <p className="text-sm text-[#8E8E93] truncate">@{user.username}</p>
                          {user.bio && (
                            <p className="text-sm text-[#9BA1A6] truncate mt-1">{user.bio}</p>
                          )}
                        </div>
                        {user.role && user.role !== 'user' && (
                          <span className="text-xs bg-[#10B981]/10 text-[#10B981] px-2 py-1 rounded-full">
                            {user.role}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Groups Results */}
            {activeTab === 'groups' && (
              <div className="space-y-3">
                {groups.length === 0 ? (
                  <div className="text-center p-12">
                    <Users className="w-12 h-12 text-[#8E8E93] mx-auto mb-3" />
                    <p className="text-[#8E8E93]">No groups found</p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <Link
                      key={group.id}
                      href={`/groups/${group.id}`}
                      className="block bg-[#1C1C1E] rounded-[20px] border border-[#2C2C2E] hover:border-[#10B981]/30 transition-all"
                      style={{ padding: '16px' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-[#2C2C2E]">
                          {group.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#ECEDEE] truncate">
                            {group.name}
                          </h3>
                          {group.description && (
                            <p className="text-sm text-[#9BA1A6] truncate">{group.description}</p>
                          )}
                          <p className="text-xs text-[#8E8E93] mt-1">
                            {group.members_count || 0} members
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Posts Results */}
            {activeTab === 'posts' && (
              <div>
                {posts.length === 0 ? (
                  <div className="text-center p-12">
                    <FileText className="w-12 h-12 text-[#8E8E93] mx-auto mb-3" />
                    <p className="text-[#8E8E93]">No posts found</p>
                  </div>
                ) : (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
              </div>
            )}
          </>
        )}

        {/* Initial State */}
        {!hasSearched && !loading && (
          <div className="text-center p-12">
            <SearchIcon className="w-16 h-16 text-[#8E8E93] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#ECEDEE] mb-2">Search BeBusy</h3>
            <p className="text-[#8E8E93]">Find users and posts</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
