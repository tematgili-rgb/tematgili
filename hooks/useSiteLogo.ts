'use client'

import { useEffect, useState } from 'react'
import { getImagesByCategory } from '@/lib/db'

const DEFAULT_LOGO = '/logo.png'

let cachedLogo: string | null = null
let inflight: Promise<string> | null = null

async function loadLogo(): Promise<string> {
  if (cachedLogo) return cachedLogo
  if (inflight) return inflight
  inflight = (async () => {
    try {
      const imgs = await getImagesByCategory('logo')
      const url = imgs.find((i) => i.imageUrl)?.imageUrl
      cachedLogo = url || DEFAULT_LOGO
    } catch {
      cachedLogo = DEFAULT_LOGO
    }
    return cachedLogo
  })()
  return inflight
}

export function useSiteLogo(): string {
  const [url, setUrl] = useState<string>(cachedLogo || DEFAULT_LOGO)
  useEffect(() => {
    let alive = true
    loadLogo().then((u) => {
      if (alive && u !== url) setUrl(u)
    })
    return () => {
      alive = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return url
}
