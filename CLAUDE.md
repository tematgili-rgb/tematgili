# תמתגילי — Project Spec (Authoritative)

**This file is the source of truth for types, constants, and signatures. Any deviation requires explicit approval.**

## Business model
Catalog + lead capture site (NOT e-commerce). No cart, no checkout, no online designer.
Conversion flow: visitor → browses catalog → submits lead form / clicks WhatsApp → admin closes via WhatsApp.

## Stack
Next.js 14 App Router, TypeScript strict, Tailwind, Firebase (firestore + auth + storage), Resend, RTL Hebrew.

## Brand
- Primary: `#F4A8B8` (pink) — main
- Primary-soft: `#FBD9DF` — bg, hover
- Accent: `#DC4848` (red) — CTA
- Cream: `#F2DCB6`, Twine: `#C9A876`
- Text-dark: `#1F1F2E`, Bg-soft: `#FFFAF7`
- Font: Heebo (--font-heebo), display Caveat optional
- Tone: warm, personal, "מתוקה", "המתנה המושלמת"

## Product categories (catalog-specific, NOT generic e-commerce)
```ts
type ProductCategoryId =
  | 'coloring-book'    // חוברות צביעה
  | 'snack-wrap'       // עטיפות שוקולד
  | 'popcorn-box'      // קופסאות פופקורן
  | 'party-hat'        // כובעי מסיבה
  | 'gift-box'         // קופסאות מתנה
  | 'bottle-label'     // תוויות לבקבוקים
  | 'backdrop-sign'    // שלטי קישוט
```

## Required `lib/types.ts` exports
```ts
import { Timestamp } from 'firebase/firestore'

export type ProductCategoryId = 'coloring-book' | 'snack-wrap' | 'popcorn-box' | 'party-hat' | 'gift-box' | 'bottle-label' | 'backdrop-sign'

export interface Product {
  id: string
  slug: string
  category: ProductCategoryId
  name: string
  shortDescription: string
  longDescription: string
  startingPrice: number
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
  category: 'logo' | 'hero_carousel' | 'gallery' | 'about'
  name: string
  imageUrl: string
  isActive: boolean
  sortOrder: number
  createdAt: Timestamp | Date
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
}

export interface Package {
  id: string
  slug: string
  name: string             // "חבילת יום הולדת לגיל 1"
  description: string
  startingPrice: number
  imageUrl: string
  includedItems: string[]  // ["חוברת צביעה", "50 עטיפות", ...]
  eventType?: string
  isActive: boolean
  sortOrder: number
  createdAt: Timestamp | Date
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  contentMarkdown: string  // Plain markdown
  coverImageUrl: string
  authorName: string
  tags: string[]
  isPublished: boolean
  publishedAt?: Timestamp | Date
  createdAt: Timestamp | Date
}
```

## Required `lib/constants.ts` exports
```ts
export const PRODUCT_CATEGORIES = [
  { id: 'coloring-book', name: 'חוברות צביעה',  icon: '📕', color: 'bg-primary-soft border-primary' },
  { id: 'snack-wrap',    name: 'עטיפות שוקולד',  icon: '🍫', color: 'bg-cream border-twine' },
  { id: 'popcorn-box',   name: 'קופסאות פופקורן', icon: '🍿', color: 'bg-primary-soft border-accent' },
  { id: 'party-hat',     name: 'כובעי מסיבה',     icon: '🎉', color: 'bg-cream border-primary' },
  { id: 'gift-box',      name: 'קופסאות מתנה',    icon: '🎁', color: 'bg-primary-soft border-twine' },
  { id: 'bottle-label',  name: 'תוויות לבקבוקים', icon: '🍼', color: 'bg-cream border-accent' },
  { id: 'backdrop-sign', name: 'שלטי קישוט',      icon: '🪧', color: 'bg-primary-soft border-primary' },
] as const

export const EVENT_TYPES = [
  { id: 'birthday',  name: 'יום הולדת',          emoji: '🎂' },
  { id: 'baby',      name: 'ברית / חינה',         emoji: '👶' },
  { id: 'school',    name: 'בית ספר / תיכון',    emoji: '🎓' },
  { id: 'business',  name: 'אירוע חברה',         emoji: '💼' },
  { id: 'wedding',   name: 'חתונה / אירוסין',    emoji: '💕' },
  { id: 'holidays',  name: 'חגים',                emoji: '✨' },
] as const

export const CONTACT_INFO = {
  phone: '050-000-0000',
  whatsapp: '972500000000',
  email: 'info@tematgili.co.il',
  instagram: 'https://instagram.com/tematgili',
  facebook: '',
  workingHours: 'א-ה 09:00-21:00 | ו 09:00-13:00',
}

export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'tematgili@gmail.com'
export const SITE_NAME = 'תמתגילי'
export const SITE_TAGLINE = 'מיתוג לאירועים ומתנות'

export const LEAD_STATUSES = [
  { value: 'new',                label: 'חדש' },
  { value: 'answered',           label: 'נענה' },
  { value: 'called_no_answer',   label: 'התקשרנו - לא ענו' },
  { value: 'not_relevant',       label: 'לא רלוונטי' },
  { value: 'closed_deal',        label: 'עסקה סגורה' },
] as const
```

