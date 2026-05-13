'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ImageSelector from '@/components/admin/ImageSelector'
import ImagePickerDialog from '@/components/admin/ImagePickerDialog'
import { createDocument, updateDocument, deleteDocument } from '@/lib/db'
import { uploadFile } from '@/lib/storage'
import { EVENT_TYPES } from '@/lib/constants'
import { getMergedCategories, type MergedCategory } from '@/lib/categories'
import type { Product, ProductCategoryId } from '@/lib/types'

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9א-ת]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface Props {
  initial?: Product
  productId?: string
}

export default function ProductForm({ initial, productId }: Props) {
  const router = useRouter()
  const isEdit = !!productId

  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug)
  const [category, setCategory] = useState<ProductCategoryId>(
    initial?.category ?? 'coloring-book'
  )
  const [categories, setCategories] = useState<MergedCategory[]>([])
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? '')
  const [longDescription, setLongDescription] = useState(initial?.longDescription ?? '')
  const [pricePerUnit, setPricePerUnit] = useState<number | ''>(
    initial?.pricePerUnit ?? ''
  )
  const [packagePrice, setPackagePrice] = useState<number | ''>(
    initial?.packagePrice ?? ''
  )
  const [packageQuantity, setPackageQuantity] = useState<number | ''>(
    initial?.packageQuantity ?? 50
  )
  const [minQuantity, setMinQuantity] = useState<number>(initial?.minQuantity ?? 1)
  const [featuresText, setFeaturesText] = useState((initial?.features ?? []).join('\n'))
  const [occasions, setOccasions] = useState<string[]>(initial?.occasions ?? [])
  const [mainImageUrl, setMainImageUrl] = useState(initial?.mainImageUrl ?? '')
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initial?.galleryUrls ?? [])
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false)
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false)
  const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? 0)
  const [submitting, setSubmitting] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name))
  }, [name, slugTouched])

  useEffect(() => {
    getMergedCategories()
      .then((list) => setCategories(list))
      .catch(() => setCategories([]))
  }, [])

  const galleryDropzone = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    multiple: true,
    onDrop: async (files) => {
      if (!files.length) return
      setGalleryUploading(true)
      try {
        const baseSlug = slug || slugify(name) || `p-${Date.now()}`
        const newUrls: string[] = []
        for (const file of files) {
          const ext = file.name.split('.').pop() || 'jpg'
          const url = await uploadFile(
            file,
            `products/${baseSlug}/gallery-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
          )
          newUrls.push(url)
        }
        setGalleryUrls((prev) => [...prev, ...newUrls])
      } catch (e) {
        console.error(e)
        setError('שגיאה בהעלאת תמונות לגלריה')
      } finally {
        setGalleryUploading(false)
      }
    },
  })

  const toggleOccasion = (id: string) => {
    setOccasions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const removeGalleryImage = (url: string) => {
    setGalleryUrls((prev) => prev.filter((u) => u !== url))
  }

  const handleGalleryPick = (urls: string | string[]) => {
    const arr = Array.isArray(urls) ? urls : [urls]
    setGalleryUrls((prev) => {
      const merged = [...prev]
      for (const u of arr) if (u && !merged.includes(u)) merged.push(u)
      return merged
    })
  }

  const validate = (): string | null => {
    if (!name.trim()) return 'נדרש שם מוצר'
    if (!slug.trim()) return 'נדרש slug'
    if (!shortDescription.trim()) return 'נדרש תיאור קצר'
    const ppu = Number(pricePerUnit) || 0
    const pp = Number(packagePrice) || 0
    if (ppu <= 0 && pp <= 0) return 'יש להזין מחיר ליחידה או מחיר חבילה'
    if (minQuantity <= 0) return 'כמות מינימלית חייבת להיות חיובית'
    if (!mainImageUrl) return 'נדרשת תמונה ראשית'
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
      const ppu = Number(pricePerUnit) || undefined
      const pp = Number(packagePrice) || undefined
      const pq = Number(packageQuantity) || undefined
      const startingPrice = ppu ?? pp ?? 0

      const data: Omit<Product, 'id' | 'createdAt'> = {
        name: name.trim(),
        slug: slug.trim(),
        category,
        shortDescription: shortDescription.trim(),
        longDescription: longDescription.trim(),
        startingPrice,
        pricePerUnit: ppu,
        packagePrice: pp,
        packageQuantity: pq,
        minQuantity: Number(minQuantity),
        features: featuresText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        occasions,
        mainImageUrl,
        galleryUrls,
        isActive,
        isFeatured,
        sortOrder: Number(sortOrder),
      }
      // Strip undefined keys so Firestore doesn't choke
      Object.keys(data).forEach((k) => {
        if ((data as any)[k] === undefined) delete (data as any)[k]
      })

      if (isEdit && productId) {
        await updateDocument<Product>('products', productId, data)
      } else {
        await createDocument<typeof data>('products', data)
      }
      router.push('/admin/products')
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'שגיאה בשמירה')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!productId) return
    if (!confirm(`למחוק את "${name}"?`)) return
    try {
      await deleteDocument('products', productId)
      router.push('/admin/products')
    } catch (e) {
      console.error(e)
      alert('שגיאה במחיקה')
    }
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h3 className="font-bold text-lg text-text-dark">פרטים בסיסיים</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">שם המוצר *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug (אנגלית) *</Label>
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
          <Label htmlFor="category">קטגוריה *</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategoryId)}
            className="h-10 w-full rounded-2xl border-2 border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="short">תיאור קצר *</Label>
          <Input
            id="short"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="long">תיאור מורחב</Label>
          <Textarea
            id="long"
            rows={5}
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h3 className="font-bold text-lg text-text-dark">תמחור</h3>
        <p className="text-sm text-text-dark/70">
          הזן מחיר ליחידה, מחיר חבילה, או שניהם. לפחות אחד חובה.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="ppu">מחיר ליחידה (₪)</Label>
            <Input
              id="ppu"
              type="number"
              min={0}
              step="0.5"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="לדוגמה 5"
            />
          </div>
          <div>
            <Label htmlFor="pq">כמות בחבילה</Label>
            <Input
              id="pq"
              type="number"
              min={1}
              value={packageQuantity}
              onChange={(e) => setPackageQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="50"
            />
          </div>
          <div>
            <Label htmlFor="pp">מחיר חבילה (₪)</Label>
            <Input
              id="pp"
              type="number"
              min={0}
              step="0.5"
              value={packagePrice}
              onChange={(e) => setPackagePrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="לדוגמה 200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minq">כמות מינימלית להזמנה</Label>
            <Input
              id="minq"
              type="number"
              min={1}
              value={minQuantity}
              onChange={(e) => setMinQuantity(Number(e.target.value))}
            />
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
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h3 className="font-bold text-lg text-text-dark">תכונות ואירועים</h3>

        <div>
          <Label htmlFor="features">תכונות (שורה לכל תכונה)</Label>
          <Textarea
            id="features"
            rows={4}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder="הדפסה איכותית&#10;עיצוב אישי&#10;משלוח חינם"
          />
        </div>

        <div>
          <Label>סוגי אירועים</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {EVENT_TYPES.map((ev) => {
              const active = occasions.includes(ev.id)
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => toggleOccasion(ev.id)}
                  className={`px-3 py-2 rounded-2xl border-2 text-sm transition-colors ${
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 bg-white text-text-dark hover:border-primary'
                  }`}
                >
                  {ev.emoji} {ev.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h3 className="font-bold text-lg text-text-dark">תמונות</h3>

        <ImageSelector
          label="תמונה ראשית *"
          path={`products/${slug || 'temp'}/main`}
          currentUrl={mainImageUrl}
          onChange={setMainImageUrl}
        />
        <input type="hidden" name="mainImageUrl" value={mainImageUrl} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>גלריה</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setGalleryPickerOpen(true)}
            >
              <ImagePlus className="w-4 h-4 ml-1" /> בחר מהגלריה
            </Button>
          </div>
          <div
            {...galleryDropzone.getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer ${
              galleryDropzone.isDragActive
                ? 'border-primary bg-primary-soft'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            <input {...galleryDropzone.getInputProps()} />
            {galleryUploading ? (
              <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
            ) : (
              <p className="text-sm text-gray-600">
                גרור תמונות לכאן או לחץ לבחירה (מרובות)
              </p>
            )}
          </div>
          {galleryUrls.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-3">
              {galleryUrls.map((url) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="w-full h-24 object-cover rounded-2xl border-2 border-primary-soft"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    className="absolute -top-2 -left-2 bg-accent text-white rounded-full p-1"
                    aria-label="הסר"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <ImagePickerDialog
          open={galleryPickerOpen}
          onOpenChange={setGalleryPickerOpen}
          mode="multiple"
          onPick={handleGalleryPick}
          currentUrls={galleryUrls}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
        <h3 className="font-bold text-lg text-text-dark">סטטוס</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm">מוצר פעיל (גלוי באתר)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm">מוצר מומלץ (מופיע בדף הבית)</span>
        </label>
      </div>

      {error && (
        <div className="bg-accent/10 text-accent rounded-2xl p-3 text-sm">{error}</div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
          {isEdit ? 'שמור שינויים' : 'צור מוצר'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
          בטל
        </Button>
        {isEdit && (
          <Button
            type="button"
            variant="destructive"
            className="mr-auto"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 ml-1" /> מחק מוצר
          </Button>
        )}
      </div>
    </form>
  )
}
