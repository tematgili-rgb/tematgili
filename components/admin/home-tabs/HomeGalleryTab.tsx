'use client'

import { useEffect, useState } from 'react'
import { ImagePlus, Loader2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ImagePickerDialog from '@/components/admin/ImagePickerDialog'
import { getSettings, updateSettings, getImagesByCategory } from '@/lib/db'

const FALLBACK_IMAGES = Array.from({ length: 8 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0')
  return `/gallery/gallery-${num}.jpg`
})

export default function HomeGalleryTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urls, setUrls] = useState<string[]>([])
  const [isCustom, setIsCustom] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await getSettings()
        const saved = (s?.homeGalleryImageUrls ?? []).filter(Boolean)
        if (saved.length > 0) {
          if (!cancelled) {
            setUrls(saved)
            setIsCustom(true)
          }
          return
        }
        let defaults: string[] = []
        try {
          const imgs = await getImagesByCategory('gallery')
          defaults = imgs.map((i) => i.imageUrl).filter(Boolean)
        } catch {}
        if (defaults.length === 0) defaults = FALLBACK_IMAGES
        if (!cancelled) {
          setUrls(defaults.slice(0, 8))
          setIsCustom(false)
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const removeAt = (idx: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== idx))
    setIsCustom(true)
  }

  const handlePick = (picked: string | string[]) => {
    const arr = Array.isArray(picked) ? picked : [picked]
    setUrls((prev) => {
      const seen = new Set(prev)
      const merged = [...prev]
      for (const u of arr) {
        if (u && !seen.has(u)) {
          merged.push(u)
          seen.add(u)
        }
      }
      return merged
    })
    setIsCustom(true)
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      await updateSettings({ homeGalleryImageUrls: urls })
      setIsCustom(true)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'שגיאה בשמירה')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-dark mb-1">הגלריה שלנו</h2>
        <p className="text-gray-600">
          בחר אילו תמונות יופיעו ברצועת &quot;מהגלריה שלנו&quot; בעמוד הבית
        </p>
      </div>

      <div className="max-w-5xl space-y-6">
        {!isCustom && urls.length > 0 && (
          <div className="bg-cream border-2 border-twine rounded-2xl p-4 text-sm text-text-dark">
            התמונות שמופיעות כאן הן ברירת המחדל שמוצגת כרגע באתר. הוסף או הסר ושמור כדי להגדיר רשימה משלך.
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {urls.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              לא נבחרו תמונות. הרצועה בעמוד הבית תציג ברירת מחדל מתוך תמונות
              המערכת בקטגוריית &quot;גלריה&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {urls.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="relative bg-primary-soft/20 rounded-2xl overflow-hidden border-2 border-primary-soft"
                  style={{ aspectRatio: '1 / 1' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`גלריה ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover block"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 left-1 h-7 w-7"
                    onClick={() => removeAt(idx)}
                    aria-label="הסר תמונה"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
              <ImagePlus className="w-4 h-4 ml-1" /> בחר תמונות מהגלריה
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-accent/10 text-accent rounded-2xl p-3 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-primary-soft text-text-dark rounded-2xl p-3 text-sm">
            נשמר
          </div>
        )}

        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 ml-2" />
          )}
          שמור
        </Button>
      </div>

      <ImagePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        mode="multiple"
        defaultCategory="gallery"
        onPick={handlePick}
      />
    </div>
  )
}
