import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'tematgili@gmail.com'

function ensureAuth() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase auth is not configured')
  }
  return auth
}

export async function signIn(email: string, password: string): Promise<User> {
  const a = ensureAuth()
  const cred = await signInWithEmailAndPassword(a, email, password)
  if (!isAdmin(cred.user)) {
    await fbSignOut(a)
    throw new Error(`כניסה מותרת רק ל-${ADMIN_EMAIL}`)
  }
  return cred.user
}

export async function signUp(email: string, password: string): Promise<User> {
  const a = ensureAuth()
  const cred = await createUserWithEmailAndPassword(a, email, password)
  return cred.user
}

export async function signInWithGoogle(): Promise<User> {
  const a = ensureAuth()
  if (a.currentUser) return a.currentUser
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  const result = await signInWithPopup(a, provider)
  if (!isAdmin(result.user)) {
    await fbSignOut(a)
    throw new Error(`הכניסה מותרת רק לחשבון ${ADMIN_EMAIL}`)
  }
  return result.user
}

export async function signOut(): Promise<void> {
  if (!isFirebaseConfigured || !auth) return
  await fbSignOut(auth)
}

export function onAuthChange(cb: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured || !auth) {
    cb(null)
    return () => {}
  }
  return onAuthStateChanged(auth, cb)
}

export function isAdmin(user: User | null): boolean {
  return !!user && user.email === ADMIN_EMAIL
}

export { ADMIN_EMAIL }
