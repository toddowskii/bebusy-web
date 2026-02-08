"use client"

import { useState } from 'react'
import { X, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ShareModal({ url, title, text, onCloseAction }: { url: string; title?: string; text?: string; onCloseAction: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard')
    } catch (err) {
      // fallback to prompt
      // eslint-disable-next-line no-alert
      window.prompt('Copy this link', url)
    }
  }

  const openInSafari = () => {
    // On iOS Safari this will open in a new tab; the user can then use the native share sheet
    window.open(url, '_blank')
    onCloseAction()
  }

  const openTwitter = () => {
    const tweet = encodeURIComponent(`${text || title || "Check this out"} ${url}`)
    window.open(`https://twitter.com/intent/tweet?text=${tweet}`, '_blank')
    onCloseAction()
  }

  const openWhatsApp = () => {
    const payload = encodeURIComponent(`${text || title || ''} ${url}`)
    window.open(`https://wa.me/?text=${payload}`, '_blank')
    onCloseAction()
  }

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center" onClick={onCloseAction}>
      <div className="w-full max-w-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-card rounded-t-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Share</h3>
            <button onClick={onCloseAction} className="p-2 rounded-full hover:bg-accent transition-colors"><X className="w-4 h-4" /></button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <button onClick={openInSafari} className="flex items-center gap-2 justify-center px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)]">
              <ExternalLink className="w-5 h-5" />
              Open in Browser
            </button>
            <button onClick={handleCopy} className="flex items-center gap-2 justify-center px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)]">
              {copied ? 'Copied' : 'Copy Link'}
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={openTwitter} className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)]">Share on X</button>
            <button onClick={openWhatsApp} className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)]">WhatsApp</button>
          </div>

        </div>
      </div>
    </div>
  )
}
