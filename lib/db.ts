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
import type {
  Product,
  Lead,
  Review,
  SiteImage,
  Settings,
  Package,
  ProductCategoryId,
  Category,
} from './types'

export const COLLECTIONS = {
  products: 'products',
  leads: 'leads',
  reviews: 'reviews',
  siteImages: 'siteImages',
  packages: 'packages',
  settings: 'settings',
  categories: 'categories',
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
