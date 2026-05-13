'use client'

import { useEffect, useState } from 'react'
import { Edit, Eye, EyeOff, ImagePlus, Loader2, Plus, Trash2, X, Database } from 'lucide-react'
import { Timestamp } from 'firebase/firestore'
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
import ImagePickerDialog from '@/components/admin/ImagePickerDialog'
import {
  createDocument,
  updateDocument,
  deleteDocument,
  getAllCategoriesAdmin,
} from '@/lib/db'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { Category } from '@/lib/types'

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
  imageUrls: string[]
  sortOrder: number
  isActive: boolean
  isBuiltIn: boolean
  fromDb: boolean
}

function Categories() {
  const [items, setItems] = useState<DisplayCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<DisplayCategory | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const fromDb = await getAllCategoriesAdmin()
      const dbBySlug = new Map(fromDb.map((c) => [c.slug, c]))
      const merged: DisplayCategory[] = []

      // Built-ins (virtual if not in DB)
      PRODUCT_CATEGORIES.forEach((b, i) => {
        const inDb = dbBySlug.get(b.id)
        if (inDb) {
          merged.push({
            id: inDb.id,
            slug: inDb.slug,
            name: inDb.name,
            icon: inDb.icon,
            imageUrls: inDb.imageUrls ?? [],
            sortOrder: inDb.sortOrder ?? i,
            isActive: inDb.isActive ?? true,
            isBuiltIn: true,
            fromDb: true,
          })
        } else {
          merged.push({
            id: `builtin-${b.id}`,
            slug: b.id,
            name: b.name,
            icon: b.icon,
            imageUrls: [],
            sortOrder: i,
            isActive: true,
            isBuiltIn: true,
            fromDb: false,
          })
        }
      })

      // Custom from DB
      for (const c of fromDb) {
        if (PRODUCT_CATEGORIES.find((b) => b.id === c.slug)) continue
        merged.push({
          id: c.id,
          slug: c.slug,
          name: c.name,
          icon: c.icon,
          imageUrls: c.imageUrls ?? [],
          sortOrder: c.sortOrder ?? 99,
          isActive: c.isActive ?? true,
          isBuiltIn: !!c.isBuiltIn,
          fromDb: true,
        })
      }

      merged.sort((a, b) => a.sortOrder - b.sortOrder)
      setItems(merged)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSeedDefaults = async () => {
    if (!confirm('להזין את 7 הקטגוריות הסטטיות ל-Firestore? קטגוריות שכבר קיימות יידולגו.')) return
    setSeeding(true)
    try {
      const fromDb = await getAllCategoriesAdmin()
      const existing = new Set(fromDb.map((c) => c.slug))
      let added = 0
      for (let i = 0; i < PRODUCT_CATEGORIES.length; i++) {
        const b = PRODUCT_CATEGORIES[i]
        if (existing.has(b.id)) continue
        await createDocument<Omit<Category, 'id' | 'createdAt'>>('categories', {
          slug: b.id,
          name: b.name,
          icon: b.icon,
          imageUrls: [],
          sortOrder: i,
          isActive: true,
          isBuiltIn: true,
        })
        added++
      }
      await load()
      alert(`נוספו ${added} קטגוריות`)
    } catch (e) {
      console.error(e)
      alert('שגיאה בהזנת ברירות מחדל')
    } finally {
      setSeeding(false)
    }
  }

  const openNew = () => {
    setEditing({
      id: '',
      slug: '',
      name: '',
      icon: '🎁',
      imageUrls: [],
      sortOrder: items.length,
      isActive: true,
      isBuiltIn: false,
      fromDb: false,
    })
    setDialogOpen(true)
  }

  const openEdit = (cat: DisplayCategory) => {
    setEditing({ ...cat })
    setDialogOpen(true)
  }

  const handleToggle = async (cat: DisplayCategory) => {
    if (!cat.fromDb) {
      // Built-in not in DB → create it as inactive
      const id = await createDocument<Omit<Category, 'id' | 'createdAt'>>('categories', {
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
        imageUrls: cat.imageUrls,
        sortOrder: cat.sortOrder,
        isActive: !cat.isActive,
        isBuiltIn: cat.isBuiltIn,
      })
      setItems((prev) =>
        prev.map((p) =>
          p.slug === cat.slug ? { ...p, id, fromDb: true, isActive: !cat.isActive } : p
        )
      )
      return
    }
    try {
      await updateDocument<Category>('categories', cat.id, { isActive: !cat.isActive })
      setItems((prev) =>
        prev.map((p) => (p.id === cat.id ? { ...p, isActive: !cat.isActive } : p))
      )
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (cat: DisplayCategory) => {
    if (cat.isBuiltIn) {
      alert('לא ניתן למחוק קטגוריה מובנית. ניתן רק להפוך אותה ללא פעילה.')
      return
    }
    if (!cat.fromDb) return
    if (!confirm(`למחוק את "${cat.name}"?`)) return
    try {
      await deleteDocument('categories', cat.id)
      setItems((prev) => prev.filter((p) => p.id !== cat.id))
    } catch (e) {
      console.error(e)
      alert('שגיאה במחיקה')
    }
  }

  return (
    <div dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-dark mb-1">ניהול קטגוריות</h2>
          <p className="text-gray-600">{items.length} קטגוריות</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleSeedDefaults} disabled={seeding}>
            {seeding ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Database className="w-4 h-4 ml-2" />
            )}
            אתחל ברירות מחדל
          </Button>
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
          {items.map((cat) => (
            <div
              key={`${cat.slug}-${cat.id}`}
              className={`bg-white rounded-2xl shadow-lg p-4 border-2 ${
                cat.isActive ? 'border-transparent' : 'border-gray-200 opacity-60'
              }`}
            >
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
              {cat.imageUrls.length > 0 && (
                <div className="flex gap-1 mb-3 overflow-x-auto">
                  {cat.imageUrls.slice(0, 4).map((u) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={u}
                      src={u}
                      alt=""
                      className="w-14 h-14 object-cover rounded-xl shrink-0"
                    />
                  ))}
                </div>
              )}
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
                <Button
                  size="icon"
                  variant="outline"
                  className={`flex-1 border-accent text-accent hover:bg-accent hover:text-white ${
                    cat.isBuiltIn ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                  disabled={cat.isBuiltIn}
                  onClick={() => handleDelete(cat)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={() => {
          setDialogOpen(false)
          load()
        }}
      />
    </div>
  )
}

interface DialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  editing: DisplayCategory | null
  onSaved: () => void
}

function CategoryEditDialog({ open, onOpenChange, editing, onSaved }: DialogProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [icon, setIcon] = useState('🎁')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !editing) return
    setName(editing.name)
    setSlug(editing.slug)
    setSlugTouched(true)
    setIcon(editing.icon || '🎁')
    setImageUrls(editing.imageUrls ?? [])
    setSortOrder(editing.sortOrder)
    setIsActive(editing.isActive)
    setError(null)
  }, [open, editing])

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name))
  }, [name, slugTouched])

  if (!editing) return null

  const handlePickImages = (urls: string | string[]) => {
    const arr = Array.isArray(urls) ? urls : [urls]
    setImageUrls((prev) => {
      const merged = [...prev]
      for (const u of arr) if (u && !merged.includes(u)) merged.push(u)
      return merged
    })
  }

  const removeImage = (u: string) => {
    setImageUrls((prev) => prev.filter((x) => x !== u))
  }

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
      const payload: Omit<Category, 'id' | 'createdAt'> = {
        name: name.trim(),
        slug: slug.trim(),
        icon: icon || '🎁',
        imageUrls,
        sortOrder: Number(sortOrder),
        isActive,
        isBuiltIn: editing.isBuiltIn,
      }
      if (editing.fromDb) {
        await updateDocument<Category>('categories', editing.id, payload)
      } else {
        await createDocument<typeof payload>('categories', payload)
      }
      onSaved()
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
          <DialogTitle>{editing.fromDb ? 'ערוך קטגוריה' : 'קטגוריה חדשה'}</DialogTitle>
          <DialogDescription>
            {editing.isBuiltIn ? 'קטגוריה מובנית — ניתן לערוך תמונות ושם.' : 'קטגוריה מותאמת אישית.'}
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>תמונות הקטגוריה</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                <ImagePlus className="w-4 h-4 ml-1" /> בחר תמונות
              </Button>
            </div>
            {imageUrls.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {imageUrls.map((u) => (
                  <div key={u} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={u}
                      alt=""
                      className="w-full h-20 object-cover rounded-2xl border-2 border-primary-soft"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(u)}
                      className="absolute -top-2 -left-2 bg-accent text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">לא נבחרו תמונות</p>
            )}
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

        <ImagePickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          mode="multiple"
          onPick={handlePickImages}
          currentUrls={imageUrls}
        />
      </DialogContent>
    </Dialog>
  )
}
