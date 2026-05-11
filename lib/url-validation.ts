const HTTPS_DOMAINS = [
  'tematgili.co.il',
  'wa.me',
  'whatsapp.com',
  'instagram.com',
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
  'lh3.googleusercontent.com',
]

const LOCAL_HOSTS = ['localhost', '127.0.0.1']

const ALLOWED_DOMAINS = [...HTTPS_DOMAINS, ...LOCAL_HOSTS]

export function isAuthorizedRedirect(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return false
  }

  const isLocal = LOCAL_HOSTS.includes(u.hostname)

  if (u.protocol === 'http:') {
    return isLocal
  }

  if (u.protocol !== 'https:') {
    return false
  }

  if (isLocal) return true

  return HTTPS_DOMAINS.some(
    (domain) => u.hostname === domain || u.hostname.endsWith('.' + domain)
  )
}

export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  try {
    const u = new URL(url)
    const isLocal = LOCAL_HOSTS.includes(u.hostname)
    if (u.protocol === 'http:' && !isLocal) return false
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
    return ALLOWED_DOMAINS.some(
      (domain) => u.hostname === domain || u.hostname.endsWith('.' + domain)
    )
  } catch {
    return false
  }
}

export function sanitizeImageUrl(url: string): string | null {
  return isValidImageUrl(url) ? url : null
}

export { ALLOWED_DOMAINS }
