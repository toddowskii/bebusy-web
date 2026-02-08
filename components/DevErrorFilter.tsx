"use client"

import { useEffect } from 'react'

export default function DevErrorFilter() {
  useEffect(() => {
    // Only active in development to avoid hiding production errors
    if (process.env.NODE_ENV !== 'development') return

    const isExtensionError = (obj: any) => {
      try {
        const filename = obj?.filename || obj?.fileName
        const message = obj?.message
        const stack = obj?.stack
        if (typeof filename === 'string' && filename.startsWith('chrome-extension://')) return true
        if (typeof stack === 'string' && stack.includes('chrome-extension://')) return true
        if (typeof message === 'string' && message.includes('chrome-extension://')) return true
      } catch (e) {
        // ignore
      }
      return false
    }

    const onError = (e: ErrorEvent) => {
      if (isExtensionError(e)) {
        // Prevent the error from bubbling up to the global error overlay
        e.preventDefault()
        e.stopImmediatePropagation()
        return true
      }
      return undefined
    }

    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason = e?.reason
      if (isExtensionError(reason)) {
        e.preventDefault()
        e.stopImmediatePropagation()
        return true
      }
      return undefined
    }

    window.addEventListener('error', onError, true)
    window.addEventListener('unhandledrejection', onUnhandledRejection, true)

    return () => {
      window.removeEventListener('error', onError, true)
      window.removeEventListener('unhandledrejection', onUnhandledRejection, true)
    }
  }, [])

  return null
}
