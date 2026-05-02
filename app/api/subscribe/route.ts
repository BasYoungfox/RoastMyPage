import { NextRequest } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function getOrCreateAudienceId(): Promise<string> {
  const { data: list } = await resend.audiences.list()
  const existing = (list?.data ?? []).find((a: { name: string }) => a.name === 'RoastThisPage')
  if (existing) return existing.id

  const { data: created } = await resend.audiences.create({ name: 'RoastThisPage' })
  return created!.id
}

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  }

  try {
    const audienceId = await getOrCreateAudienceId()

    await resend.contacts.create({ email, audienceId, unsubscribed: false })

    // Notify you — works on free plan since it's your own account email
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'elevatretech@gmail.com',
      subject: `New subscriber: ${email}`,
      html: `<p><strong>${email}</strong> just subscribed on RoastThisPage.</p>`,
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error('[subscribe]', err)
    return Response.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
