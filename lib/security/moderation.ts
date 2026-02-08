// lib/security/moderation.ts
// Using dynamic import to handle bad-words CommonJS module
let filter: any;

try {
  const BadWordsFilter = require('bad-words');
  filter = new BadWordsFilter();
} catch {
  // Fallback if require doesn't work
  filter = {
    isProfane: () => false,
    clean: (text: string) => text
  };
}

/**
 * Check if content contains profanity or inappropriate language
 * @param content - The content to check
 * @returns true if content is inappropriate
 */
export function isProfane(content: string): boolean {
  if (!content) return false;
  return filter.isProfane(content);
}

/**
 * Clean profanity from content (replace with asterisks)
 * @param content - The content to clean
 * @returns Content with profanity replaced
 */
export function cleanProfanity(content: string): string {
  if (!content) return '';
  return filter.clean(content);
}

/**
 * Validate content before posting
 * @param content - The content to validate
 * @returns Object with isValid flag and error message if invalid
 */
export async function checkProfanity(content: string): Promise<{ isProfane: boolean; cleaned: string }>{
  if (!content) return { isProfane: false, cleaned: '' }

  // Server-side: use bad-words directly
  if (typeof window === 'undefined') {
    try {
      const BadWordsFilter = require('bad-words')
      const filter = new BadWordsFilter()
      return { isProfane: filter.isProfane(content), cleaned: filter.clean(content) }
    } catch (err) {
      console.error('Failed to run profanity check server-side:', err)
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
