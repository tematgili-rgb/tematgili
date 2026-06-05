// Deploy Firestore security rules via the Firebase Rules REST API,
// authenticated with the service account from .env.local.
// Adds a `match /categories/{categoryId}` block if missing.
//
// Run: node scripts/deploy-firestore-rules.mjs

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
const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL
let privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY

if (!clientEmail || !privateKey) {
  console.error('Missing FIREBASE_ADMIN_CLIENT_EMAIL or FIREBASE_ADMIN_PRIVATE_KEY in .env.local')
  process.exit(1)
}
privateKey = privateKey.replace(/\\n/g, '\n')

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

function injectRules(source, blocks) {
  // Inject before the closing brace of `match /databases/{database}/documents {`
  const openRe = /match\s*\/databases\/\{database\}\/documents\s*\{/
  const openMatch = source.match(openRe)
  if (!openMatch) return null

  // Find the matching closing brace by counting braces from after openMatch
  const startIdx = openMatch.index + openMatch[0].length
  let depth = 1
  let i = startIdx
  while (i < source.length && depth > 0) {
    const ch = source[i]
    if (ch === '{') depth++
    else if (ch === '}') depth--
    if (depth === 0) break
    i++
  }
  if (depth !== 0) return null
  // i is the index of the closing '}' of the documents block
  const combined = '\n' + blocks.join('\n') + '\n'
  return source.slice(0, i) + combined + source.slice(i)
}

const RULE_BLOCKS = {
  categories: `    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'tematgili@gmail.com';
    }`,
  gallery: `    match /gallery/{id} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'tematgili@gmail.com';
    }`,
  homeCarousel: `    match /homeCarousel/{id} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'tematgili@gmail.com';
    }`,
}

const RULE_MARKERS = {
  categories: 'match /categories/',
  gallery: 'match /gallery/',
  homeCarousel: 'match /homeCarousel/',
}

async function main() {
  console.log(`Project: ${projectId}`)
  console.log(`Service account: ${clientEmail}\n`)

  const token = await getAccessToken()
  console.log('Got access token.\n')

  // 1. Get active release
  const releaseName = `projects/${projectId}/releases/cloud.firestore`
  const release = await apiGet(`https://firebaserules.googleapis.com/v1/${releaseName}`, token)
  console.log('Current release:')
  console.log(JSON.stringify(release, null, 2))
  console.log()

  const currentRulesetName = release.rulesetName
  // 2. Get current ruleset source
  const ruleset = await apiGet(`https://firebaserules.googleapis.com/v1/${currentRulesetName}`, token)
  const files = ruleset.source?.files || []
  if (files.length === 0) {
    console.error('No source files in ruleset. Aborting.')
    process.exit(1)
  }
  const file = files[0]
  const currentSource = file.content
  console.log('=== BEFORE (current rules) ===')
  console.log(currentSource)
  console.log('=== END BEFORE ===\n')

  // 3. Identify which rule blocks are missing
  const missing = Object.keys(RULE_BLOCKS).filter(
    (key) => !currentSource.includes(RULE_MARKERS[key])
  )
  if (missing.length === 0) {
    console.log('All target rules already present. Skipping deploy.')
    process.exit(0)
  }
  console.log(`Missing rules: ${missing.join(', ')}`)

  // 4. Inject missing rule blocks
  const blocks = missing.map((key) => RULE_BLOCKS[key])
  const newSource = injectRules(currentSource, blocks)
  if (!newSource) {
    console.error('Could not locate `match /databases/{database}/documents { ... }` block. Aborting — please update via Console.')
    process.exit(1)
  }

  console.log('=== AFTER (new rules) ===')
  console.log(newSource)
  console.log('=== END AFTER ===\n')

  // 5. Create new ruleset
  const createBody = {
    source: {
      files: [{ name: file.name || 'firestore.rules', content: newSource }],
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

  // 6. Update release to point at new ruleset. The projects.releases.update
  //    RPC uses an UpdateReleaseRequest body: { release: Release, updateMask? }
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

  // 7. Verify
  const verifyRelease = await apiGet(`https://firebaserules.googleapis.com/v1/${releaseName}`, token)
  console.log('Verification — active release after deploy:')
  console.log(JSON.stringify(verifyRelease, null, 2))
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
