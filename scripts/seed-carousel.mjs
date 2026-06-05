// Seed the homeCarousel Firestore collection with the 7 static product
// images that used to live in CAROUSEL_FILES (now removed from
// lib/staticImages.ts). Idempotent — skips items whose imageUrl already
// exists in the collection.
//
// Run: node scripts/seed-carousel.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

function loadEnv() {
  const envPath = path.join(rootDir, '.env.local')
  const raw = fs.readFileSync(envPath, 'utf8')
  const env = {}
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

const env = loadEnv()
const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'tematgili-69d5f'
const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL
let privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY
if (!clientEmail || !privateKey) {
  console.error('Missing FIREBASE_ADMIN_CLIENT_EMAIL or FIREBASE_ADMIN_PRIVATE_KEY in .env.local')
  process.exit(1)
}
privateKey = privateKey.replace(/\\n/g, '\n')

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
const db = getFirestore()

const ITEMS = [
  { imageUrl: '/products/coloring-book.png', tag: 'חוברות צביעה',    order: 1 },
  { imageUrl: '/products/chocolate.png',     tag: 'עטיפות שוקולד',    order: 2 },
  { imageUrl: '/products/snack.png',         tag: 'חטיפים ממותגים',   order: 3 },
  { imageUrl: '/products/packaging.png',     tag: 'קופסאות פופקורן',  order: 4 },
  { imageUrl: '/products/bundle.png',        tag: 'חבילות מוכנות',    order: 5 },
  { imageUrl: '/products/jar.png',           tag: 'צנצנות ממותגות',   order: 6 },
  { imageUrl: '/products/bubbles.png',       tag: 'בועות סבון',       order: 7 },
]

async function main() {
  const snap = await db.collection('homeCarousel').get()
  const existing = new Set(snap.docs.map((d) => d.data().imageUrl))
  console.log(`Existing homeCarousel docs: ${existing.size}`)

  let inserted = 0
  let skipped = 0
  for (const item of ITEMS) {
    if (existing.has(item.imageUrl)) {
      console.log(`  SKIP: ${item.imageUrl} (already exists)`)
      skipped++
      continue
    }
    const ref = await db.collection('homeCarousel').add({
      ...item,
      createdAt: Timestamp.now(),
    })
    console.log(`  INSERT [${ref.id}]: ${item.tag} (${item.imageUrl})`)
    inserted++
  }

  console.log(`\nInserted: ${inserted}  Skipped: ${skipped}\n`)

  const after = await db.collection('homeCarousel').orderBy('order', 'asc').get()
  console.log('homeCarousel collection now contains:')
  after.docs.forEach((d) => {
    const data = d.data()
    console.log(`  [${data.order}] ${data.tag} → ${data.imageUrl}`)
  })

  process.exit(0)
}

main().catch((err) => {
  console.error('FAILED:', err)
  process.exit(1)
})
