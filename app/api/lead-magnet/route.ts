import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MAGNETS = {
  'event-checklist': 'צ׳קליסט אירוע',
  'gifts-guide': 'מדריך מתנות',
} as const

type MagnetKey = keyof typeof MAGNETS

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'גוף בקשה לא תקין' }, { status: 400 })
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const magnet = body?.magnet as MagnetKey

  if (!name) {
    return NextResponse.json({ success: false, error: 'שם הוא שדה חובה' }, { status: 400 })
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ success: false, error: 'אימייל לא תקין' }, { status: 400 })
  }
  if (!magnet || !(magnet in MAGNETS)) {
    return NextResponse.json({ success: false, error: 'מדריך לא תקין' }, { status: 400 })
  }

  try {
    await adminDb.collection('leads').add({
      name,
      email,
      phone: '',
      source: 'lead_magnet',
      message: `הוריד מדריך: ${MAGNETS[magnet]}`,
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    })
  } catch (err) {
    console.error('[lead-magnet] firestore error', err)
    return NextResponse.json(
      { success: false, error: 'שגיאה בשמירה' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    downloadUrl: `/downloads/${magnet}.pdf`,
  })
}
