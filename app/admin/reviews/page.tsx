'use client'

import { useEffect, useState } from 'react'
import { Star, Trash2, Check, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import ImageDropzone from '@/components/admin/ImageDropzone'
import { getAllDocuments, createDocument, updateDocument, deleteDocument } from '@/lib/db'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { Review, ProductCategoryId } from '@/lib/types'

export default function AdminReviewsPage() {
  return (
    <ProtectedRoute>
      <Reviews />
    </ProtectedRoute>
  )
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= count ? 'fill-twine text-twine' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'approved'>('pending')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAllDocuments<Review>('reviews')
      setReviews(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (r: Review) => {
    try {
      await updateDocument<Review>('reviews', r.id, { status: 'approved' })
      setReviews((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, status: 'approved' } : x))
      )
    } catch (e) {
      console.error(e)
    }
  }

  const handleToggleFeatured = async (r: Review) => {
    try {
      await updateDocument<Review>('reviews', r.id, { featured: !r.featured })
      setReviews((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, featured: !r.featured } : x))
      )
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (r: Review) => {
    if (!confirm(`למחוק ביקורת מ-${r.name}?`)) return
    try {
      await deleteDocument('reviews', r.id)
      setReviews((prev) => prev.filter((x) => x.id !== r.id))
    } catch (e) {
      console.error(e)
    }
  }

  const pending = reviews.filter((r) => r.status === 'pending')
  const approved = reviews.filter((r) => r.status === 'approved')
  const list = tab === 'pending' ? pending : approved

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-dark mb-1">ניהול ביקורות</h2>
          <p className="text-gray-600">{reviews.length} ביקורות סה"כ</p>
        </div>
        <Button onClick={() => setShowAdd((s) => !s)}>
          {showAdd ? <X className="w-4 h-4 ml-1" /> : <Plus className="w-4 h-4 ml-1" />}
          {showAdd ? 'סגור' : 'הוסף ביקורת'}
        </Button>
      </div>

      {showAdd && <AddReviewForm onAdded={load} />}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
            tab === 'pending' ? 'bg-primary text-white' : 'bg-white text-text-dark shadow'
          }`}
        >
          ממתינות לאישור ({pending.length})
        </button>
        <button
          onClick={() => setTab('approved')}
          className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
            tab === 'approved' ? 'bg-primary text-white' : 'bg-white text-text-dark shadow'
          }`}
        >
          מאושרות ({approved.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg text-gray-500">
          <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>אין ביקורות {tab === 'pending' ? 'ממתינות' : 'מאושרות'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                {r.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.imageUrl}
                    alt={r.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-dark">{r.name}</h3>
                  <Stars count={r.rating} />
                </div>
                {r.featured && (
                  <span className="bg-cream text-twine text-xs px-2 py-1 rounded-full">
                    מומלצת
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{r.text}</p>
              {r.productCategory && (
                <p className="text-xs text-gray-500">
                  קטגוריה: {PRODUCT_CATEGORIES.find((c) => c.id === r.productCategory)?.name ?? r.productCategory}
                </p>
              )}
              <div className="flex gap-2 pt-2 border-t border-primary-soft">
                {r.status === 'pending' ? (
                  <Button size="sm" onClick={() => handleApprove(r)}>
                    <Check className="w-4 h-4 ml-1" /> אשר
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleFeatured(r)}
                  >
                    <Star
                      className={`w-4 h-4 ml-1 ${r.featured ? 'fill-twine text-twine' : ''}`}
                    />
                    {r.featured ? 'בטל מומלצת' : 'סמן כמומלצת'}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent hover:text-white"
                  onClick={() => handleDelete(r)}
                >
                  <Trash2 className="w-4 h-4 ml-1" /> מחק
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddReviewForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [productCategory, setProductCategory] = useState<string>('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !text.trim()) {
      setError('שם ותוכן חובה')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await createDocument('reviews', {
        name: name.trim(),
        rating: Number(rating),
        text: text.trim(),
        productCategory: (productCategory || undefined) as ProductCategoryId | undefined,
        status: 'approved',
        featured: false,
        imageUrl: imageUrl || undefined,
      })
      setName('')
      setText('')
      setRating(5)
      setImageUrl('')
      setProductCategory('')
      onAdded()
    } catch (e: any) {
      setError(e?.message || 'שגיאה')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-4"
      dir="rtl"
    >
      <h3 className="font-bold text-text-dark">ביקורת ידנית חדשה</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="r-name">שם *</Label>
          <Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="r-rating">דירוג *</Label>
          <select
            id="r-rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="h-10 w-full rounded-2xl border-2 border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} כוכבים
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="r-text">תוכן *</Label>
        <Textarea
          id="r-text"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="r-cat">קטגוריית מוצר</Label>
        <select
          id="r-cat"
          value={productCategory}
          onChange={(e) => setProductCategory(e.target.value)}
          className="h-10 w-full rounded-2xl border-2 border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">— ללא —</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>
      <ImageDropzone
        label="תמונת ביקורת (אופציונלי)"
        path="reviews/manual"
        currentUrl={imageUrl}
        onUpload={setImageUrl}
      />
      {error && <p className="text-sm text-accent">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
        שמור ביקורת
      </Button>
    </form>
  )
}
