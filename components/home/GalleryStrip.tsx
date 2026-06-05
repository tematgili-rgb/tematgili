import Link from 'next/link'
import Image from 'next/image'
import { getImagesByCategory } from '@/lib/db'

const FALLBACK_IMAGES = Array.from({ length: 8 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0')
  return `/gallery/gallery-${num}.jpg`
})

export default async function GalleryStrip() {
  let urls: string[] = []
  try {
    const images = await getImagesByCategory('gallery')
    urls = images.map((i) => i.imageUrl).filter(Boolean)
  } catch {
    urls = []
  }
  if (urls.length === 0) urls = FALLBACK_IMAGES
  urls = urls.slice(0, 8)

  return (
    <section className="py-16 md:py-24 bg-bg-soft">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-text-dark">
            מהגלריה שלנו
          </h2>
          <p className="text-text-dark/70 mt-2">רגעים קסומים מאירועים שעיצבנו</p>
        </div>

        <div className="md:hidden -mx-4 overflow-x-auto">
          <div className="flex gap-3 px-4 snap-x snap-mandatory">
            {urls.map((url, idx) => (
              <Link
                key={idx}
                href="/gallery"
                className="relative shrink-0 w-56 aspect-[9/16] rounded-2xl overflow-hidden snap-center border-2 border-white shadow-sm bg-primary-soft/40"
              >
                <Image
                  src={url}
                  alt={`גלריה ${idx + 1}`}
                  fill
                  sizes="224px"
                  className="object-cover"
                />
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {urls.map((url, idx) => (
            <Link
              key={idx}
              href="/gallery"
              className="relative aspect-[4/5] rounded-2xl overflow-hidden border-2 border-white shadow-sm hover:shadow-md transition-shadow bg-primary-soft/40"
            >
              <Image
                src={url}
                alt={`גלריה ${idx + 1}`}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-300"
              />
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-primary text-primary font-semibold hover:bg-primary-soft transition-colors"
          >
            לכל הגלריה ←
          </Link>
        </div>
      </div>
    </section>
  )
}