## Required `lib/url-validation.ts` exports
```ts
export function isAuthorizedRedirect(url: string): boolean
export function isValidImageUrl(url: string): boolean
export function sanitizeImageUrl(url: string): string | null
```
ALLOWED_DOMAINS: tematgili.co.il, wa.me, whatsapp.com, firebasestorage.googleapis.com, storage.googleapis.com, lh3.googleusercontent.com, localhost, 127.0.0.1.
HTTP allowed only for localhost/127.0.0.1.

## Required `lib/tracking.ts` exports
```ts
export function sendGenerateLeadEvent(source: string): void
export function sendMetaLeadEvent(): void
export function trackWhatsAppClick(source: string): void
export function trackPhoneClick(): void
export function getGclid(): string | undefined
export function trackEvent(name: string, params?: Record<string, any>): void
export function trackPageView(url: string): void
```

## Required `lib/db.ts` functions (in addition to generic CRUD)
```ts
// Generic
createDocument<T>(name, data): Promise<string>
getDocument<T>(name, id): Promise<T | null>
updateDocument<T>(name, id, data): Promise<void>
deleteDocument(name, id): Promise<void>
queryDocuments<T>(name, filters?, orderByField?, limitCount?): Promise<T[]>
getAllDocuments<T>(name): Promise<T[]>

// Leads
createLead(lead): Promise<string>
getAllLeads(): Promise<Lead[]>
updateLeadStatus(id, status): Promise<void>

// Products
getActiveProducts(): Promise<Product[]>
getFeaturedProducts(): Promise<Product[]>
getProductBySlug(slug): Promise<Product | null>
getProductsByCategory(cat): Promise<Product[]>

// Reviews
getApprovedReviews(): Promise<Review[]>
getApprovedReviewsByCategory(cat): Promise<Review[]>

// Site images
getImagesByCategory(cat): Promise<SiteImage[]>

// Packages
getActivePackages(): Promise<Package[]>
getPackageBySlug(slug): Promise<Package | null>

// Blog
getPublishedPosts(): Promise<BlogPost[]>
getPostBySlug(slug): Promise<BlogPost | null>

// Settings
getSettings(): Promise<Settings | null>
updateSettings(data: Partial<Settings>): Promise<void>
```

## Pages plan
```
/                     home (hero, event types, products, gallery strip, testimonials, lead form, final CTA)
/products             catalog
/products/[slug]      product detail (gallery + lead form + WhatsApp share + favorites)
/packages             ready-made bundles
/packages/[slug]      bundle detail
/blog                 blog index
/blog/[slug]          blog post
/gallery              works gallery
/about                about
/contact              contact form
/faq                  FAQ + JSON-LD
/privacy              privacy policy
/terms                terms
/accessibility        a11y statement
/thank-you            after lead submission
/review/[token]       customer review submission
/admin/*              admin panel (login, dashboard, leads, products, packages, blog, images, reviews, settings)
/api/create-lead      POST endpoint
/api/send-email       POST endpoint
/api/lead-magnet      POST — collect email then return PDF download URL
/api/review/[token]   POST submit review
```

## Constraints
- Mobile-first, Hebrew RTL, dir="rtl" on `<html>`
- No client-side cart / checkout / designer
- All buttons that go to WhatsApp/phone call tracking helpers
- LeadFormInline appears on home, product, packages, blog, contact
- Server-side validation in API routes (rate limit, phone regex `^05\d{8}$`)
- next/image with `fill`+`sizes` for responsive
- Strict CSP in next.config; redirects validated by isAuthorizedRedirect
- Hebrew text throughout; RTL utilities; focus-visible outlines for a11y
- Firestore rules: only admin writes products/reviews/siteImages/settings; anyone creates leads but only admin reads

## What NOT to add
- Generic e-commerce types (variants, SKU, stock, printAreas). This is a catalog, not a shop.
- Cart / wishlist beyond a localStorage favorites list.
- Online designer / customization UI.
- Authenticated user accounts other than the admin.
