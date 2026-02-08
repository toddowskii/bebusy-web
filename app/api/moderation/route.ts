import { NextResponse } from 'next/server'

// API: POST /api/moderation
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const content = body?.content || ''

    // Use bad-words on server
    let BadWordsFilter
    try {
      BadWordsFilter = require('bad-words')
    } catch (err) {
      console.error('Failed to load bad-words:', err)
      return NextResponse.json({ isProfane: false, cleaned: content })
    }

    const filter = new BadWordsFilter()
    const isProfane = filter.isProfane(content)
    const cleaned = filter.clean(content)

    return NextResponse.json({ isProfane, cleaned })
  } catch (err) {
    console.error('Moderation API error:', err)
    return NextResponse.json({ isProfane: false, cleaned: '' })
  }
}
