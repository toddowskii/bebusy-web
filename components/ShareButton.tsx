"use client"

import toast from 'react-hot-toast'
import { Share2 } from 'lucide-react'
import { shareUrl } from '@/lib/utils/share'
import { useState } from 'react'
import ShareModal from './ShareModal'

export default function ShareButton({ title, text, url }: { title?: string; text?: string; url?: string }) {
  const [showModal, setShowModal] = useState(false)

  async function handleShare(e?: React.MouseEvent) {
    if (e) e.preventDefault()
    const shareTarget = url || (typeof window !== 'undefined' ? window.location.href : '')
    if (!shareTarget) {
      toast.error('Unable to determine URL to share')
      return
    }

    // First try to call native share synchronously if available to preserve gesture
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: title || 'Check this out', text: text || '', url: shareTarget })
        // success
        toast.success('Opened native share sheet')
        return
      } catch (err: any) {
        // If user cancelled or it failed, fall through to fallback
        console.warn('navigator.share failed or cancelled:', err)
        // If the error name is AbortError it usually means user cancelled; still return
        if (err && err.name === 'AbortError') return
      }
    }

    // Fallback flow
    const result = await shareUrl({ title, text, url: shareTarget })
    console.log('Share result:', result)

    // If native share succeeded in the util (unlikely since we tried above), we're done
    if (result === 'native') return

    if (result === 'clipboard') {
      // clipboard already shows a toast in the util, but add a quick hint
      toast.success('Used clipboard fallback')
      setShowModal(true)
      return
    }

    toast('Native share unavailable — showing fallback options', { icon: '⚠️' })
    setShowModal(true)
    return
  }

  return (
    <>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 hover:text-green-500 transition-colors"
        title="Share"
      >
        <Share2 className="w-5 h-5" />
      </button>
      {showModal && (
        <ShareModal url={url || (typeof window !== 'undefined' ? window.location.href : '')} title={title} text={text} onCloseAction={() => setShowModal(false)} />
      )}
    </>
  )
}
