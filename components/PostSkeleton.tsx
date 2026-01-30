'use client'

export function PostSkeleton() {
  return (
    <div className="border-b border-gray-800 p-4 animate-pulse">
      <div className="flex gap-3">
        {/* Avatar skeleton */}
        <div className="w-12 h-12 rounded-full bg-gray-800 flex-shrink-0" />

        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-32 bg-gray-800 rounded" />
            <div className="h-4 w-20 bg-gray-800 rounded" />
          </div>

          {/* Content lines */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-800 rounded" />
            <div className="h-4 w-4/5 bg-gray-800 rounded" />
          </div>

          {/* Actions */}
          <div className="flex gap-8 pt-2">
            <div className="h-8 w-12 bg-gray-800 rounded" />
            <div className="h-8 w-12 bg-gray-800 rounded" />
            <div className="h-8 w-12 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function FeedSkeleton() {
  return (
    <div>
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </div>
  )
}
