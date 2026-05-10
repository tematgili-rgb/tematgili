import type { Metadata } from 'next'
import GalleryClient, { GalleryItem } from '@/components/gallery/GalleryClient'

export const metadata: Metadata = {
  title: 'גלריית עבודות — תמתגילי',
  description: 'גלריית עבודות נבחרות של תמתגילי - מיתוג לאירועים ומתנות מותאמות אישית.',
}

const FALLBACK_GALLERY = Array.from({ length: 26 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0')
  return `/gallery/gallery-${num}.jpg`
})

const FALLBACK_IMAGES: GalleryItem[] = FALLBACK_GALLERY.map((url, i) => ({
  id: `gallery-${String(i + 1).padStart(2, '0')}`,
  url,
  alt: `עבודה ${i + 1}`,
  category: undefined,
}))

async function loadGallery(): Promise<GalleryItem[]> {
  try {
    const { getImagesByCategory } = await import('@/lib/db')
    const imgs = await getImagesByCategory('gallery')
    if (imgs && imgs.length) {
      return imgs.map((img) => ({
        id: img.id,
        url: img.imageUrl,
        alt: img.name,
        category: undefined,
      }))
    }
  } catch (err) {
    console.warn('[gallery] using fallback images', err)
  }
  return FALLBACK_IMAGES
}

export default async function GalleryPage() {
  const items = await loadGallery()
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-bold font-display text-text-dark mb-3">גלריית עבודות</h1>
        <p className="text-text-dark/70 max-w-2xl mx-auto">
          הצצה לעבודות נבחרות שיצרנו ללקוחות שלנו. לחצו על תמונה להגדלה.
        </p>
      </header>
      <GalleryClient items={items} />
    </div>
  )
}
