import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 5
const ipBuckets: Map<string, { count: number; resetAt: number }> = new Map()

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const b = ipBuckets.get(ip)
  if (!b || b.resetAt < now) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (b.count >= RATE_LIMIT_MAX) return false
  b.count += 1
  return true
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params?.token
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return NextResponse.json({ success: false, error: 'טוקן לא תקין' }, { status: 400 })
  }

  const ip = getClientIp(req)
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'יותר מדי בקשות, נסו שוב מאוחר יותר' },
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
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  const ratingNum = Number(body?.rating)
  const rating = Number.isInteger(ratingNum) ? ratingNum : NaN

  if (!name) {
    return NextResponse.json({ success: false, error: 'שם הוא שדה חובה' }, { status: 400 })
  }
  if (!text) {
    return NextResponse.json({ success: false, error: 'תוכן הביקורת הוא שדה חובה' }, { status: 400 })
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { success: false, error: 'דירוג חייב להיות בין 1 ל-5' },
      { status: 400 }
    )
  }

  const review: Record<string, any> = {
    name,
    text,
    rating,
    status: 'pending',
    featured: false,
    token,
    createdAt: FieldValue.serverTimestamp(),
  }
  if (typeof body?.productCategory === 'string' && body.productCategory.trim()) {
    review.productCategory = body.productCategory.trim()
  }
  if (typeof body?.imageUrl === 'string' && body.imageUrl.trim()) {
    review.imageUrl = body.imageUrl.trim()
  }

  try {
    await adminDb.collection('reviews').add(review)
  } catch (err) {
    console.error('[review] firestore error', err)
    return NextResponse.json({ success: false, error: 'שגיאה בשמירה' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
