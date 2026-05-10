'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { Loader2, LogIn, Mail, KeyRound } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/firebase'
import { signIn, isAdmin } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import { SITE_NAME } from '@/lib/constants'

export default function AdminLoginPage() {
  const router = useRouter()
  const { user, loading, isAdmin: alreadyAdmin } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (!loading && user && alreadyAdmin) {
      router.replace('/admin')
    }
  }, [loading, user, alreadyAdmin, router])

  const handleGoogle = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(auth, provider)
      if (!isAdmin(cred.user)) {
        setError('משתמש זה אינו מורשה לאדמין')
        return
      }
      router.push('/admin')
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'שגיאת התחברות')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError('נא למלא אימייל וסיסמה')
      return
    }
    setSubmitting(true)
    try {
      const u = await signIn(email, password)
      if (!isAdmin(u)) {
        setError('משתמש זה אינו מורשה לאדמין')
        return
      }
      router.push('/admin')
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'שגיאת התחברות')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-soft p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">כניסה לאדמין</CardTitle>
          <p className="text-center text-sm text-gray-500">{SITE_NAME} — ניהול האתר</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="default"
            className="w-full"
            onClick={handleGoogle}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4 ml-2" />
            )}
            כניסה עם Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-primary-soft" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500">או באימייל</span>
            </div>
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email">אימייל</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  className="pr-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">סיסמה</Label>
              <div className="relative">
                <KeyRound className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
            <Button type="submit" variant="outline" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : null}
              כניסה
            </Button>
          </form>

          {error && (
            <p className="text-sm text-accent text-center bg-primary-soft/40 p-2 rounded-2xl">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
