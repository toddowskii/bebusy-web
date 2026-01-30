'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold mb-3">Oops! Something went wrong</h2>
        <p className="text-gray-400 mb-2">
          We encountered an unexpected error. Don't worry, it's not your fault!
        </p>
        
        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-4 mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
            <p className="text-sm text-red-400 font-mono break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-full hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/20"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-700 text-white font-semibold rounded-full hover:bg-gray-900 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 text-gray-600">
          <p className="text-sm">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
