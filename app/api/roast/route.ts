import { NextRequest } from 'next/server'
import { fetchPageContent, generateRoast } from '@/lib/roast'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) return Response.json({ error: 'URL is required' }, { status: 400 })

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return Response.json({ error: 'Invalid URL. Include https://' }, { status: 400 })
    }

    let pageContent: string
    try {
      pageContent = await fetchPageContent(parsedUrl.toString())
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'insufficient_content') return Response.json({ error: "That page doesn't have enough content to roast." }, { status: 400 })
      if (msg.includes('timeout') || msg.includes('abort')) return Response.json({ error: 'That page took too long to load.' }, { status: 400 })
      return Response.json({ error: "Couldn't fetch that page. Is it publicly accessible?" }, { status: 400 })
    }

    const result = await generateRoast(pageContent)
    return Response.json(result)
  } catch (err) {
    console.error('[roast]', err)
    if (err instanceof SyntaxError) return Response.json({ error: 'AI returned malformed data. Try again.' }, { status: 500 })
    return Response.json({ error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
