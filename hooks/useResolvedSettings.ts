'use client'

import { useEffect, useState } from 'react'
import {
  DEFAULT_RESOLVED_SETTINGS,
  getResolvedSettings,
  type ResolvedSettings,
} from '@/lib/settings'

let cached: ResolvedSettings | null = null
let inflight: Promise<ResolvedSettings> | null = null

async function load(): Promise<ResolvedSettings> {
  if (cached) return cached
  if (inflight) return inflight
  inflight = (async () => {
    const s = await getResolvedSettings()
    cached = s
    return s
  })()
  return inflight
}

export function useResolvedSettings(): ResolvedSettings {
  const [settings, setSettings] = useState<ResolvedSettings>(
    cached || DEFAULT_RESOLVED_SETTINGS,
  )
  useEffect(() => {
    let alive = true
    load().then((s) => {
      if (alive) setSettings(s)
    })
    return () => {
      alive = false
    }
  }, [])
  return settings
}
