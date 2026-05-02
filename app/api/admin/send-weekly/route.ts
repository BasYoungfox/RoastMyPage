import { NextRequest } from 'next/server'
import { Resend } from 'resend'
import { fetchPageContent, generateRoast, RoastResult } from '@/lib/roast'

const resend = new Resend(process.env.RESEND_API_KEY)

async function getAudienceId(): Promise<string | null> {
  const { data } = await resend.audiences.list()
  const audience = (data?.data ?? []).find((a: { name: string }) => a.name === 'RoastThisPage')
  return audience?.id ?? null
}

async function getAllContacts(audienceId: string): Promise<string[]> {
  const { data } = await resend.contacts.list({ audienceId })
  return (data?.data ?? [])
    .filter((c: { unsubscribed: boolean }) => !c.unsubscribed)
    .map((c: { email: string }) => c.email)
}

function buildEmailHtml(url: string, roast: RoastResult, issueNumber: number): string {
  const gradeColor: Record<string, string> = {
    A: '#059669', B: '#2563eb', C: '#ca8a04', D: '#ea580c', F: '#dc2626',
  }
  const color = gradeColor[roast.grade] ?? '#1c1917'

  const categoriesHtml = roast.categories.map((cat) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #e7e5e4; font-size: 14px; color: #44403c;">${cat.name}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #e7e5e4; text-align: center; font-size: 14px; color: #78716c;">${cat.score}/10</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #e7e5e4; font-size: 13px; color: #78716c; font-style: italic;">${cat.feedback}</td>
    </tr>
  `).join('')

  const fixesHtml = roast.fixes.map((fix, i) => `
    <p style="margin: 0 0 10px; font-size: 14px; color: #44403c;">
      <span style="font-weight: 700; color: #dc2626;">${i + 1}.</span> ${fix}
    </p>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin: 0; padding: 0; background: #f5f0e8; font-family: Georgia, serif;">
  <div style="max-width: 580px; margin: 40px auto; background: #fffdf7; border: 2px solid #d6d3d1; box-shadow: 4px 4px 0 rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: #1c1917; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center;">
      <span style="color: #fef3c7; font-weight: 700; font-size: 14px; letter-spacing: 0.05em;">RoastThisPage</span>
      <span style="color: #78716c; font-size: 12px;">Issue #${issueNumber}</span>
    </div>

    <!-- Title -->
    <div style="padding: 28px 32px 20px; border-bottom: 2px solid #d6d3d1;">
      <p style="margin: 0 0 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #a8a29e; font-family: Arial, sans-serif;">Weekly Landing Page Teardown</p>
      <h1 style="margin: 0 0 6px; font-size: 22px; font-weight: 900; color: #1c1917;">This week's victim</h1>
      <p style="margin: 0; font-size: 13px; color: #a8a29e;">${url}</p>
    </div>

    <!-- Grade -->
    <div style="padding: 28px 32px; border-bottom: 2px solid #d6d3d1; display: flex; align-items: center; gap: 24px;">
      <div style="text-align: center; min-width: 80px;">
        <div style="font-size: 72px; font-weight: 900; line-height: 1; color: ${color};">${roast.grade}</div>
        <div style="font-size: 11px; color: #a8a29e; margin-top: 4px; font-family: Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.1em;">Grade</div>
      </div>
      <div style="flex: 1;">
        <div style="font-size: 32px; font-weight: 900; color: #1c1917;">${roast.overallScore}<span style="font-size: 16px; color: #a8a29e; font-weight: 400;">/100</span></div>
        <blockquote style="margin: 12px 0 0; padding: 12px 16px; border-left: 4px solid #dc2626; background: #fef2f2;">
          <p style="margin: 0; font-size: 15px; color: #44403c; font-style: italic; line-height: 1.6;">"${roast.roast}"</p>
        </blockquote>
      </div>
    </div>

    <!-- Breakdown -->
    <div style="padding: 24px 32px; border-bottom: 2px solid #d6d3d1;">
      <p style="margin: 0 0 16px; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #a8a29e; font-family: Arial, sans-serif;">Category Breakdown</p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; font-size: 11px; color: #a8a29e; font-weight: 600; padding-bottom: 8px; font-family: Arial, sans-serif;">Subject</th>
            <th style="text-align: center; font-size: 11px; color: #a8a29e; font-weight: 600; padding-bottom: 8px; font-family: Arial, sans-serif; width: 60px;">Score</th>
            <th style="text-align: left; font-size: 11px; color: #a8a29e; font-weight: 600; padding-bottom: 8px; font-family: Arial, sans-serif;">Notes</th>
          </tr>
        </thead>
        <tbody>${categoriesHtml}</tbody>
      </table>
    </div>

    <!-- Fixes -->
    <div style="padding: 24px 32px; border-bottom: 2px solid #d6d3d1;">
      <p style="margin: 0 0 16px; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #a8a29e; font-family: Arial, sans-serif;">Remedial Work Required</p>
      ${fixesHtml}
    </div>

    <!-- CTA -->
    <div style="padding: 24px 32px; text-align: center; border-bottom: 2px solid #d6d3d1;">
      <p style="margin: 0 0 16px; font-size: 14px; color: #78716c;">Want your page roasted next?</p>
      <a href="https://roastthispage.vercel.app" style="display: inline-block; background: #1c1917; color: #fef3c7; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 12px 24px;">Roast My Page →</a>
    </div>

    <!-- Footer -->
    <div style="padding: 16px 32px; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #a8a29e;">
        Signed, Professor AI · <a href="{{unsubscribe_url}}" style="color: #a8a29e;">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  let url: string, password: string, issueNumber: number, preview: boolean
  try {
    ;({ url, password, issueNumber = 1, preview = false } = await request.json())
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!url) return Response.json({ error: 'URL required' }, { status: 400 })

  // Fetch and roast the page
  let pageContent: string
  try {
    pageContent = await fetchPageContent(url)
  } catch {
    return Response.json({ error: "Couldn't fetch that page." }, { status: 400 })
  }

  let roast
  try {
    roast = await generateRoast(pageContent)
  } catch {
    return Response.json({ error: 'AI failed to generate the roast. Try again.' }, { status: 500 })
  }

  const html = buildEmailHtml(url, roast, issueNumber)

  // Preview mode — just return the roast without sending
  if (preview) {
    return Response.json({ roast, html })
  }

  // Get audience and contacts
  let audienceId: string | null
  let contacts: string[]
  try {
    audienceId = await getAudienceId()
    if (!audienceId) return Response.json({ error: 'No audience found. Subscribe someone first.' }, { status: 400 })
    contacts = await getAllContacts(audienceId)
    if (contacts.length === 0) return Response.json({ error: 'No subscribers yet.' }, { status: 400 })
  } catch {
    return Response.json({ error: 'Failed to fetch subscribers from Resend.' }, { status: 500 })
  }

  // Send in batches of 50 (Resend limit)
  try {
    const batches = []
    for (let i = 0; i < contacts.length; i += 50) {
      batches.push(contacts.slice(i, i + 50))
    }

    let sent = 0
    for (const batch of batches) {
      await Promise.all(batch.map((to) =>
        resend.emails.send({
          from: 'onboarding@resend.dev',
          to,
          subject: `Issue #${issueNumber} — ${url} got roasted (${roast.overallScore}/100)`,
          html,
        })
      ))
      sent += batch.length
    }

    return Response.json({ success: true, sent, roast })
  } catch {
    return Response.json({ error: 'Failed to send emails.' }, { status: 500 })
  }
}
