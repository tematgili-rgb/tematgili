import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10
const ipBuckets: Map<string, { count: number; resetAt: number }> = new Map()

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const bucket = ipBuckets.get(ip)
  if (!bucket || bucket.resetAt < now) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false
  bucket.count += 1
  return true
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

const PHONE_REGEX = /^05\d{8}$/

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'יותר מדי בקשות, נסו שוב בעוד דקה' },
        { status: 429 }
      )
    }

    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ success: false, error: 'גוף בקשה לא תקין' }, { status: 400 })
    }

    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const phoneRaw = typeof body?.phone === 'string' ? body.phone.trim() : ''
    const phone = phoneRaw.replace(/[\s-]/g, '')

    if (!name) {
      return NextResponse.json({ success: false, error: 'שם הוא שדה חובה' }, { status: 400 })
    }
    if (!PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'מספר טלפון לא תקין (חייב להתחיל ב-05 ולכלול 10 ספרות)' },
        { status: 400 }
      )
    }

    const lead: Record<string, any> = {
      name,
      phone,
      source: typeof body?.source === 'string' ? body.source : 'home_form',
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    }
    if (typeof body?.email === 'string' && body.email.trim()) lead.email = body.email.trim()
    if (typeof body?.message === 'string' && body.message.trim()) lead.message = body.message.trim()
    if (typeof body?.productInterest === 'string' && body.productInterest.trim())
      lead.productInterest = body.productInterest.trim()
    if (typeof body?.eventType === 'string' && body.eventType.trim())
      lead.eventType = body.eventType.trim()
    if (typeof body?.gclid === 'string' && body.gclid.trim()) lead.gclid = body.gclid.trim()

    const ref = await adminDb.collection('leads').add(lead)

    // Fire-and-forget: notify admin via /api/send-email
    const origin = req.nextUrl.origin
    const fireForget = async () => {
      try {
        await fetch(`${origin}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_lead',
            data: {
              name: lead.name,
              phone: lead.phone,
              email: lead.email,
              message: lead.message,
              source: lead.source,
              productInterest: lead.productInterest,
              eventType: lead.eventType,
            },
          }),
        })
      } catch (err) {
        console.error('[create-lead] send-email failed', err)
      }

      if (process.env.WEBHOOK_URL) {
        try {
          await fetch(`${origin}/api/lead-webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ref.id, ...lead, createdAt: new Date().toISOString() }),
          })
        } catch (err) {
          console.error('[create-lead] webhook failed', err)
        }
      }
    }
    void fireForget()

    return NextResponse.json({ success: true, id: ref.id })
  } catch (err) {
    console.error('[create-lead] error', err)
    return NextResponse.json(
      { success: false, error: 'שגיאה בשרת, נסו שוב מאוחר יותר' },
      { status: 500 }
    )
  }
}
