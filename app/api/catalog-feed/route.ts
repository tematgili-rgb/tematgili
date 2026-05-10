import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tematgili.co.il'

function escapeXml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function wrap(items: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>תמתגילי - קטלוג מוצרים</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>מוצרי מיתוג מודפסים בהתאמה אישית</description>
${items}
  </channel>
</rss>`
}

export async function GET() {
  let products: any[] = []
  try {
    const snap = await adminDb
      .collection('products')
      .where('isActive', '==', true)
      .get()
    products = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('[catalog-feed]', err)
    return new NextResponse(wrap(''), {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    })
  }

  const items = products
    .map((p) => {
      const link = `${SITE_URL}/products/${escapeXml(p.slug || p.id)}`
      const image = escapeXml(p.mainImageUrl || '')
      const price = `${Number(p.startingPrice || 0).toFixed(2)} ILS`
      return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.name || '')}</g:title>
      <g:description>${escapeXml(p.shortDescription || p.longDescription || '')}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${image}</g:image_link>
      <g:availability>in stock</g:availability>
      <g:price>${price}</g:price>
      <g:condition>new</g:condition>
      <g:brand>תמתגילי</g:brand>
      <g:product_type>${escapeXml(p.category || '')}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`
    })
    .join('\n')

  return new NextResponse(wrap(items), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
