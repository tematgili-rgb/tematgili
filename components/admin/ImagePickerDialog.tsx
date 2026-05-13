'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Loader2, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAllDocuments } from '@/lib/db'
import { getStaticSiteImages } from '@/lib/staticImages'
import type { SiteImage } from '@/lib/types'

const CATEGORY_TABS: Array<{ id: 'all' | SiteImage['category']; label: string }> = [
  { id: 'all', label: 'הכל' },
  { id: 'logo', label: 'לוגו' },
  { id: 'hero_carousel', label: 'קרוסלה' },
  { id: 'gallery', label: 'גלריה' },
  { id: 'about', label: 'אודות' },
  { id: 'packages', label: 'חבילות' },
]

type Mode = 'single' | 'multiple'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: Mode
  onPick: (urls: string | string[]) => void
  currentUrls?: string[]
}

export default function ImagePickerDialog({ open, onOpenChange, mode, onPick, currentUrls }: Props) {
  const [tab, setTab] = useState<'all' | SiteImage['category']>('all')
  const [search, setSearch] = useState('')
  const [firestoreImages, setFirestoreImages] = useState<SiteImage[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setSelected(currentUrls ?? [])
    setLoading(true)
    getAllDocuments<SiteImage>('siteImages')
      .then((list) => setFirestoreImages(list))
      .catch(() => setFirestoreImages([]))
      .finally(() => setLoading(false))
  }, [open, currentUrls])

  const all = useMemo(() => {
    const fromDb = firestoreImages
    const fromStatic = getStaticSiteImages()
    return [...fromDb, ...fromStatic]
  }, [firestoreImages])

  const filtered = useMemo(() => {
    return all.filter((img) => {
      if (tab !== 'all' && img.category !== tab) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        if (!img.name.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [all, tab, search])

  const toggle = (url: string) => {
    if (mode === 'single') {
      setSelected([url])
    } else {
      setSelected((prev) =>
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
      )
    }
  }

  const handleConfirm = () => {
    if (mode === 'single') {
      onPick(selected[0] ?? '')
    } else {
      onPick(selected)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>בחר תמונות</DialogTitle>
          <DialogDescription>
            {mode === 'single' ? 'לחץ על תמונה לבחירה' : 'בחר תמונה אחת או יותר'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {CATEGORY_TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-2xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-white'
                    : 'bg-white text-text-dark border border-primary-soft hover:bg-primary-soft'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="חיפוש לפי שם..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">לא נמצאו תמונות</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto p-1 w-full">
            {filtered.map((img) => {
              const isSel = selected.includes(img.imageUrl)
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => toggle(img.imageUrl)}
                  className={`relative bg-primary-soft/20 rounded-2xl overflow-hidden border-2 transition-all w-full block ${
                    isSel ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-primary-soft'
                  }`}
                  style={{ aspectRatio: '1 / 1' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.imageUrl}
                    alt={img.name}
                    className="absolute inset-0 w-full h-full object-cover block"
                  />
                  {isSel && (
                    <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] py-0.5 px-1 truncate text-right">
                    {img.name}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2 border-t border-primary-soft">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={selected.length === 0}>
            {mode === 'multiple' && selected.length > 0
              ? `הוסף ${selected.length} תמונות`
              : 'בחר'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
