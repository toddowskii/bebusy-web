'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text mb-4">
            404
          </h1>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold mb-3">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-full hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/20"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-700 text-white font-semibold rounded-full hover:bg-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 text-gray-700">
          <p className="text-sm">Lost? Don't worry, even the best get lost sometimes.</p>
        </div>
      </div>
    </div>
  )
}
