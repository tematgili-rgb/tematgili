'use client'

import { useEffect, useState } from 'react'
import { getSettings } from '@/lib/db'
import type { FontSetting } from '@/lib/types'

interface Loaded {
  heading?: FontSetting
  body?: FontSetting
}

function escFamily(family: string): string {
  return family.replace(/"/g, '')
}

function buildCss(loaded: Loaded): string {
  const parts: string[] = []
  const { heading, body } = loaded

  // @font-face for uploads
  if (heading?.source === 'upload' && heading.url) {
    parts.push(`@font-face { font-family: "${escFamily(heading.family)}"; src: url("${heading.url}"); font-display: swap; }`)
  }
  if (body?.source === 'upload' && body.url) {
    parts.push(`@font-face { font-family: "${escFamily(body.family)}"; src: url("${body.url}"); font-display: swap; }`)
  }

  // CSS variables
  const vars: string[] = []
  if (heading?.family) vars.push(`--font-heading-custom: "${escFamily(heading.family)}";`)
  if (body?.family) vars.push(`--font-body-custom: "${escFamily(body.family)}";`)
  if (vars.length) parts.push(`:root { ${vars.join(' ')} }`)

  return parts.join('\n')
}

export default function FontInjector() {
  const [loaded, setLoaded] = useState<Loaded>({})
  const [googleLinks, setGoogleLinks] = useState<string[]>([])

  useEffect(() => {
    getSettings()
      .then((s) => {
        if (!s) return
        setLoaded({ heading: s.fontHeading, body: s.fontBody })
        const links: string[] = []
        if (s.fontHeading?.source === 'google' && s.fontHeading.url) links.push(s.fontHeading.url)
        if (s.fontBody?.source === 'google' && s.fontBody.url) links.push(s.fontBody.url)
        setGoogleLinks(links)
      })
      .catch(() => {
        // silent — fonts are optional
      })
  }, [])

  const css = buildCss(loaded)

  return (
    <>
      {googleLinks.map((href) => (
        // eslint-disable-next-line @next/next/no-css-tags
        <link key={href} rel="stylesheet" href={href} />
      ))}
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
    </>
  )
}
