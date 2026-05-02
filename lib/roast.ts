import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export interface RoastCategory {
  name: string
  score: number
  feedback: string
  suggestion: string
}

export interface RoastFix {
  fix: string
  impact: 'High' | 'Medium' | 'Low'
  effort: 'Easy' | 'Medium' | 'Hard'
}

export interface RoastResult {
  overallScore: number
  grade: string
  roast: string
  whatIsWorking: string
  quickWin: string
  missingElements: string[]
  categories: RoastCategory[]
  fixes: RoastFix[]
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
    max_tokens: 3000,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are an expert conversion rate optimizer and landing page critic. You give sharp, specific feedback that founders can immediately act on. You reference actual content from the page. Return ONLY valid JSON.',
      },
      {
        role: 'user',
        content: `Analyze this landing page and return exactly this JSON structure:

{
  "overallScore": <integer 0-100>,
  "grade": <"A" | "B" | "C" | "D" | "F">,
  "roast": "<2-3 sentences, punchy overall impression — can be funny but must be honest>",
  "whatIsWorking": "<1-2 sentences on what the page actually does well — be specific, reference real content>",
  "quickWin": "<The single highest-ROI change they can make this week. Be extremely specific — name the exact element, what to change it to, and why it will move the needle. Reference actual page content.>",
  "missingElements": [
    "<Specific element that converting pages in this niche typically have but this page lacks — e.g. 'No pricing section — visitors can't self-qualify before contacting'>",
    "<Second missing element>",
    "<Third missing element>",
    "<Fourth missing element — only include if genuinely missing, skip if present>"
  ],
  "categories": [
    {
      "name": "Headline",
      "score": <0-10>,
      "feedback": "<What specifically is wrong with it and why it hurts conversion. Quote the actual headline.>",
      "suggestion": "<A concrete rewrite — give an actual headline they can copy-paste>"
    },
    {
      "name": "Value Proposition",
      "score": <0-10>,
      "feedback": "<Is it clear what the product does, who it's for, and why it's different? Be specific.>",
      "suggestion": "<How to sharpen it — give a concrete direction or rewrite>"
    },
    {
      "name": "Call-to-Action",
      "score": <0-10>,
      "feedback": "<Is the CTA clear, visible, compelling? Quote what the button actually says.>",
      "suggestion": "<Better CTA copy or placement — give the exact words>"
    },
    {
      "name": "Social Proof",
      "score": <0-10>,
      "feedback": "<What proof exists — testimonials, logos, numbers, reviews? Is it convincing or missing?>",
      "suggestion": "<What specific social proof to add and exactly where to put it>"
    },
    {
      "name": "Clarity",
      "score": <0-10>,
      "feedback": "<Can a stranger understand what this product does and who it's for within 5 seconds? Call out specific confusing phrases.>",
      "suggestion": "<Specific changes to make the offer immediately obvious>"
    }
  ],
  "fixes": [
    {
      "fix": "<Specific, actionable fix — reference actual page content. Explain what to change and what to change it to.>",
      "impact": <"High" | "Medium" | "Low">,
      "effort": <"Easy" | "Medium" | "Hard">
    },
    {
      "fix": "<Second fix>",
      "impact": <"High" | "Medium" | "Low">,
      "effort": <"Easy" | "Medium" | "Hard">
    },
    {
      "fix": "<Third fix>",
      "impact": <"High" | "Medium" | "Low">,
      "effort": <"Easy" | "Medium" | "Hard">
    },
    {
      "fix": "<Fourth fix>",
      "impact": <"High" | "Medium" | "Low">,
      "effort": <"Easy" | "Medium" | "Hard">
    },
    {
      "fix": "<Fifth fix>",
      "impact": <"High" | "Medium" | "Low">,
      "effort": <"Easy" | "Medium" | "Hard">
    }
  ]
}

SCORING GUIDE:
- 80-100 / A: Excellent. Clear, compelling, converts well.
- 65-79 / B: Good fundamentals, a few things to sharpen.
- 50-64 / C: Average. Works but won't stand out.
- 35-49 / D: Missing key elements or too vague.
- 0-34 / F: Visitors leave immediately.

Most pages score 45–75. Be fair and specific — vague feedback is useless.
The quickWin must be something they can realistically ship in a day or two.
missingElements should only list things that are genuinely absent — don't pad with minor issues.

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
