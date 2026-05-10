'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface Props {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const safeImages = images.length > 0 ? images : []
  const [activeIdx, setActiveIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  if (safeImages.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-primary-soft flex items-center justify-center text-6xl">
        🎁
      </div>
    )
  }

  const next = () => setActiveIdx((i) => (i + 1) % safeImages.length)
  const prev = () => setActiveIdx((i) => (i - 1 + safeImages.length) % safeImages.length)

  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const dx = e.changedTouches[0].clientX - touchStart
    if (Math.abs(dx) > 40) {
      // RTL: swipe right = previous, swipe left = next
      if (dx > 0) prev()
      else next()
    }
    setTouchStart(null)
  }

  const current = safeImages[activeIdx]

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-primary-soft border-2 border-primary-soft group"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={current}
          alt={`${productName} ${activeIdx + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-3 left-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-md"
          aria-label="הגדל תמונה"
        >
          <Expand className="h-4 w-4 text-text-dark" />
        </button>
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="תמונה קודמת"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-5 w-5 text-text-dark" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="תמונה הבאה"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-5 w-5 text-text-dark" />
            </button>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {safeImages.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-colors ${
                idx === activeIdx ? 'border-accent' : 'border-primary-soft hover:border-primary'
              }`}
              aria-label={`תמונה ${idx + 1}`}
            >
              <Image
                src={url}
                alt={`${productName} תמונה ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 border-0 bg-transparent shadow-none">
          <div
            className="relative aspect-square w-full bg-black rounded-2xl overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <Image
              src={current}
              alt={`${productName} ${activeIdx + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="תמונה קודמת"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-md"
                >
                  <ChevronRight className="h-6 w-6 text-text-dark" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="תמונה הבאה"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-md"
                >
                  <ChevronLeft className="h-6 w-6 text-text-dark" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
