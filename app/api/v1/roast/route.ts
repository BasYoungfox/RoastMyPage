import { NextRequest } from 'next/server'
import { fetchPageContent, generateRoast } from '@/lib/roast'

export async function POST(request: NextRequest) {
  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { url } = body
  if (!url) return Response.json({ error: 'url is required' }, { status: 400 })

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return Response.json({ error: 'Invalid URL. Must include protocol (https://)' }, { status: 400 })
  }

  let pageContent: string
  try {
    pageContent = await fetchPageContent(parsedUrl.toString())
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'insufficient_content') return Response.json({ error: "Page doesn't have enough content to roast." }, { status: 422 })
    if (msg.includes('timeout') || msg.includes('abort')) return Response.json({ error: 'Page took too long to load.' }, { status: 408 })
    return Response.json({ error: "Couldn't fetch that URL. Make sure it's publicly accessible." }, { status: 400 })
  }

  try {
    const result = await generateRoast(pageContent)
    return Response.json({ url: parsedUrl.toString(), ...result })
  } catch (err) {
    console.error('[v1/roast]', err)
    if (err instanceof SyntaxError) return Response.json({ error: 'AI returned malformed data. Try again.' }, { status: 500 })
    return Response.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
