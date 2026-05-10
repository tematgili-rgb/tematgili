import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
)

let _app: FirebaseApp | undefined
let _auth: Auth | undefined
let _db: Firestore | undefined
let _storage: FirebaseStorage | undefined

if (isFirebaseConfigured) {
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig as Record<string, string>)
  _auth = getAuth(_app)
  _db = getFirestore(_app)
  _storage = getStorage(_app)
}

// Exported as definitely-typed; runtime callers must check `isFirebaseConfigured` first
// or call functions in lib/db.ts which guard with ensureFirebase().
export const app = _app as FirebaseApp
export const auth = _auth as Auth
export const db = _db as Firestore
export const storage = _storage as FirebaseStorage

export default app
