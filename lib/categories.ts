import { getAllDocuments } from './db'
import { PRODUCT_CATEGORIES } from './constants'
import type { Category } from './types'

export interface MergedCategory {
  id: string
  slug: string
  name: string
  icon: string
  imageUrls: string[]
  sortOrder: number
  isActive: boolean
  isBuiltIn: boolean
}

function builtIns(): MergedCategory[] {
  return PRODUCT_CATEGORIES.map((c, i) => ({
    id: c.id,
    slug: c.id,
    name: c.name,
    icon: c.icon,
    imageUrls: [],
    sortOrder: i,
    isActive: true,
    isBuiltIn: true,
  }))
}

/**
 * Merges Firestore categories with the 7 built-ins.
 * Firestore versions win by slug. When Firestore is empty (or unavailable)
 * the built-ins are returned virtually.
 */
export async function getMergedCategories(): Promise<MergedCategory[]> {
  let fromDb: Category[] = []
  try {
    fromDb = await getAllDocuments<Category>('categories')
  } catch {
    fromDb = []
  }

  const bySlug = new Map<string, MergedCategory>()
  for (const b of builtIns()) bySlug.set(b.slug, b)
  for (const c of fromDb) {
    bySlug.set(c.slug, {
      id: c.id,
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      imageUrls: c.imageUrls ?? [],
      sortOrder: c.sortOrder ?? 0,
      isActive: c.isActive ?? true,
      isBuiltIn: !!c.isBuiltIn,
    })
  }

  return Array.from(bySlug.values()).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export function getBuiltInCategories(): MergedCategory[] {
  return builtIns()
}
