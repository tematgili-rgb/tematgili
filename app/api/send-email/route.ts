import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { newLeadEmail } from '@/lib/email-templates/new-lead'
import { leadConfirmationEmail } from '@/lib/email-templates/lead-confirmation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Payload =
  | { type: 'new_lead'; data: Parameters<typeof newLeadEmail>[0] }
  | { type: 'lead_confirmation'; data: { name: string; email: string } }

const FROM = 'תמתגילי <noreply@tematgili.co.il>'
const ADMIN_TO = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'tematgili@gmail.com'

export async function POST(req: NextRequest) {
  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || !('type' in body)) {
    return NextResponse.json({ ok: false, error: 'missing type' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log('[send-email] RESEND_API_KEY not set — skipping send', { type: body.type })
    return NextResponse.json({ ok: true, skipped: true })
  }

  try {
    const resend = new Resend(apiKey)

    if (body.type === 'new_lead') {
      const { subject, html, text } = newLeadEmail(body.data)
      await resend.emails.send({
        from: FROM,
        to: ADMIN_TO,
        subject,
        html,
        text,
      })
      return NextResponse.json({ ok: true })
    }

    if (body.type === 'lead_confirmation') {
      if (!body.data?.email || !body.data?.name) {
        return NextResponse.json(
          { ok: false, error: 'missing name/email' },
          { status: 400 }
        )
      }
      const { subject, html, text } = leadConfirmationEmail(body.data.name)
      await resend.emails.send({
        from: FROM,
        to: body.data.email,
        subject,
        html,
        text,
      })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: false, error: 'unknown type' }, { status: 400 })
  } catch (err) {
    console.error('[send-email] resend error', err)
    return NextResponse.json({ ok: false, error: 'send failed' }, { status: 500 })
  }
}
