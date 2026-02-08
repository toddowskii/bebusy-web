import toast from 'react-hot-toast'

export type ShareResult = 'native' | 'clipboard' | 'prompt' | 'error' | 'unsupported'

export async function shareUrl({ title, text, url }: { title?: string; text?: string; url: string }): Promise<ShareResult> {
  if (!url) return 'error'

  try {
    // Prefer native share if available
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: title || 'Check this out', text: text || '', url })
        // Some browsers don't reject when user cancels; still return native
        return 'native'
      } catch (err: any) {
        // If the native share throws because of an invalid context, fall through to clipboard
        console.warn('navigator.share failed:', err)
        // If user cancelled share, browsers often throw an AbortError or DOMException; treat as native
        if (err && err.name === 'AbortError') return 'native'
      }
    }

    // Clipboard fallback
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
      return 'clipboard'
    }

    // Last resort: prompt
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined') {
      window.prompt('Copy this link', url)
      return 'prompt'
    }

    return 'unsupported'
  } catch (err) {
    console.error('shareUrl error:', err)
    toast.error('Share failed')
    return 'error'
  }
}
