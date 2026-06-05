import type { SiteImage } from './types'

const STATIC_GALLERY: SiteImage[] = Array.from({ length: 26 }, (_, i) => {
  const num = String(i + 1).padStart(2, '0')
  return {
    id: `static-gallery-${num}`,
    category: 'gallery',
    name: `עבודה ${i + 1}`,
    imageUrl: `/gallery/gallery-${num}.jpg`,
    isActive: true,
    sortOrder: i,
    createdAt: new Date(),
  } as SiteImage
})

const STATIC_LOGO: SiteImage[] = [
  {
    id: 'static-logo-main',
    category: 'logo',
    name: 'לוגו ראשי',
    imageUrl: '/logo.png',
    isActive: true,
    sortOrder: 0,
    createdAt: new Date(),
  } as SiteImage,
]

const ABOUT_URLS = [
  { name: 'חגיגת יום הולדת מעוצבת', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80' },
  { name: 'עיצוב מיתוג מוצרים', url: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800&q=80' },
]

const STATIC_ABOUT: SiteImage[] = ABOUT_URLS.map((a, i) => ({
  id: `static-about-${i + 1}`,
  category: 'about' as const,
  name: a.name,
  imageUrl: a.url,
  isActive: true,
  sortOrder: i,
  createdAt: new Date(),
} as SiteImage))

const STATIC_PACKAGES: SiteImage[] = []

export function staticImagesFor(cat: SiteImage['category']): SiteImage[] {
  if (cat === 'gallery') return STATIC_GALLERY
  if (cat === 'logo') return STATIC_LOGO
  if (cat === 'about') return STATIC_ABOUT
  if (cat === 'packages') return STATIC_PACKAGES
  return []
}

export function getStaticSiteImages(): SiteImage[] {
  return [
    ...STATIC_LOGO,
    ...STATIC_GALLERY,
    ...STATIC_ABOUT,
    ...STATIC_PACKAGES,
  ]
}
