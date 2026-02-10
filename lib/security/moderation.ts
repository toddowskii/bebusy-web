// lib/security/moderation.ts

// Try to create a default filter instance for synchronous helper functions (best-effort)
let filter: any = {
  isProfane: () => false,
  clean: (text: string) => text,
}

try {
  // Handle both CommonJS and ESM shapes
  // require may return the constructor directly or an object with `.default`
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const maybeMod = require('bad-words') as any
  const BadWordsFilter = ((maybeMod as any)?.default ?? maybeMod) as any
  if (typeof BadWordsFilter === 'function') {
    filter = new BadWordsFilter()
  }
} catch (err) {
  // keep fallback filter
}

/**
 * Check if content contains profanity or inappropriate language (sync helper)
 * @param content - The content to check
 * @returns true if content is inappropriate
 */
export function isProfane(content: string): boolean {
  if (!content) return false;
  try {
    return filter.isProfane(content);
  } catch (err) {
    console.warn('isProfane fallback due to filter error:', err)
    return false
  }
}

/**
 * Clean profanity from content (replace with asterisks) (sync helper)
 * @param content - The content to clean
 * @returns Content with profanity replaced
 */
export function cleanProfanity(content: string): string {
  if (!content) return '';
  try {
    return filter.clean(content);
  } catch (err) {
    console.warn('cleanProfanity fallback due to filter error:', err)
    return content
  }
}

/**
 * Validate content before posting using a server-side profanity check when available
 * @param content - The content to validate
 * @returns Object with isProfane flag and cleaned text
 */
export async function checkProfanity(content: string): Promise<{ isProfane: boolean; cleaned: string }> {
  if (!content) return { isProfane: false, cleaned: '' }

  // Server-side: dynamic import to handle ESM/CJS interop cleanly
  if (typeof window === 'undefined') {
    try {
      const mod = await import('bad-words') as any
      const BadWordsFilter = ((mod as any)?.default ?? mod) as any
      if (typeof BadWordsFilter === 'function') {
        const serverFilter = new BadWordsFilter()
        return { isProfane: serverFilter.isProfane(content), cleaned: serverFilter.clean(content) }
      }
      // If the module shape is unexpected, fall back to the sync `filter` if it exists
      if (filter && typeof filter.isProfane === 'function') {
        return { isProfane: filter.isProfane(content), cleaned: filter.clean(content) }
      }
      return { isProfane: false, cleaned: content }
    } catch (err) {
      console.error('Failed to run profanity check server-side:', err)
      // graceful fallback
      if (filter && typeof filter.isProfane === 'function') {
        return { isProfane: filter.isProfane(content), cleaned: filter.clean(content) }
      }
      return { isProfane: false, cleaned: content }
    }
  }

  // Client-side: call moderation API
  try {
    const res = await fetch('/api/moderation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })
    if (!res.ok) return { isProfane: false, cleaned: content }
    const data = await res.json()
    return { isProfane: data.isProfane, cleaned: data.cleaned }
  } catch (err) {
    console.error('Failed to call moderation API:', err)
    return { isProfane: false, cleaned: content }
  }
}

export function validateContent(content: string): { isValid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Content cannot be empty' };
  }

  if (content.length > 5000) {
    return { isValid: false, error: 'Content is too long (max 5000 characters)' };
  }

  // We can't synchronously run a robust profanity check on the client; assume content is valid here and rely on async server-side check where it matters
  return { isValid: true };
}
