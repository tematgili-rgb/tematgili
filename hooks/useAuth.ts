'use client'

import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { onAuthChange, isAdmin as checkIsAdmin } from '@/lib/auth'
import { isFirebaseConfigured } from '@/lib/firebase'
import { ADMIN_EMAIL } from '@/lib/constants'

function isLocalhost() {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [demo, setDemo] = useState(false)

  useEffect(() => {
    if (!isFirebaseConfigured && isLocalhost()) {
      setUser({ email: ADMIN_EMAIL, uid: 'demo' } as User)
      setDemo(true)
      setLoading(false)
      return
    }
    const unsubscribe = onAuthChange((u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return {
    user,
    loading,
    isAdmin: demo || checkIsAdmin(user),
    isDemo: demo,
  }
}
