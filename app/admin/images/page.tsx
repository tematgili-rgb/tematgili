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
import { getAllDocuments, createDocument, updateDocument, deleteDocument } from '@/lib/db'
import type { SiteImage } from '@/lib/types'

const categoryLabels: Record<SiteImage['category'], string> = {
  logo: 'לוגו',
  hero_carousel: 'קרוסלת דף הבית',
  gallery: 'גלריית עבודות',
  about: 'אודות',
}

const CATEGORIES: SiteImage['category'][] = ['logo', 'hero_carousel', 'gallery', 'about']

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

  const filtered = images.filter((i) => i.category === activeCategory)

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
          const count = images.filter((i) => i.category === cat).length
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
          {filtered.map((img) => (
            <div
              key={img.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                img.isActive ? '' : 'opacity-50'
              }`}
            >
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
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="flex-1"
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
                    className="flex-1 border-accent text-accent hover:bg-accent hover:text-white"
                    onClick={() => handleDelete(img)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
