import { CONTACT_INFO } from '@/lib/constants'
import { getSettings } from '@/lib/db'

export interface ResolvedSettings {
  phone: string
  whatsapp: string
  email: string
  instagramUrl: string
  facebookUrl: string
  tiktokUrl: string
  address: string
  workingHours: string
  // Hero copy
  heroBadge: string
  heroTitle: string
  heroSubtitle: string
  heroCtaPrimary: string
  heroCtaSecondary: string
  // Final CTA copy
  ctaTitle: string
  ctaSubtitle: string
  ctaButtonText: string
}

export const DEFAULT_RESOLVED_SETTINGS: ResolvedSettings = {
  phone: CONTACT_INFO.phone,
  whatsapp: CONTACT_INFO.whatsapp,
  email: CONTACT_INFO.email,
  instagramUrl: CONTACT_INFO.instagram,
  facebookUrl: CONTACT_INFO.facebook,
  tiktokUrl: '',
  address: '',
  workingHours: CONTACT_INFO.workingHours,
  heroBadge: 'מיתוג אישי לכל אירוע ✨',
  heroTitle: 'מיתוג לאירועים ומתנות',
  heroSubtitle:
    'חוברות צביעה, עטיפות שוקולד, קופסאות פופקורן ועוד — כל מה שהופך את האירוע שלכם למיוחד, מודפס בהתאמה אישית.',
  heroCtaPrimary: 'ראו את המוצרים',
  heroCtaSecondary: 'חבילות מוכנות',
  ctaTitle: 'מוכנים להפוך את האירוע שלכם למיוחד?',
  ctaSubtitle: 'דברו איתנו ב-WhatsApp ונכין לכם הצעה מותאמת אישית',
  ctaButtonText: 'לכתוב לנו ב-WhatsApp',
}

function pick(value: string | undefined | null, fallback: string): string {
  const v = (value ?? '').trim()
  return v ? v : fallback
}

export async function getResolvedSettings(): Promise<ResolvedSettings> {
  try {
    const s = await getSettings()
    if (!s) return DEFAULT_RESOLVED_SETTINGS
    return {
      phone: pick(s.contactPhone, DEFAULT_RESOLVED_SETTINGS.phone),
      whatsapp: pick(s.contactWhatsapp, DEFAULT_RESOLVED_SETTINGS.whatsapp),
      email: pick(s.contactEmail, DEFAULT_RESOLVED_SETTINGS.email),
      instagramUrl: pick(s.instagramUrl, DEFAULT_RESOLVED_SETTINGS.instagramUrl),
      facebookUrl: pick(s.facebookUrl, DEFAULT_RESOLVED_SETTINGS.facebookUrl),
      tiktokUrl: pick(s.tiktokUrl, DEFAULT_RESOLVED_SETTINGS.tiktokUrl),
      address: pick(s.address, DEFAULT_RESOLVED_SETTINGS.address),
      workingHours: pick(s.workingHours, DEFAULT_RESOLVED_SETTINGS.workingHours),
      heroBadge: pick(s.heroBadge, DEFAULT_RESOLVED_SETTINGS.heroBadge),
      heroTitle: pick(s.heroTitle, DEFAULT_RESOLVED_SETTINGS.heroTitle),
      heroSubtitle: pick(s.heroSubtitle, DEFAULT_RESOLVED_SETTINGS.heroSubtitle),
      heroCtaPrimary: pick(s.heroCtaPrimary, DEFAULT_RESOLVED_SETTINGS.heroCtaPrimary),
      heroCtaSecondary: pick(s.heroCtaSecondary, DEFAULT_RESOLVED_SETTINGS.heroCtaSecondary),
      ctaTitle: pick(s.ctaTitle, DEFAULT_RESOLVED_SETTINGS.ctaTitle),
      ctaSubtitle: pick(s.ctaSubtitle, DEFAULT_RESOLVED_SETTINGS.ctaSubtitle),
      ctaButtonText: pick(s.ctaButtonText, DEFAULT_RESOLVED_SETTINGS.ctaButtonText),
    }
  } catch {
    return DEFAULT_RESOLVED_SETTINGS
  }
}
