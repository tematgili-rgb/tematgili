import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tematgili.co.il'

const STATIC_PATHS = [
  '/',
  '/products',
  '/packages',
  '/gallery',
  '/about',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
  '/accessibility',
] as const

async function safeFetch<T>(loader: () => Promise<T[]>): Promise<T[]> {
  try {
    const res = await loader()
    return Array.isArray(res) ? res : []
  } catch (err) {
    console.warn('[sitemap] dynamic load failed', err)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: p === '/' ? 1 : 0.7,
  }))

  let dynamicEntries: MetadataRoute.Sitemap = []
  try {
    const db = await import('@/lib/db')
    const [products, packages] = await Promise.all([
      safeFetch(() => db.getActiveProducts()),
      safeFetch(() => db.getActivePackages()),
    ])

    dynamicEntries = [
      ...products.map((p: any) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...packages.map((p: any) => ({
        url: `${SITE_URL}/packages/${p.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    ]
  } catch (err) {
    console.warn('[sitemap] dynamic section skipped', err)
  }

  return [...staticEntries, ...dynamicEntries]
}
