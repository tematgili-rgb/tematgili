declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
    _fbq?: any
  }
}

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ''
const LEAD_CONVERSION_LABEL = process.env.NEXT_PUBLIC_LEAD_CONVERSION_LABEL || ''

function pushDataLayer(payload: Record<string, any>): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}

function gtagSafe(...args: any[]): void {
  if (typeof window === 'undefined') return
  if (typeof window.gtag === 'function') {
    window.gtag(...args)
  } else {
    pushDataLayer({ event: args[1], ...(args[2] || {}) })
  }
}

function normalizePhoneIL(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('972')) return '+' + digits
  if (digits.startsWith('0')) return '+972' + digits.slice(1)
  return '+972' + digits
}

export interface EnhancedConversionData {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
}

export function setEnhancedConversionData(d: EnhancedConversionData): void {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  const payload: Record<string, string> = {}
  if (d.email) payload.email = d.email.trim().toLowerCase()
  if (d.phone) payload.phone_number = normalizePhoneIL(d.phone)
  if (d.firstName) payload.first_name = d.firstName.trim().toLowerCase()
  if (d.lastName) payload.last_name = d.lastName.trim().toLowerCase()
  window.gtag('set', 'user_data', payload)
}

export function trackLeadSubmit(source: string, leadValue: number = 50): void {
  if (typeof window === 'undefined') return
  // Google Ads conversion
  if (GOOGLE_ADS_ID && LEAD_CONVERSION_LABEL) {
    gtagSafe('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${LEAD_CONVERSION_LABEL}`,
      value: leadValue,
      currency: 'ILS',
    })
  }
  // GA4
  gtagSafe('event', 'generate_lead', {
    source,
    value: leadValue,
    currency: 'ILS',
  })
  // Meta
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', { value: leadValue, currency: 'ILS' })
  }
  // GTM dataLayer
  pushDataLayer({ event: 'lead_submit', source, value: leadValue, currency: 'ILS' })
}

export function trackProductView(
  slug: string,
  name: string,
  category: string,
  price: number
): void {
  if (typeof window === 'undefined') return
  gtagSafe('event', 'view_item', {
    currency: 'ILS',
    value: price,
    items: [{ item_id: slug, item_name: name, item_category: category, price }],
  })
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_ids: [slug],
      content_name: name,
      content_category: category,
      content_type: 'product',
      value: price,
      currency: 'ILS',
    })
  }
  pushDataLayer({
    event: 'view_item',
    item_id: slug,
    item_name: name,
    item_category: category,
    value: price,
  })
}

export function trackWhatsAppClick(source: string): void {
  if (typeof window === 'undefined') return
  gtagSafe('event', 'click_whatsapp', { source })
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Contact')
  }
  pushDataLayer({ event: 'click_whatsapp', source })
  trackLeadSubmit('whatsapp_' + source, 30)
}

export function trackPhoneClick(source: string): void {
  if (typeof window === 'undefined') return
  gtagSafe('event', 'click_phone', { source })
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Contact')
  }
  pushDataLayer({ event: 'click_phone', source })
  trackLeadSubmit('phone_' + source, 40)
}

export function trackAddToWishlist(slug: string, name: string): void {
  if (typeof window === 'undefined') return
  gtagSafe('event', 'add_to_wishlist', {
    items: [{ item_id: slug, item_name: name }],
  })
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'AddToWishlist', { content_ids: [slug], content_name: name })
  }
  pushDataLayer({ event: 'add_to_wishlist', item_id: slug, item_name: name })
}

export function trackPdfDownload(filename: string, source: string): void {
  if (typeof window === 'undefined') return
  gtagSafe('event', 'pdf_download', { filename, source })
  pushDataLayer({ event: 'pdf_download', filename, source })
}

export function getGclid(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const stored = window.localStorage.getItem('gclid')
    if (stored) return stored
  } catch {}
  try {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = params.get('gclid')
    if (fromUrl) {
      try { window.localStorage.setItem('gclid', fromUrl) } catch {}
      return fromUrl
    }
  } catch {}
  try {
    const m = document.cookie.match(/(?:^|;\s*)gclid=([^;]+)/)
    if (m) return decodeURIComponent(m[1])
  } catch {}
  return undefined
}

export function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem('utm_params')
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

// ─── Backward-compatibility wrappers ─────────────────────────
export function sendGenerateLeadEvent(source: string): void {
  trackLeadSubmit(source)
}

export function sendMetaLeadEvent(): void {
  if (typeof window === 'undefined') return
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead')
  }
}

export function trackEvent(name: string, params: Record<string, any> = {}): void {
  gtagSafe('event', name, params)
  pushDataLayer({ event: name, ...params })
}

export function trackPageView(url: string): void {
  gtagSafe('event', 'page_view', { page_path: url })
}
