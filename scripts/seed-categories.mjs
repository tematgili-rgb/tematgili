// One-off script to seed the 7 built-in product categories into Firestore
// via the Firebase Admin SDK. Bypasses client-side security rules.
//
// Run: node scripts/seed-categories.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import admin from 'firebase-admin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// --- Load .env.local manually (handles \n in private key) ---
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
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

const env = loadEnv()
const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL
let privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing required env vars. Need NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY in .env.local')
  process.exit(1)
}

// Convert escaped \n into real newlines
privateKey = privateKey.replace(/\\n/g, '\n')

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
})

const db = admin.firestore()

// Hardcoded from lib/constants.ts PRODUCT_CATEGORIES (7 entries)
const CATEGORIES = [
  { id: 'coloring-book', name: 'חוברות צביעה',     icon: '📕' },
  { id: 'snack-wrap',    name: 'חטיפים',            icon: '🍫' },
  { id: 'popcorn-box',   name: 'קופסאות פופקורן',   icon: '🍿' },
  { id: 'party-hat',     name: 'כובעי מסיבה',       icon: '🎉' },
  { id: 'gift-box',      name: 'קופסאות מתנה',      icon: '🎁' },
  { id: 'bottle-label',  name: 'תוויות לבקבוקים',   icon: '🍼' },
  { id: 'backdrop-sign', name: 'שלטים ותפאורה',     icon: '🪧' },
]

async function main() {
  const col = db.collection('categories')
  let inserted = 0
  let skipped = 0

  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i]
    const existing = await col.where('slug', '==', c.id).limit(1).get()
    if (!existing.empty) {
      console.log(`SKIP   ${c.id} (already exists, id=${existing.docs[0].id})`)
      skipped++
      continue
    }
    const docData = {
      slug: c.id,
      name: c.name,
      icon: c.icon,
      imageUrls: [],
      sortOrder: i,
      isActive: true,
      isBuiltIn: true,
      createdAt: admin.firestore.Timestamp.now(),
    }
    const ref = await col.add(docData)
    console.log(`INSERT ${c.id} -> ${ref.id}`)
    inserted++
  }

  console.log(`\nDone. Inserted=${inserted}, Skipped=${skipped}`)

  // Verification dump
  console.log('\n--- Verification: categories collection ---')
  const all = await col.orderBy('sortOrder').get()
  console.log(`Total docs: ${all.size}`)
  all.forEach((d) => {
    const v = d.data()
    console.log(`  [${v.sortOrder}] ${d.id} | slug=${v.slug} | name=${v.name} | icon=${v.icon} | isActive=${v.isActive} | isBuiltIn=${v.isBuiltIn}`)
  })

  process.exit(0)
}

main().catch((err) => {
  console.error('FAILED:', err)
  process.exit(1)
})
