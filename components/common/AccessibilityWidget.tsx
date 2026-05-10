'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Accessibility, X } from 'lucide-react'

type Settings = {
  fontScale: number
  contrastHigh: boolean
  contrastInvert: boolean
  highlightLinks: boolean
  readableFont: boolean
  bigCursor: boolean
  pauseAnimations: boolean
}

const DEFAULTS: Settings = {
  fontScale: 1,
  contrastHigh: false,
  contrastInvert: false,
  highlightLinks: false,
  readableFont: false,
  bigCursor: false,
  pauseAnimations: false,
}

const STORAGE_KEY = 'a11y-settings'

function applySettings(s: Settings) {
  if (typeof document === 'undefined') return
  document.documentElement.style.fontSize = `${s.fontScale * 100}%`
  document.body.classList.toggle('a11y-contrast-high', s.contrastHigh)
  document.body.classList.toggle('a11y-contrast-invert', s.contrastInvert)
  document.body.classList.toggle('a11y-highlight-links', s.highlightLinks)
  document.body.classList.toggle('a11y-readable-font', s.readableFont)
  document.body.classList.toggle('a11y-big-cursor', s.bigCursor)
  document.body.classList.toggle('a11y-pause-animations', s.pauseAnimations)
}

export default function AccessibilityWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<Settings>(DEFAULTS)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = { ...DEFAULTS, ...JSON.parse(stored) } as Settings
        setSettings(parsed)
        applySettings(parsed)
      }
    } catch {}
  }, [])

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    applySettings(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }

  const reset = () => {
    setSettings(DEFAULTS)
    applySettings(DEFAULTS)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      <button
        type="button"
        aria-label="פתח תפריט נגישות"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 inline-flex items-center justify-center h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:scale-105 transition-transform"
      >
        <Accessibility className="h-7 w-7" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label="הגדרות נגישות"
            className="absolute top-0 right-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">נגישות</h2>
              <button
                type="button"
                aria-label="סגור"
                onClick={() => setOpen(false)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-2xl border border-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block font-medium mb-2">גודל טקסט</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => update({ fontScale: Math.max(0.8, settings.fontScale - 0.1) })}
                    className="h-9 w-9 rounded-2xl border border-gray-200"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center">{Math.round(settings.fontScale * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => update({ fontScale: Math.min(1.5, settings.fontScale + 0.1) })}
                    className="h-9 w-9 rounded-2xl border border-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {(
                [
                  ['contrastHigh', 'ניגודיות גבוהה'],
                  ['contrastInvert', 'היפוך צבעים'],
                  ['highlightLinks', 'הדגשת קישורים'],
                  ['readableFont', 'גופן קריא'],
                  ['bigCursor', 'סמן גדול'],
                  ['pauseAnimations', 'עצירת אנימציות'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between gap-2">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={settings[key] as boolean}
                    onChange={(e) => update({ [key]: e.target.checked } as Partial<Settings>)}
                    className="h-5 w-5"
                  />
                </label>
              ))}

              <button
                type="button"
                onClick={reset}
                className="w-full h-10 rounded-2xl border-2 border-primary text-primary hover:bg-primary-soft"
              >
                איפוס הגדרות
              </button>

              <a
                href="/accessibility"
                className="block text-center text-blue-600 underline text-sm"
              >
                הצהרת נגישות
              </a>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
