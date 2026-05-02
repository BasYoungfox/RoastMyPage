import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export interface RoastCategory {
  name: string
  score: number
  feedback: string
}

export interface RoastResult {
  overallScore: number
  grade: string
  roast: string
  categories: RoastCategory[]
  fixes: string[]
}

export async function fetchPageContent(url: string): Promise<string> {
  const jinaUrl = `https://r.jina.ai/${url}`
  const response = await fetch(jinaUrl, {
    headers: { Accept: 'text/plain', 'X-No-Cache': 'true' },
    signal: AbortSignal.timeout(20000),
  })

  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const text = await response.text()
  if (!text || text.trim().length < 50) throw new Error('insufficient_content')

  return `URL: ${url}\n\n${text.slice(0, 3000)}`
}

export async function generateRoast(pageContent: string): Promise<RoastResult> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are a funny, sharp landing page critic. You roast pages like a stand-up comedian but every critique is backed by a real conversion insight. Return ONLY valid JSON — no markdown, no prose outside the JSON.',
      },
      {
        role: 'user',
        content: `Roast this landing page. Return exactly this JSON structure:

{
  "overallScore": <integer 0-100>,
  "grade": <"A" | "B" | "C" | "D" | "F">,
  "roast": "<2-3 sentences, funny and punchy overall impression>",
  "categories": [
    {"name": "Headline", "score": <0-10>, "feedback": "<1-2 sentences, specific and witty>"},
    {"name": "Value Proposition", "score": <0-10>, "feedback": "<feedback>"},
    {"name": "Call-to-Action", "score": <0-10>, "feedback": "<feedback>"},
    {"name": "Social Proof", "score": <0-10>, "feedback": "<feedback>"},
    {"name": "Copy Quality", "score": <0-10>, "feedback": "<feedback>"}
  ],
  "fixes": [
    "<specific, actionable fix — 1 sentence>",
    "<specific, actionable fix — 1 sentence>",
    "<specific, actionable fix — 1 sentence>"
  ]
}

SCORING GUIDE — be fair and realistic:
- 80-100 / A: Excellent. Clear, compelling, converts well.
- 65-79 / B: Good. Solid fundamentals, a few things to tighten up.
- 50-64 / C: Average. Gets the job done but won't wow anyone.
- 35-49 / D: Below average. Missing key elements or too generic.
- 0-34 / F: Needs serious work. Visitors leave immediately.

Most real pages score 45–75. Only go below 35 if genuinely terrible.

Page data:
${pageContent}`,
      },
    ],
  })

  const jsonText = (completion.choices[0].message.content ?? '')
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '')
    .trim()

  return JSON.parse(jsonText) as RoastResult
}
