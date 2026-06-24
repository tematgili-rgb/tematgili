import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
  WhereFilterOp,
  Firestore,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'
import { deleteFile } from './storage'
import type {
  Product,
  Lead,
  Review,
  SiteImage,
  Settings,
  Package,
  ProductCategoryId,
  Category,
  GalleryImage,
  CarouselItem,
  EventType,
} from './types'

export const COLLECTIONS = {
  products: 'products',
  leads: 'leads',
  reviews: 'reviews',
  siteImages: 'siteImages',
  packages: 'packages',
  settings: 'settings',
  categories: 'categories',
  gallery: 'gallery',
  homeCarousel: 'homeCarousel',
  eventTypes: 'eventTypes',
} as const

function ensureFirebase(): Firestore {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not initialized')
  }
  return db
}

export interface Filter {
  field: string
  op: WhereFilterOp
  value: unknown
}

export async function createDocument<T extends Record<string, any>>(
  name: string,
  data: T
): Promise<string> {
  const fs = ensureFirebase()
  const ref = await addDoc(collection(fs, name), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getDocument<T>(name: string, id: string): Promise<T | null> {
  const fs = ensureFirebase()
  const snap = await getDoc(doc(fs, name, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as DocumentData) } as T
}

export async function updateDocument<T extends Record<string, any>>(
  name: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  const fs = ensureFirebase()
  await updateDoc(doc(fs, name, id), {
    ...data,
    updatedAt: serverTimestamp(),
  } as Record<string, any>)
}

export async function deleteDocument(name: string, id: string): Promise<void> {
  const fs = ensureFirebase()
  await deleteDoc(doc(fs, name, id))
}

export async function queryDocuments<T>(
  name: string,
  filters: Filter[] = [],
  orderByField?: string,
  limitCount?: number
): Promise<T[]> {
  const fs = ensureFirebase()
  const constraints: QueryConstraint[] = filters.map((f) => where(f.field, f.op, f.value))
  if (orderByField) constraints.push(orderBy(orderByField))
  if (limitCount) constraints.push(fbLimit(limitCount))
  const snap = await getDocs(query(collection(fs, name), ...constraints))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as T[]
}

export async function getAllDocuments<T>(name: string): Promise<T[]> {
  const fs = ensureFirebase()
  const snap = await getDocs(collection(fs, name))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })) as T[]
}

export async function createLead(
  lead: Omit<Lead, 'id' | 'createdAt' | 'status'> & { status?: Lead['status'] }
): Promise<string> {
  return createDocument(COLLECTIONS.leads, {
    ...lead,
    status: lead.status || 'new',
  })
}

export async function getAllLeads(): Promise<Lead[]> {
  return queryDocuments<Lead>(COLLECTIONS.leads, [], 'createdAt')
}

export async function updateLeadStatus(id: string, status: Lead['status']): Promise<void> {
  return updateDocument<Lead>(COLLECTIONS.leads, id, { status })
}

export async function getActiveProducts(): Promise<Product[]> {
  return queryDocuments<Product>(
    COLLECTIONS.products,
    [{ field: 'isActive', op: '==', value: true }],
    'sortOrder'
  )
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return queryDocuments<Product>(
    COLLECTIONS.products,
    [
      { field: 'isActive', op: '==', value: true },
      { field: 'isFeatured', op: '==', value: true },
    ],
    'sortOrder'
  )
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const results = await queryDocuments<Product>(
    COLLECTIONS.products,
    [{ field: 'slug', op: '==', value: slug }],
    undefined,
    1
  )
  return results[0] || null
}

export async function getProductsByCategory(cat: ProductCategoryId): Promise<Product[]> {
  return queryDocuments<Product>(
    COLLECTIONS.products,
    [
      { field: 'category', op: '==', value: cat },
      { field: 'isActive', op: '==', value: true },
    ],
    'sortOrder'
  )
}

export async function getApprovedReviews(): Promise<Review[]> {
  return queryDocuments<Review>(
    COLLECTIONS.reviews,
    [{ field: 'status', op: '==', value: 'approved' }],
    'createdAt'
  )
}

export async function getApprovedReviewsByCategory(cat: ProductCategoryId): Promise<Review[]> {
  return queryDocuments<Review>(
    COLLECTIONS.reviews,
    [
      { field: 'status', op: '==', value: 'approved' },
      { field: 'productCategory', op: '==', value: cat },
    ],
    'createdAt'
  )
}

