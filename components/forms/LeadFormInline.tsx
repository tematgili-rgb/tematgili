'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EVENT_TYPES } from '@/lib/constants'
import { getGclid, setEnhancedConversionData, trackLeadSubmit } from '@/lib/tracking'

interface Props {
  source: string
  productInterest?: string
  className?: string
  onSuccess?: () => void
}

export default function LeadFormInline({ source, productInterest, className, onSuccess }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [eventType, setEventType] = useState<string>('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        body: JSON.stringify({
          name,
          phone,
          email: email || undefined,
          eventType: eventType || undefined,
          message: message || undefined,
          productInterest,
          source,
          gclid: getGclid(),
        }),
      })
      if (!res.ok) throw new Error('failed')
      const parts = name.trim().split(/\s+/)
      setEnhancedConversionData({
        email,
        phone,
        firstName: parts[0],
        lastName: parts[1],
      })
      trackLeadSubmit(source, 50)
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/thank-you')
      }
    } catch {
      setError('שגיאה בשליחה, נסו שוב')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className={['space-y-4', className || ''].join(' ')}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lead-name">שם מלא *</Label>
          <Input
            id="lead-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="lead-phone">טלפון *</Label>
          <Input
            id="lead-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="lead-email">אימייל</Label>
          <Input
            id="lead-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="lead-event-type">סוג אירוע</Label>
          <Select value={eventType} onValueChange={(v) => setEventType(v)}>
            <SelectTrigger id="lead-event-type">
              <SelectValue placeholder="בחרו אירוע" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.emoji} {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="lead-message">הודעה</Label>
        <Textarea
          id="lead-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
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
  )
}
