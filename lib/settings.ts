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
    }
  } catch {
    return DEFAULT_RESOLVED_SETTINGS
  }
}