export async function getImagesByCategory(
  cat: SiteImage['category']
): Promise<SiteImage[]> {
  return queryDocuments<SiteImage>(
    COLLECTIONS.siteImages,
    [
      { field: 'category', op: '==', value: cat },
      { field: 'isActive', op: '==', value: true },
    ],
    'sortOrder'
  )
}

export async function getActivePackages(): Promise<Package[]> {
  return queryDocuments<Package>(
    COLLECTIONS.packages,
    [{ field: 'isActive', op: '==', value: true }],
    'sortOrder'
  )
}

export async function getPackageBySlug(slug: string): Promise<Package | null> {
  const results = await queryDocuments<Package>(
    COLLECTIONS.packages,
    [{ field: 'slug', op: '==', value: slug }],
    undefined,
    1
  )
  return results[0] || null
}

export async function getActiveCategories(): Promise<Category[]> {
  return queryDocuments<Category>(
    COLLECTIONS.categories,
    [{ field: 'isActive', op: '==', value: true }],
    'sortOrder'
  )
}

export async function getAllCategoriesAdmin(): Promise<Category[]> {
  const all = await getAllDocuments<Category>(COLLECTIONS.categories)
  return all.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

// Gallery (product images library)
export async function getAllGalleryImages(): Promise<GalleryImage[]> {
  const items = await getAllDocuments<GalleryImage>(COLLECTIONS.gallery)
  return items.sort((a, b) => {
    const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.toMillis?.() ?? 0
    const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.toMillis?.() ?? 0
    return tb - ta
  })
}

export async function getGalleryByCategory(category: string): Promise<GalleryImage[]> {
  return queryDocuments<GalleryImage>(
    COLLECTIONS.gallery,
    [{ field: 'category', op: '==', value: category }]
  )
}

export async function createGalleryImage(
  data: Omit<GalleryImage, 'id' | 'createdAt'>
): Promise<string> {
  return createDocument(COLLECTIONS.gallery, data)
}

export async function deleteGalleryImage(id: string, imageUrl: string): Promise<void> {
  // Best-effort storage cleanup. External URLs (not Firebase Storage) will throw — swallow.
  try {
    if (imageUrl) await deleteFile(imageUrl)
  } catch (e) {
    console.warn('Storage delete skipped:', e)
  }
  await deleteDocument(COLLECTIONS.gallery, id)
}

// Home carousel
export async function getCarouselItems(): Promise<CarouselItem[]> {
  const items = await getAllDocuments<CarouselItem>(COLLECTIONS.homeCarousel)
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export async function createCarouselItem(
  data: Omit<CarouselItem, 'id' | 'createdAt'>
): Promise<string> {
  return createDocument(COLLECTIONS.homeCarousel, data)
}

export async function updateCarouselItem(
  id: string,
  data: Partial<CarouselItem>
): Promise<void> {
  return updateDocument<CarouselItem>(COLLECTIONS.homeCarousel, id, data)
}

export async function deleteCarouselItem(id: string, imageUrl: string): Promise<void> {
  try {
    if (imageUrl) await deleteFile(imageUrl)
  } catch (e) {
    console.warn('Storage delete skipped:', e)
  }
  await deleteDocument(COLLECTIONS.homeCarousel, id)
}

// Event types
export async function getActiveEventTypes(): Promise<EventType[]> {
  return queryDocuments<EventType>(
    COLLECTIONS.eventTypes,
    [{ field: 'isActive', op: '==', value: true }],
    'sortOrder'
  )
}

export async function getAllEventTypesAdmin(): Promise<EventType[]> {
  const all = await getAllDocuments<EventType>(COLLECTIONS.eventTypes)
  return all.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

export async function createEventType(
  data: Omit<EventType, 'id' | 'createdAt'>
): Promise<string> {
  return createDocument(COLLECTIONS.eventTypes, data)
}

export async function updateEventType(
  id: string,
  data: Partial<EventType>
): Promise<void> {
  return updateDocument<EventType>(COLLECTIONS.eventTypes, id, data)
}

export async function deleteEventType(id: string): Promise<void> {
  return deleteDocument(COLLECTIONS.eventTypes, id)
}

export async function getSettings(): Promise<Settings | null> {
  const fs = ensureFirebase()
  const snap = await getDoc(doc(fs, COLLECTIONS.settings, 'site'))
  if (!snap.exists()) return null
  return snap.data() as Settings
}

export async function updateSettings(data: Partial<Settings>): Promise<void> {
  const fs = ensureFirebase()
  await setDoc(
    doc(fs, COLLECTIONS.settings, 'site'),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

export { where, orderBy, fbLimit as limit }
