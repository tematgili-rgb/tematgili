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
  createEventType,
  updateEventType,
  deleteEventType,
  getAllEventTypesAdmin,
} from '@/lib/db'
import { EVENT_TYPES } from '@/lib/constants'
import type { EventType } from '@/lib/types'

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9א-ת]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminEventTypesPage() {
  return (
    <ProtectedRoute>
      <EventTypesAdmin />
    </ProtectedRoute>
  )
}

export function EventTypesAdmin() {
  const [items, setItems] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<EventType | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [savedFlash, setSavedFlash] = useState<string | null>(null)
  const seededRef = useRef(false)

  const loadAll = async () => {
    setLoading(true)
    try {
      let fromDb = await getAllEventTypesAdmin()

      // Auto-seed built-ins if collection is empty (only once per mount)
      if (!seededRef.current && fromDb.length === 0) {
        seededRef.current = true
        await Promise.all(
          EVENT_TYPES.map((e, i) =>
            createEventType({
              slug: e.id,
              name: e.name,
              icon: e.emoji,
              sortOrder: i,
              isActive: true,
            })
          )
        )
        fromDb = await getAllEventTypesAdmin()
      }

      setItems(fromDb)
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

  const activeCount = items.filter((i) => i.isActive).length

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
      icon: '🎉',
      sortOrder: items.length,
      isActive: true,
      createdAt: new Date(),
    })
    setDialogOpen(true)
  }

  const openEdit = (e: EventType) => {
    setEditing({ ...e })
    setDialogOpen(true)
  }

  const handleToggle = async (e: EventType) => {
    try {
      await updateEventType(e.id, { isActive: !e.isActive })
      setItems((prev) =>
        prev.map((p) => (p.id === e.id ? { ...p, isActive: !e.isActive } : p))
      )
      flashSaved(e.id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (e: EventType) => {
    if (!confirm(`למחוק את "${e.name}"?`)) return
    try {
      await deleteEventType(e.id)
      setItems((prev) => prev.filter((p) => p.id !== e.id))
    } catch (err) {
      console.error(err)
      alert('שגיאה במחיקה')
    }
  }

  const handleSaved = (saved: EventType) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      }
      return [...prev, saved].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    })
    flashSaved(saved.id)
    setDialogOpen(false)
  }

  return (
    <div dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-dark mb-1">ניהול סוגי אירועים</h2>
          <p className="text-gray-600">
            {items.length} סוגי אירועים · {activeCount} פעילים
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={openNew}>
            <Plus className="w-4 h-4 ml-1" /> צור סוג אירוע חדש
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((ev) => {
            const isFlashing = savedFlash === ev.id

            return (
              <div
                key={ev.id}
                className={`relative bg-white rounded-2xl shadow-lg p-4 border-2 transition-colors ${
                  ev.isActive ? 'border-transparent' : 'border-gray-200 opacity-60'
                }`}
              >
                {isFlashing && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> נשמר
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className="text-4xl leading-none">{ev.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-dark truncate">{ev.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{ev.slug}</p>
                  </div>
                </div>

                <div className="flex gap-2 mb-3 text-xs">
                  <span className="bg-primary-soft text-text-dark px-2 py-1 rounded-full">
                    סדר: {ev.sortOrder}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full ${
                      ev.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {ev.isActive ? 'פעיל' : 'מוסתר'}
                  </span>
                </div>

                <div className="flex gap-1 pt-2 border-t border-primary-soft">
                  <Button
                    size="icon"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleToggle(ev)}
                    title={ev.isActive ? 'הסתר' : 'הצג'}
                  >
                    {ev.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openEdit(ev)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="flex-1 border-accent text-accent hover:bg-accent hover:text-white"
                    onClick={() => handleDelete(ev)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <EventTypeEditDialog
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
  editing: EventType | null
  onSaved: (saved: EventType) => void
}

function EventTypeEditDialog({ open, onOpenChange, editing, onSaved }: DialogProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [icon, setIcon] = useState('🎉')
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !editing) return
    setName(editing.name)
    setSlug(editing.slug)
    setSlugTouched(!!editing.slug)
    setIcon(editing.icon || '🎉')
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
    if (!icon.trim()) {
      setError('נדרש אייקון')
      return
    }
    if (!slug.trim()) {
      setError('נדרש slug')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload: Omit<EventType, 'id' | 'createdAt'> = {
        name: name.trim(),
        slug: slug.trim(),
        icon: icon.trim(),
        sortOrder: Number(sortOrder),
        isActive,
      }
      let savedId = editing.id
      if (editing.id) {
        await updateEventType(editing.id, payload)
      } else {
        savedId = await createEventType(payload)
      }
      onSaved({
        id: savedId,
        slug: payload.slug,
        name: payload.name,
        icon: payload.icon,
        sortOrder: payload.sortOrder,
        isActive: payload.isActive,
        createdAt: editing.createdAt ?? new Date(),
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
          <DialogTitle>{editing.id ? 'ערוך סוג אירוע' : 'סוג אירוע חדש'}</DialogTitle>
          <DialogDescription>
            סוגי האירועים מוצגים בעמוד הבית בחלק "לכל אירוע — הפיתרון שלנו".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ev-name">שם *</Label>
              <Input
                id="ev-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ev-slug">Slug *</Label>
              <Input
                id="ev-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugTouched(true)
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ev-icon">אייקון (אימוג׳י) *</Label>
              <Input
                id="ev-icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={4}
              />
            </div>
            <div>
              <Label htmlFor="ev-sort">סדר תצוגה</Label>
              <Input
                id="ev-sort"
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
