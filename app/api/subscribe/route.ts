import { NextRequest } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  }

  try {
    await Promise.all([
      // Welcome email to subscriber
      resend.emails.send({
        from: 'RoastThisPage <onboarding@resend.dev>',
        to: email,
        subject: 'You\'re on the list 🔥',
        html: `
          <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #1c1917;">
            <h2 style="font-size: 22px; font-weight: 900; margin-bottom: 16px;">You're in.</h2>
            <p style="color: #78716c; line-height: 1.7; margin-bottom: 16px;">
              Every week I'll tear apart a real landing page — what's broken, what works, and exactly how to fix it.
            </p>
            <p style="color: #78716c; line-height: 1.7; margin-bottom: 32px;">
              In the meantime, go roast another page at <a href="https://RoastThisPage.vercel.app" style="color: #1c1917;">RoastThisPage.vercel.app</a>.
            </p>
            <p style="color: #a8a29e; font-size: 13px;">— RoastThisPage</p>
          </div>
        `,
      }),

      // Notification to you
      resend.emails.send({
        from: 'RoastThisPage <onboarding@resend.dev>',
        to: 'elevatretech@gmail.com',
        subject: `New subscriber: ${email}`,
        html: `<p><strong>${email}</strong> just subscribed on RoastThisPage.</p>`,
      }),
    ])

    return Response.json({ success: true })
  } catch (err) {
    console.error('[subscribe]', err)
    return Response.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
