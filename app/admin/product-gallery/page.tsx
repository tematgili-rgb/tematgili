'use client'

import { useEffect, useMemo, useState } from 'react'
import { Image as ImageIcon, Trash2, Loader2 } from 'lucide-react'
import { Timestamp } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import ImageDropzone from '@/components/admin/ImageDropzone'
import {
  getAllGalleryImages,
  createGalleryImage,
  deleteGalleryImage,
} from '@/lib/db'
import { getMergedCategories, type MergedCategory } from '@/lib/categories'
import type { GalleryImage } from '@/lib/types'

export default function AdminProductGalleryPage() {
  return (
    <ProtectedRoute>
      <ProductGallery />
    </ProtectedRoute>
  )
}

function ProductGallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [categories, setCategories] = useState<MergedCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadCategory, setUploadCategory] = useState<string>('')
  const [newUrl, setNewUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    void load()
    getMergedCategories()
      .then((list) => setCategories(list))
      .catch(() => setCategories([]))
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAllGalleryImages()
      setImages(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const categoryName = (slug: string): string => {
    const c = categories.find((c) => c.slug === slug)
    return c ? `${c.icon} ${c.name}` : slug
  }

  const handleAdd = async () => {
    if (!uploadCategory) {
      alert('יש לבחור קטגוריה')
      return
    }
    if (!newUrl) {
      alert('יש להעלות תמונה')
      return
    }
    setAdding(true)
    try {
      await createGalleryImage({
        imageUrl: newUrl,
        category: uploadCategory,
      } as Omit<GalleryImage, 'id' | 'createdAt'> & { createdAt?: Timestamp })
      setNewUrl('')
      await load()
    } catch (e) {
      console.error(e)
      alert('שגיאה בהוספת תמונה')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (img: GalleryImage) => {
    if (!confirm('למחוק תמונה זו?')) return
    try {
      await deleteGalleryImage(img.id, img.imageUrl)
      setImages((prev) => prev.filter((i) => i.id !== img.id))
    } catch (e) {
      console.error(e)
      alert('שגיאה במחיקה')
    }
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return images
    return images.filter((i) => i.category === filter)
  }, [images, filter])

  const populatedCount = useMemo(() => {
    const set = new Set(images.map((i) => i.category))
    return set.size
  }, [images])

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-dark mb-1">גלריית מוצרים</h2>
        <p className="text-gray-600">
          {images.length} תמונות סה״כ · {populatedCount} קטגוריות מאוכלסות
        </p>
      </div>

      {/* Upload form */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 space-y-4">
        <h3 className="font-bold text-text-dark">העלאת תמונה חדשה</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="upload-cat">קטגוריה *</Label>
            <select
              id="upload-cat"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="h-10 w-full rounded-2xl border-2 border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">— בחר קטגוריה —</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <ImageDropzone
              label="קובץ"
              path={`gallery/${uploadCategory || 'unsorted'}/img`}
              currentUrl={newUrl}
              onUpload={setNewUrl}
            />
          </div>
        </div>
        <Button
          onClick={handleAdd}
          disabled={adding || !uploadCategory || !newUrl}
        >
          {adding && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
          הוסף לגלריה
        </Button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow p-3 mb-6 flex items-center gap-3 flex-wrap">
        <Label htmlFor="filter-cat" className="m-0">סנן לפי קטגוריה:</Label>
        <select
          id="filter-cat"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-10 rounded-2xl border-2 border-gray-200 bg-white px-3 text-sm focus:border-primary focus:outline-none"
        >
          <option value="all">הכל</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>עדיין לא הועלו תמונות גלריה. בחר קטגוריה והעלה את הראשונה.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((img) => (
            <div
              key={img.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden relative"
            >
              <div className="aspect-square bg-primary-soft/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt={categoryName(img.category)}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 space-y-2">
                <span className="inline-block bg-primary-soft text-text-dark text-xs px-2 py-1 rounded-full">
                  {categoryName(img.category)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-accent text-accent hover:bg-accent hover:text-white"
                  onClick={() => handleDelete(img)}
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
