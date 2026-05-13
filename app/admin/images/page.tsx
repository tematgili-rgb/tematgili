'use client'

import { useEffect, useState } from 'react'
import {
  Image as ImageIcon,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Database,
} from 'lucide-react'
import { Timestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import ImageDropzone from '@/components/admin/ImageDropzone'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { getAllDocuments, createDocument, updateDocument, deleteDocument } from '@/lib/db'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import { staticImagesFor } from '@/lib/staticImages'
import type { SiteImage } from '@/lib/types'

const categoryLabels: Record<SiteImage['category'], string> = {
  logo: 'לוגו',
  hero_carousel: 'קרוסלת דף הבית',
  gallery: 'גלריית עבודות',
  about: 'אודות',
  packages: 'חבילות',
}

const CATEGORIES: SiteImage['category'][] = ['logo', 'hero_carousel', 'gallery', 'about', 'packages']

const staticFor = staticImagesFor

const SEED_IMAGES: Omit<SiteImage, 'id' | 'createdAt'>[] = [
  { category: 'logo', name: 'לוגו ראשי', imageUrl: '/assets/logo.png', isActive: true, sortOrder: 1 },
  { category: 'hero_carousel', name: 'באנר 1', imageUrl: '/assets/hero-1.jpg', isActive: true, sortOrder: 1 },
  { category: 'hero_carousel', name: 'באנר 2', imageUrl: '/assets/hero-2.jpg', isActive: true, sortOrder: 2 },
  { category: 'gallery', name: 'גלריה 1', imageUrl: '/assets/gallery-1.jpg', isActive: true, sortOrder: 1 },
  { category: 'about', name: 'אודות', imageUrl: '/assets/about.jpg', isActive: true, sortOrder: 1 },
]

export default function AdminImagesPage() {
  return (
    <ProtectedRoute>
      <Images />
    </ProtectedRoute>
  )
}

function Images() {
  const [images, setImages] = useState<SiteImage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<SiteImage['category']>('hero_carousel')
  const [seeding, setSeeding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [openImage, setOpenImage] = useState<SiteImage | null>(null)
  const [pendingTags, setPendingTags] = useState<string[]>([])
  const [savingTags, setSavingTags] = useState(false)
  const [tagMessage, setTagMessage] = useState<string | null>(null)

  const togglePill = (id: string) => {
    setPendingTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const openCard = (img: SiteImage) => {
    setTagMessage(null)
    setOpenImage(img)
    setPendingTags(img.tags ?? [])
  }

  const closeDialog = () => {
    setOpenImage(null)
    setPendingTags([])
    setTagMessage(null)
  }

  const saveTags = async () => {
    if (!openImage) return
    if (openImage.id.startsWith('static-')) {
      setTagMessage('תמונה סטטית — תיוג יישמר רק אחרי חיבור Firebase')
      setTimeout(() => closeDialog(), 1500)
      return
    }
    setSavingTags(true)
    try {
      await updateDocument<SiteImage>('siteImages', openImage.id, { tags: pendingTags })
      setImages((prev) =>
        prev.map((i) => (i.id === openImage.id ? { ...i, tags: pendingTags } : i))
      )
      closeDialog()
    } catch (e) {
      console.error(e)
      setTagMessage('שגיאה בשמירת תיוגים')
    } finally {
      setSavingTags(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAllDocuments<SiteImage>('siteImages')
      setImages(data.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSeed = async () => {
    if (!confirm('להזין תמונות ברירת מחדל? קטגוריות שכבר קיימות בהן תמונות ידולגו.')) return
    setSeeding(true)
    try {
      const existing = await getAllDocuments<SiteImage>('siteImages')
      const existingCategories = new Set(existing.map((i) => i.category))
      const toAdd = SEED_IMAGES.filter((img) => !existingCategories.has(img.category))
      if (toAdd.length === 0) {
        alert('כל הקטגוריות כבר מאוכלסות')
        return
      }
      for (const img of toAdd) {
        await createDocument<SiteImage>('siteImages', {
          ...img,
          createdAt: Timestamp.now(),
        } as any)
      }
      await load()
      alert(`נוספו ${toAdd.length} תמונות`)
    } catch (e) {
      console.error(e)
      alert('שגיאה בהזנת תמונות')
    } finally {
      setSeeding(false)
    }
  }

  const handleToggle = async (img: SiteImage) => {
    if (img.id.startsWith('static-')) return
    try {
      await updateDocument<SiteImage>('siteImages', img.id, { isActive: !img.isActive })
      setImages((prev) =>
        prev.map((i) => (i.id === img.id ? { ...i, isActive: !img.isActive } : i))
      )
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (img: SiteImage) => {
    if (img.id.startsWith('static-')) return
    if (!confirm('למחוק תמונה זו?')) return
    try {
      await deleteDocument('siteImages', img.id)
      setImages((prev) => prev.filter((i) => i.id !== img.id))
    } catch (e) {
      console.error(e)
    }
  }

  const handleAdd = async () => {
    if (!newUrl) {
      alert('יש להעלות תמונה')
      return
    }
    if (!newName.trim()) {
      alert('יש להזין שם')
      return
    }
    setAdding(true)
    try {
      const sortOrder =
        images.filter((i) => i.category === activeCategory).length + 1
      await createDocument<SiteImage>('siteImages', {
        category: activeCategory,
        name: newName.trim(),
        imageUrl: newUrl,
        isActive: true,
        sortOrder,
      } as any)
      setNewName('')
      setNewUrl('')
      await load()
    } catch (e) {
      console.error(e)
      alert('שגיאה בהוספה')
    } finally {
      setAdding(false)
    }
  }

  const firestoreForCategory = images.filter((i) => i.category === activeCategory)
  const filtered = [...firestoreForCategory, ...staticFor(activeCategory)]

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-dark mb-1">ניהול תמונות</h2>
          <p className="text-gray-600">תמונות האתר לפי קטגוריות</p>
        </div>
        <Button variant="outline" onClick={handleSeed} disabled={seeding || loading}>
          {seeding ? (
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <Database className="w-4 h-4 ml-2" />
          )}
          הזן ברירות מחדל
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => {
          const firestoreCount = images.filter((i) => i.category === cat).length
          const count = firestoreCount + staticFor(cat).length
          const active = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-dark hover:bg-primary-soft shadow'
              }`}
            >
              {categoryLabels[cat]} ({count})
            </button>
          )
        })}
      </div>

      {/* Upload form */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 space-y-4">
        <h3 className="font-bold text-text-dark">הוסף תמונה ל-{categoryLabels[activeCategory]}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="img-name">שם</Label>
            <Input
              id="img-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="תיאור קצר"
            />
          </div>
          <div>
            <ImageDropzone
              label="קובץ"
              path={`siteImages/${activeCategory}/img`}
              currentUrl={newUrl}
              onUpload={setNewUrl}
            />
          </div>
        </div>
        <Button onClick={handleAdd} disabled={adding || !newUrl || !newName}>
          {adding && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
          הוסף
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>אין תמונות בקטגוריה זו</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((img) => {
            const isStatic = img.id.startsWith('static-')
            return (
            <div
              key={img.id}
              onClick={() => openCard(img)}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-primary transition ${
                img.isActive ? '' : 'opacity-50'
              }`}
            >
              {isStatic && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full absolute top-2 right-2 z-10">
                  סטטי
                </span>
              )}
              <div className="aspect-square bg-primary-soft/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt={img.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div className="p-3 space-y-2">
                <p className="font-medium text-sm text-text-dark truncate">{img.name}</p>
                {img.tags?.length ? (
                  <p className="text-xs text-gray-500">{img.tags.length} תיוגים</p>
                ) : null}
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="icon"
                    variant="outline"
                    className={`flex-1 ${isStatic ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isStatic}
                    onClick={() => handleToggle(img)}
                  >
                    {img.isActive ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className={`flex-1 border-accent text-accent hover:bg-accent hover:text-white ${
                      isStatic ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isStatic}
                    onClick={() => handleDelete(img)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}

      <Dialog open={!!openImage} onOpenChange={(o) => { if (!o) closeDialog() }}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>{openImage?.name ?? 'תמונה'}</DialogTitle>
            <DialogDescription>תייג קטגוריה</DialogDescription>
          </DialogHeader>
          {openImage && (
            <div className="space-y-5">
              <div className="aspect-square max-w-md mx-auto bg-primary-soft/20 rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={openImage.imageUrl}
                  alt={openImage.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div>
                <h4 className="font-bold text-text-dark mb-3">תייג קטגוריה</h4>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => togglePill(c.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm transition ${
                        pendingTags.includes(c.id)
                          ? 'bg-primary text-text-dark border-primary'
                          : 'bg-white text-text-dark border-primary-soft hover:border-primary'
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              {tagMessage && (
                <p className="text-sm text-accent">{tagMessage}</p>
              )}
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={closeDialog} disabled={savingTags}>
                  ביטול
                </Button>
                <Button
                  className="bg-accent text-white hover:bg-accent/90"
                  onClick={saveTags}
                  disabled={savingTags}
                >
                  {savingTags && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                  שמור
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
