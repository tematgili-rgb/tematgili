'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import StarRating from './StarRating'

export default function ReviewSubmissionPage() {
  const router = useRouter()
  const params = useParams<{ token: string }>()
  const token = params?.token || ''

  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [productCategory, setProductCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('יש למלא שם')
      return
    }
    if (rating < 1) {
      setError('יש לבחור דירוג בכוכבים')
      return
    }
    if (!text.trim()) {
      setError('יש לכתוב את חוות הדעת')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/review/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          rating,
          text: text.trim(),
          productCategory: productCategory || undefined,
          imageUrl: imageUrl.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error('failed')
      setDone(true)
      setTimeout(() => router.push('/thank-you'), 3000)
    } catch {
      setError('שגיאה בשליחה, נסו שוב')
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-xl text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-primary-soft/50 p-8 md:p-12">
          <div className="text-5xl mb-4" aria-hidden>
            💕
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-dark mb-3">
            תודה!
          </h1>
          <p className="text-text-dark/70">
            הביקורת שלכם התקבלה ותעלה לאחר אישור 💕
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 md:py-14 max-w-xl">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-text-dark">
          איך הייתה החוויה שלכם?
        </h1>
        <p className="mt-3 text-text-dark/70">
          נשמח לשמוע מכם — חוות הדעת שלכם עוזרת לאחרים ולנו
        </p>
      </header>

      <form
        onSubmit={submit}
        className="bg-white rounded-2xl shadow-sm border border-primary-soft/50 p-6 md:p-8 space-y-6"
      >
        <div>
          <Label htmlFor="rev-name">שם מלא *</Label>
          <Input
            id="rev-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>דירוג *</Label>
          <div className="mt-2">
            <StarRating value={rating} onChange={setRating} disabled={submitting} />
          </div>
        </div>

        <div>
          <Label htmlFor="rev-text">חוות הדעת *</Label>
          <Textarea
            id="rev-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            required
            placeholder="ספרו לנו על החוויה..."
          />
        </div>

        <div>
          <Label htmlFor="rev-category">קטגוריית מוצר</Label>
          <Select value={productCategory} onValueChange={setProductCategory}>
            <SelectTrigger id="rev-category">
              <SelectValue placeholder="בחרו קטגוריה (אופציונלי)" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="rev-image">קישור לתמונה (אופציונלי)</Label>
          <Input
            id="rev-image"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
          <p className="text-xs text-text-dark/50 mt-1">
            ניתן לצרף קישור לתמונה מהאירוע
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-accent">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent text-white hover:bg-accent/90"
        >
          {submitting ? 'שולח...' : 'שליחת ביקורת'}
        </Button>
      </form>
    </div>
  )
}
