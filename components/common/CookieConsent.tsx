'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Cookie } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'cookie_consent'

function setCookie(name: string, value: string, days: number): void {
  try {
    const exp = new Date()
    exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp.toUTCString()}; path=/; SameSite=Lax; max-age=${days * 24 * 60 * 60}`
  } catch {}
}

export default function CookieConsent() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let v: string | null = null
    try { v = localStorage.getItem(STORAGE_KEY) } catch {}
    if (v) return
    const t = setTimeout(() => setVisible(true), 1000)
    return () => clearTimeout(t)
  }, [])

  if (pathname?.startsWith('/admin')) return null
  if (!visible) return null

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, 'accepted') } catch {}
    setCookie(STORAGE_KEY, 'accepted', 365)
    try { window.dispatchEvent(new Event('cookieConsentAccepted')) } catch {}
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 right-0 left-0 z-40 bg-primary-soft/90 backdrop-blur border-t-2 border-primary shadow-2xl p-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="w-6 h-6 text-accent shrink-0 mt-0.5" aria-hidden />
          <p className="text-sm text-text-dark">
            אנו משתמשים בעוגיות לשיפור החוויה ולמעקב אנונימי. בהמשך הגלישה אתם מאשרים את השימוש.{' '}
            <Link href="/privacy" className="underline text-accent">
              מדיניות פרטיות
            </Link>
          </p>
        </div>
        <div className="flex justify-center w-full sm:w-auto sm:justify-start">
          <Button onClick={accept} className="w-full bg-accent text-white hover:bg-accent/90">
            מאשר/ת ✨
          </Button>
        </div>
      </div>
    </div>
  )
}
