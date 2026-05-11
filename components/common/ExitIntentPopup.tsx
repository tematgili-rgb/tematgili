'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const COOKIE_NAME = 'exit_popup_seen'

function shouldShowPopup(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') return true
  // Production: read cookie
  return !document.cookie.split('; ').some((c) => c.startsWith(`${COOKIE_NAME}=`))
}

function markPopupSeen() {
  if (typeof window === 'undefined') return
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') return // never persist locally
  // 30-day cookie
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${COOKIE_NAME}=1; expires=${expires}; path=/; SameSite=Lax`
}

export default function ExitIntentPopup() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const shownThisLoadRef = useRef(false)

  const blocked =
    pathname?.startsWith('/admin') || pathname?.startsWith('/thank-you')

  useEffect(() => {
    if (blocked) return

    const triggerOpen = () => {
      if (shownThisLoadRef.current) return
      if (!shouldShowPopup()) return
      shownThisLoadRef.current = true
      setOpen(true)
    }

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) triggerOpen()
    }

    const timer = window.setTimeout(triggerOpen, 7000)
    document.addEventListener('mouseout', onMouseOut)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('mouseout', onMouseOut)
    }
  }, [blocked])

  const handleOpenChange = (next: boolean) => {
    if (!next && open) markPopupSeen()
    setOpen(next)
  }

  if (blocked) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !phone.trim()) {
      setError('יש למלא שם וטלפון')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/create-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, source: 'exit_intent' }),
      })
      if (!res.ok) throw new Error('failed')
      setDone(true)
      markPopupSeen()
      setTimeout(() => setOpen(false), 2000)
    } catch {
      setError('שגיאה בשליחה, נסו שוב')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader className="text-center">
          <DialogTitle className="text-center text-3xl md:text-4xl font-black text-text-dark mb-1">
            רוצים שנחזור אליכם? 💕
          </DialogTitle>
          <DialogDescription className="text-center mb-4">
            השאירו פרטים ונחזור אליכם לאירוע בלתי נשכח
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <p className="text-center py-4 text-text-dark">תודה! נחזור אליכם בקרוב 💕</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label htmlFor="exit-name">שם</Label>
              <Input
                id="exit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="exit-phone">טלפון</Label>
              <Input
                id="exit-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-accent">{error}</p>}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent text-white hover:bg-accent/90"
            >
              {submitting ? 'שולח...' : 'שליחה'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
