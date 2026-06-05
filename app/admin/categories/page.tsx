'use client'

import { useEffect, useRef, useState } from 'react'
import { Edit, Eye, EyeOff, Loader2, Plus, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import {
  createDocument,
  updateDocument,
  deleteDocument,
  getAllCategoriesAdmin,
  getAllDocuments,
  getAllGalleryImages,
} from '@/lib/db'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { Category, GalleryImage, Product } from '@/lib/types'

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9א-ת]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminCategoriesPage() {
  return (
    <ProtectedRoute>
      <Categories />
    </ProtectedRoute>
  )
}

interface DisplayCategory {
  id: string
  slug: string
  name: string
  icon: string
  sortOrder: number
  isActive: boolean
  isBuiltIn: boolean
}

function Categories() {
  const [items, setItems] = useState<DisplayCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<DisplayCategory | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [savedFlash, setSavedFlash] = useState<string | null>(null)
  const seededRef = useRef(false)

  const buildDisplay = (fromDb: Category[]): DisplayCategory[] => {
    const bySlug = new Map(fromDb.map((c) => [c.slug, c]))
    const out: DisplayCategory[] = []

    PRODUCT_CATEGORIES.forEach((b, i) => {
      const inDb = bySlug.get(b.id)
      if (inDb) {
        out.push({
          id: inDb.id,
          slug: inDb.slug,
          name: inDb.name,
          icon: inDb.icon,
          sortOrder: inDb.sortOrder ?? i,
          isActive: inDb.isActive ?? true,
          isBuiltIn: true,
        })
      }
    })

    for (const c of fromDb) {
      if (PRODUCT_CATEGORIES.find((b) => b.id === c.slug)) continue
      out.push({
        id: c.id,
        slug: c.slug,
        name: c.name,
        icon: c.icon,
        sortOrder: c.sortOrder ?? 99,
        isActive: c.isActive ?? true,
        isBuiltIn: !!c.isBuiltIn,
      })
    }

    return out.sort((a, b) => a.sortOrder - b.sortOrder)
  }

  const loadAll = async () => {
    setLoading(true)
    try {
      let fromDb = await getAllCategoriesAdmin()

      // Auto-seed any missing built-ins (only once per mount)
      if (!seededRef.current) {
        seededRef.current = true
        const existing = new Set(fromDb.map((c) => c.slug))
        const missing = PRODUCT_CATEGORIES.filter((b) => !existing.has(b.id))
        if (missing.length > 0) {
          await Promise.all(
            missing.map((b, idx) => {
              const i = PRODUCT_CATEGORIES.findIndex((x) => x.id === b.id)
              return createDocument<Omit<Category, 'id' | 'createdAt'>>('categories', {
                slug: b.id,
                name: b.name,
                icon: b.icon,
                sortOrder: i >= 0 ? i : idx,
                isActive: true,
                isBuiltIn: true,
              })
            })
          )
          fromDb = await getAllCategoriesAdmin()
        }
      }

      const prods = await getAllDocuments<Product>('products').catch(() => [])
      const gallery = await getAllGalleryImages().catch(() => [])
      setProducts(prods)
      setGalleryImages(gallery)
      setItems(buildDisplay(fromDb))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const productsBySlug = new Map<string, Product[]>()
  for (const p of products) {
    const list = productsBySlug.get(p.category) ?? []
    list.push(p)
    productsBySlug.set(p.category, list)
  }

  const galleryBySlug = new Map<string, GalleryImage[]>()
  for (const g of galleryImages) {
    const list = galleryBySlug.get(g.category) ?? []
    list.push(g)
    galleryBySlug.set(g.category, list)
  }

  const flashSaved = (id: string) => {
    setSavedFlash(id)
    window.setTimeout(() => {
      setSavedFlash((curr) => (curr === id ? null : curr))
    }, 2000)
  }

  const openNew = () => {
    setEditing({
      id: '',
      slug: '',
      name: '',
      icon: '🎁',
      sortOrder: items.length,
      isActive: true,
      isBuiltIn: false,
    })
    setDialogOpen(true)
  }

  const openEdit = (cat: DisplayCategory) => {
    setEditing({ ...cat })
    setDialogOpen(true)
  }

  const handleToggle = async (cat: DisplayCategory) => {
    try {
      await updateDocument<Category>('categories', cat.id, { isActive: !cat.isActive })
      setItems((prev) =>
        prev.map((p) => (p.id === cat.id ? { ...p, isActive: !cat.isActive } : p))
      )
      flashSaved(cat.id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (cat: DisplayCategory) => {
    if (cat.isBuiltIn) {
      alert('לא ניתן למחוק קטגוריה מובנית. ניתן רק להפוך אותה ללא פעילה.')
      return
    }
    if (!confirm(`למחוק את "${cat.name}"?`)) return
    try {
      await deleteDocument('categories', cat.id)
      setItems((prev) => prev.filter((p) => p.id !== cat.id))
    } catch (e) {
      console.error(e)
      alert('שגיאה במחיקה')
    }
  }

  const handleSaved = (saved: DisplayCategory) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next.sort((a, b) => a.sortOrder - b.sortOrder)
      }
      return [...prev, saved].sort((a, b) => a.sortOrder - b.sortOrder)
    })
    flashSaved(saved.id)
    setDialogOpen(false)
    // Refresh gallery counts in case the saved category slug changed
    getAllGalleryImages().then(setGalleryImages).catch(() => {})
  }

  return (
    <div dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-dark mb-1">ניהול קטגוריות</h2>
          <p className="text-gray-600">{items.length} קטגוריות</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={openNew}>
            <Plus className="w-4 h-4 ml-1" /> קטגוריה חדשה
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((cat) => {
            const catProducts = productsBySlug.get(cat.slug) ?? []
            const catGallery = galleryBySlug.get(cat.slug) ?? []
            const productThumbs = catProducts
              .map((p) => p.mainImageUrl)
              .filter((u): u is string => !!u)
              .slice(0, 4)
            const galleryThumbs = catGallery
              .map((g) => g.imageUrl)
              .filter((u): u is string => !!u)
              .slice(0, 4)
            const thumbs =
              productThumbs.length > 0 ? productThumbs : galleryThumbs
            const isFlashing = savedFlash === cat.id

            return (
              <div
                key={cat.id}
                className={`relative bg-white rounded-2xl shadow-lg p-4 border-2 transition-colors ${
                  cat.isActive ? 'border-transparent' : 'border-gray-200 opacity-60'
                }`}
              >
                {isFlashing && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> נשמר
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className="text-4xl">{cat.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-dark truncate">{cat.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{cat.slug}</p>
                    {cat.isBuiltIn && (
                      <span className="inline-block mt-1 text-[10px] bg-primary-soft text-text-dark px-2 py-0.5 rounded-full">
                        מובנה
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mb-3 text-xs">
                  <span className="bg-primary-soft text-text-dark px-2 py-1 rounded-full">
                    {catProducts.length} מוצרים
                  </span>
                  <span className="bg-cream text-text-dark px-2 py-1 rounded-full">
                    {catGallery.length} תמונות
                  </span>
                </div>

                <div className="flex gap-1 mb-3 min-h-[3.5rem]">
                  {thumbs.length > 0 ? (
                    thumbs.map((u, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={`${u}-${i}`}
                        src={u}
                        alt=""
                        className="w-14 h-14 object-cover rounded-xl shrink-0 border border-primary-soft"
                      />
                    ))
                  ) : (
                    <div className="text-xs text-gray-400 flex items-center">אין תמונות / מוצרים</div>
                  )}
                </div>

                <div className="flex gap-1 pt-2 border-t border-primary-soft">
                  <Button
                    size="icon"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleToggle(cat)}
                    title={cat.isActive ? 'הסתר' : 'הצג'}
                  >
                    {cat.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEdit(cat)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!cat.isBuiltIn && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="flex-1 border-accent text-accent hover:bg-accent hover:text-white"
                      onClick={() => handleDelete(cat)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <CategoryEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={handleSaved}
      />
    </div>
  )
}

interface DialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  editing: DisplayCategory | null
  onSaved: (saved: DisplayCategory) => void
}

function CategoryEditDialog({ open, onOpenChange, editing, onSaved }: DialogProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [icon, setIcon] = useState('🎁')
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !editing) return
    setName(editing.name)
    setSlug(editing.slug)
    setSlugTouched(true)
    setIcon(editing.icon || '🎁')
    setSortOrder(editing.sortOrder)
    setIsActive(editing.isActive)
    setError(null)
  }, [open, editing])

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name))
  }, [name, slugTouched])

  if (!editing) return null

  const handleSave = async () => {
    if (!name.trim()) {
      setError('נדרש שם')
      return
    }
    if (!slug.trim()) {
      setError('נדרש slug')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload: Omit<Category, 'id' | 'createdAt' | 'imageUrls'> = {
        name: name.trim(),
        slug: slug.trim(),
        icon: icon || '🎁',
        sortOrder: Number(sortOrder),
        isActive,
        isBuiltIn: editing.isBuiltIn,
      }
      let savedId = editing.id
      if (editing.id) {
        await updateDocument<Category>('categories', editing.id, payload)
      } else {
        savedId = await createDocument<typeof payload>('categories', payload)
      }
      onSaved({
        id: savedId,
        slug: payload.slug,
        name: payload.name,
        icon: payload.icon,
        sortOrder: payload.sortOrder,
        isActive: payload.isActive,
        isBuiltIn: !!payload.isBuiltIn,
      })
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'שגיאה בשמירה')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editing.id ? 'ערוך קטגוריה' : 'קטגוריה חדשה'}</DialogTitle>
          <DialogDescription>
            {editing.isBuiltIn ? 'קטגוריה מובנית — ניתן לערוך שם ואייקון.' : 'קטגוריה מותאמת אישית.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cat-name">שם *</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cat-slug">Slug *</Label>
              <Input
                id="cat-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugTouched(true)
                }}
                disabled={editing.isBuiltIn}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cat-icon">אייקון (אימוג׳י)</Label>
              <Input
                id="cat-icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={4}
              />
            </div>
            <div>
              <Label htmlFor="cat-sort">סדר תצוגה</Label>
              <Input
                id="cat-sort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm">פעיל (גלוי באתר)</span>
          </label>

          {error && <p className="text-sm text-accent">{error}</p>}

          <div className="flex gap-2 justify-end pt-2 border-t border-primary-soft">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              ביטול
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              שמור
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
