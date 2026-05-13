'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ImageSelector from '@/components/admin/ImageSelector'
import { createDocument, updateDocument, deleteDocument } from '@/lib/db'
import { EVENT_TYPES } from '@/lib/constants'
import type { Package } from '@/lib/types'

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9א-ת]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface Props {
  initial?: Package
  packageId?: string
}

export default function PackageForm({ initial, packageId }: Props) {
  const router = useRouter()
  const isEdit = !!packageId

  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug)
  const [description, setDescription] = useState(initial?.description ?? '')
  const [startingPrice, setStartingPrice] = useState<number>(initial?.startingPrice ?? 0)
  const [includedItemsText, setIncludedItemsText] = useState(
    (initial?.includedItems ?? []).join('\n')
  )
  const [eventType, setEventType] = useState<string>(initial?.eventType ?? '')
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? 0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name))
  }, [name, slugTouched])

  const validate = (): string | null => {
    if (!name.trim()) return 'נדרש שם חבילה'
    if (!slug.trim()) return 'נדרש slug'
    if (!description.trim()) return 'נדרש תיאור'
    if (startingPrice <= 0) return 'המחיר חייב להיות חיובי'
    if (!imageUrl) return 'נדרשת תמונה'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const data: Omit<Package, 'id' | 'createdAt'> = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        startingPrice: Number(startingPrice),
        includedItems: includedItemsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        eventType: eventType || undefined,
        imageUrl,
        isActive,
        sortOrder: Number(sortOrder),
      }
      if (isEdit && packageId) {
        await updateDocument<Package>('packages', packageId, data)
      } else {
        await createDocument<typeof data>('packages', data)
      }
      router.push('/admin/packages')
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'שגיאה בשמירה')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!packageId) return
    if (!confirm(`למחוק את "${name}"?`)) return
    try {
      await deleteDocument('packages', packageId)
      router.push('/admin/packages')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">שם חבילה *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugTouched(true)
              }}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="desc">תיאור *</Label>
          <Textarea
            id="desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">מחיר התחלתי (₪) *</Label>
            <Input
              id="price"
              type="number"
              min={1}
              value={startingPrice}
              onChange={(e) => setStartingPrice(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <Label htmlFor="event">סוג אירוע</Label>
            <select
              id="event"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="h-10 w-full rounded-2xl border-2 border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">— ללא —</option>
              {EVENT_TYPES.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.emoji} {ev.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="sort">סדר תצוגה</Label>
            <Input
              id="sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="items">פריטים בחבילה (שורה לכל פריט)</Label>
          <Textarea
            id="items"
            rows={5}
            value={includedItemsText}
            onChange={(e) => setIncludedItemsText(e.target.value)}
            placeholder="חוברת צביעה&#10;50 עטיפות שוקולד&#10;שלט קישוט"
          />
        </div>

        <ImageSelector
          label="תמונת חבילה *"
          path={`packages/${slug || 'temp'}/main`}
          currentUrl={imageUrl}
          onChange={setImageUrl}
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm">חבילה פעילה</span>
        </label>
      </div>

      {error && <div className="bg-accent/10 text-accent rounded-2xl p-3 text-sm">{error}</div>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
          {isEdit ? 'שמור שינויים' : 'צור חבילה'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/packages')}>
          בטל
        </Button>
        {isEdit && (
          <Button type="button" variant="destructive" className="mr-auto" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 ml-1" /> מחק חבילה
          </Button>
        )}
      </div>
    </form>
  )
}
