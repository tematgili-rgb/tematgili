'use client'

import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { CONTACT_INFO } from '@/lib/constants'
import { trackWhatsAppClick } from '@/lib/tracking'
import { isAuthorizedRedirect } from '@/lib/url-validation'

const MESSAGE = 'היי, ראיתי את האתר ואשמח לפרטים'

export default function StickyWhatsApp() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null

  const href = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(MESSAGE)}`
  const safeHref = isAuthorizedRedirect(href) ? href : `https://wa.me/${CONTACT_INFO.whatsapp}`

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick('sticky_button')}
      aria-label="צרו קשר בוואטסאפ"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}
