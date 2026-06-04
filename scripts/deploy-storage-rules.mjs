// Deploy Firebase Storage security rules via the Firebase Rules REST API,
// authenticated with the service account from .env.local.
//
// Run: node scripts/deploy-storage-rules.mjs

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// --- Load .env.local manually ---
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
const bucket =
  env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`
const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL
let privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY

if (!clientEmail || !privateKey) {
  console.error('Missing FIREBASE_ADMIN_CLIENT_EMAIL or FIREBASE_ADMIN_PRIVATE_KEY in .env.local')
  process.exit(1)
}
privateKey = privateKey.replace(/\\n/g, '\n')

const NEW_RULES = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'tematgili@gmail.com';
    }
  }
}
`

// --- Mint JWT and exchange for access token ---
function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }
  const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(unsigned)
  const signature = signer.sign(privateKey)
  const jwt = `${unsigned}.${b64url(signature)}`

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  })
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Token exchange failed: ${JSON.stringify(json)}`)
  return json.access_token
}

async function apiGet(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const json = await res.json()
  if (!res.ok) throw new Error(`GET ${url} failed: ${JSON.stringify(json)}`)
  return json
}

async function apiJson(method, url, token, body) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`${method} ${url} failed: ${JSON.stringify(json)}`)
  return json
}

async function main() {
  console.log(`Project: ${projectId}`)
  console.log(`Bucket: ${bucket}`)
  console.log(`Service account: ${clientEmail}\n`)

  const token = await getAccessToken()
  console.log('Got access token.\n')

  // Storage release name format: firebase.storage/<bucket>
  const releaseName = `projects/${projectId}/releases/firebase.storage/${bucket}`

  // 1. Get active release (may not exist yet if Storage was never set up)
  let release
  try {
    release = await apiGet(`https://firebaserules.googleapis.com/v1/${releaseName}`, token)
    console.log('Current release:')
    console.log(JSON.stringify(release, null, 2))
    console.log()
  } catch (e) {
    console.error('Could not fetch current Storage release. The bucket may not exist yet.')
    console.error('Error:', e.message)
    process.exit(1)
  }

  // 2. Print current ruleset source (best-effort)
  try {
    const currentRulesetName = release.rulesetName
    const ruleset = await apiGet(`https://firebaserules.googleapis.com/v1/${currentRulesetName}`, token)
    const currentSource = ruleset.source?.files?.[0]?.content
    if (currentSource) {
      console.log('=== BEFORE (current rules) ===')
      console.log(currentSource)
      console.log('=== END BEFORE ===\n')
    }
  } catch (e) {
    console.log('(Could not fetch current ruleset source — continuing.)\n')
  }

  console.log('=== AFTER (new rules) ===')
  console.log(NEW_RULES)
  console.log('=== END AFTER ===\n')

  // 3. Create new ruleset
  const createBody = {
    source: {
      files: [{ name: 'storage.rules', content: NEW_RULES }],
    },
  }
  const newRuleset = await apiJson(
    'POST',
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
    token,
    createBody
  )
  console.log('Created new ruleset:')
  console.log(JSON.stringify(newRuleset, null, 2))
  console.log()

  // 4. Update release to point at new ruleset.
  const patched = await apiJson(
    'PATCH',
    `https://firebaserules.googleapis.com/v1/${releaseName}`,
    token,
    {
      release: {
        name: releaseName,
        rulesetName: newRuleset.name,
      },
      updateMask: 'rulesetName',
    }
  )
  console.log('Patched release:')
  console.log(JSON.stringify(patched, null, 2))
  console.log()

  // 5. Verify
  const verifyRelease = await apiGet(`https://firebaserules.googleapis.com/v1/${releaseName}`, token)
  console.log('Verification — active release after deploy:')
  console.log(`  name:        ${verifyRelease.name}`)
  console.log(`  rulesetName: ${verifyRelease.rulesetName}`)
  const verifyRuleset = await apiGet(`https://firebaserules.googleapis.com/v1/${verifyRelease.rulesetName}`, token)
  console.log('Verification — active ruleset source:')
  console.log(verifyRuleset.source.files[0].content)

  console.log('\nDeploy complete.')
  process.exit(0)
}

main().catch((err) => {
  console.error('FAILED:', err)
  process.exit(1)
})
