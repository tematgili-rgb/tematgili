import { Timestamp } from 'firebase/firestore'

// Runtime allows any string id — built-ins are listed in lib/constants.ts.
export type ProductCategoryId = string

export interface Product {
  id: string
  slug: string
  category: ProductCategoryId
  name: string
  shortDescription: string
  longDescription: string
  startingPrice: number          // computed: pricePerUnit ?? packagePrice ?? 0
  pricePerUnit?: number
  packagePrice?: number
  packageQuantity?: number
  minQuantity: number
  mainImageUrl: string
  galleryUrls: string[]
  features: string[]
  occasions: string[]
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
  createdAt: Timestamp | Date
  updatedAt?: Timestamp | Date
}

export interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  message?: string
  productInterest?: string
  eventType?: string
  source: 'popup' | 'home_form' | 'contact_page' | 'product_page' | 'sticky_whatsapp' | 'exit_intent' | 'lead_magnet' | string
  status: 'new' | 'answered' | 'called_no_answer' | 'not_relevant' | 'closed_deal'
  gclid?: string
  createdAt: Timestamp | Date
}

export interface Review {
  id: string
  name: string
  rating: number
  text: string
  productCategory?: ProductCategoryId
  status: 'pending' | 'approved'
  featured: boolean
  imageUrl?: string
  createdAt: Timestamp | Date
}

export interface SiteImage {
  id: string
  category: 'logo' | 'hero_carousel' | 'gallery' | 'about' | 'packages'
  name: string
  imageUrl: string
  isActive: boolean
  sortOrder: number
  tags?: string[]
  createdAt: Timestamp | Date
}

export interface FontSetting {
  family: string
  url?: string
  source: 'upload' | 'google'
}

export interface Settings {
  contactPhone: string
  contactWhatsapp: string
  contactEmail: string
  instagramUrl: string
  facebookUrl?: string
  tiktokUrl?: string
  address?: string
  workingHours?: string
  fontHeading?: FontSetting
  fontBody?: FontSetting
}

export interface Package {
  id: string
  slug: string
  name: string
  description: string
  startingPrice: number
  imageUrl: string
  includedItems: string[]
  eventType?: string
  isActive: boolean
  sortOrder: number
  createdAt: Timestamp | Date
}

export interface Category {
  id: string
  slug: string
  name: string
  icon: string
  imageUrls: string[]
  sortOrder: number
  isActive: boolean
  isBuiltIn?: boolean
  createdAt: Timestamp | Date
}
