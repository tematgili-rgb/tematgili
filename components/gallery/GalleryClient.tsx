'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { PRODUCT_CATEGORIES } from '@/lib/constants'

export interface GalleryItem {
  id: string
  url: string
  alt: string
  category?: string
}

interface Props {
  items: GalleryItem[]
}

export default function GalleryClient({ items }: Props) {
  const [activeCat, setActiveCat] = useState<string>('all')
  const [openItem, setOpenItem] = useState<GalleryItem | null>(null)

  const filtered = useMemo(() => {
    if (activeCat === 'all') return items
    return items.filter((i) => i.category === activeCat)
  }, [items, activeCat])

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-center mb-8" role="tablist" aria-label="סינון לפי קטגוריה">
        <button
          type="button"
          role="tab"
          aria-selected={activeCat === 'all'}
          onClick={() => setActiveCat('all')}
          className={[
            'px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors',
            activeCat === 'all'
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-text-dark border-primary-soft hover:bg-primary-soft',
          ].join(' ')}
        >
          הכל
        </button>
        {PRODUCT_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={activeCat === c.id}
            onClick={() => setActiveCat(c.id)}
            className={[
              'px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors',
              activeCat === c.id
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text-dark border-primary-soft hover:bg-primary-soft',
            ].join(' ')}
          >
            <span className="ml-1" aria-hidden>{c.icon}</span>
            {c.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-text-dark/60 py-16">אין תמונות בקטגוריה זו עדיין.</p>
      ) : (
        <div
          className="gap-4"
          style={{ columnCount: 3, columnGap: '1rem' }}
        >
          <style>{`
            @media (max-width: 768px) { .__masonry { column-count: 2 !important; } }
            @media (max-width: 480px) { .__masonry { column-count: 1 !important; } }
          `}</style>
          <div className="__masonry" style={{ columnCount: 3, columnGap: '1rem' }}>
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenItem(item)}
                className="block w-full mb-4 break-inside-avoid rounded-2xl overflow-hidden border-2 border-primary-soft bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 hover:scale-[1.01] transition-transform"
                style={{ breakInside: 'avoid' }}
                aria-label={`הגדל תמונה: ${item.alt}`}
              >
                <Image
                  src={item.url}
                  alt={item.alt}
                  width={600}
                  height={800}
                  sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
                  className="w-full h-auto block"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!openItem} onOpenChange={(o) => !o && setOpenItem(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 flex items-center justify-center">
          <DialogTitle className="sr-only">{openItem?.alt || 'תמונה'}</DialogTitle>
          {openItem && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={openItem.url}
              alt={openItem.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
