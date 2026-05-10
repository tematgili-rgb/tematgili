import { cert, getApps, initializeApp, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let cachedApp: App | null = null

function getAdminApp(): App {
  if (cachedApp) return cachedApp

  const existing = getApps()
  if (existing.length) {
    cachedApp = existing[0]
    return cachedApp
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY.'
    )
  }

  cachedApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })
  return cachedApp
}

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    const fs = getFirestore(getAdminApp())
    const value = (fs as any)[prop]
    return typeof value === 'function' ? value.bind(fs) : value
  },
})

export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const a = getAuth(getAdminApp())
    const value = (a as any)[prop]
    return typeof value === 'function' ? value.bind(a) : value
  },
})
