'use client'

import { usePathname } from 'next/navigation'
import { CONTACT_INFO } from '@/lib/constants'
import { trackEvent } from '@/lib/tracking'
import { isAuthorizedRedirect } from '@/lib/url-validation'

export default function StickyInstagram() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null

  const href = CONTACT_INFO.instagram
  if (!isAuthorizedRedirect(href)) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('click_instagram', { source: 'sticky' })}
      aria-label="Instagram"
      className="fixed bottom-24 right-6 z-40 inline-flex items-center justify-center p-4 rounded-full shadow-2xl bg-gradient-to-tr from-pink-400 to-purple-500 text-white hover:scale-110 transition-all"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    </a>
  )
}
