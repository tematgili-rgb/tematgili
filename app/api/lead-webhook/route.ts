import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const url = process.env.MAKE_WEBHOOK_URL
  if (!url) {
    return NextResponse.json({ skipped: true })
  }

  let body: any = {}
  try {
    body = await req.json()
  } catch {}

  const payload = {
    ...body,
    timestamp: new Date().toISOString(),
    source: body?.source || 'lead-webhook',
  }

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!r.ok) {
      console.error('[lead-webhook] downstream error', r.status)
      return NextResponse.json({ success: false, status: r.status }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[lead-webhook] fetch error', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
