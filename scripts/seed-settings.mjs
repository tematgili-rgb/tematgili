// One-off seeder: ensure settings/site has the correct contact email +
// working hours (and other defaults from CONTACT_INFO). Merges with any
// existing values — does not overwrite fields the admin has already set.
//
// Run: node scripts/seed-settings.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

function loadEnv() {
  const raw = fs.readFileSync(path.join(rootDir, '.env.local'), 'utf8')
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
  console.error('Missing admin credentials in .env.local')
  process.exit(1)
}
privateKey = privateKey.replace(/\\n/g, '\n')

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
const db = getFirestore()

const TARGET = {
  contactPhone: '052-479-6726',
  contactWhatsapp: '972524796726',
  contactEmail: 'tematgili@gmail.com',
  instagramUrl: 'https://www.instagram.com/tematgili/',
  facebookUrl: '',
  workingHours: 'א-ה 09:00-21:00 | ו 09:00-13:00',
}

async function main() {
  const ref = db.collection('settings').doc('site')
  const snap = await ref.get()
  const existing = snap.exists ? snap.data() : {}
  console.log('Current settings/site:')
  console.log(JSON.stringify(existing, null, 2))

  // Only overwrite the email — force it to the correct value the user gave.
  // For other fields, only seed if missing (don't clobber admin edits).
  const patch = { contactEmail: TARGET.contactEmail }
  for (const [k, v] of Object.entries(TARGET)) {
    if (k === 'contactEmail') continue
    if (existing[k] == null || existing[k] === '') patch[k] = v
  }

  patch.updatedAt = FieldValue.serverTimestamp()

  await ref.set(patch, { merge: true })
  console.log('\nApplied patch:')
  console.log(JSON.stringify(patch, null, 2))

  const after = (await ref.get()).data()
  console.log('\nsettings/site after merge:')
  console.log(JSON.stringify(after, null, 2))
  process.exit(0)
}

main().catch((err) => {
  console.error('FAILED:', err)
  process.exit(1)
})
