'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, MessageCircle } from 'lucide-react'
import { trackPhoneClick, trackWhatsAppClick } from '@/lib/tracking'
import { isAuthorizedRedirect } from '@/lib/url-validation'
import { useSiteLogo } from '@/hooks/useSiteLogo'
import { useResolvedSettings } from '@/hooks/useResolvedSettings'

const NAV_LINKS = [
  { href: '/', label: 'בית' },
  { href: '/products', label: 'מוצרים' },
  { href: '/packages', label: 'חבילות' },
  { href: '/gallery', label: 'גלריה' },
  { href: '/about', label: 'אודות' },
  { href: '/contact', label: 'צור קשר' },
]

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const logoSrc = useSiteLogo()
  const settings = useResolvedSettings()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href)

  const waUrl = `https://wa.me/${settings.whatsapp}`
  const safeWaUrl = isAuthorizedRedirect(waUrl) ? waUrl : `https://wa.me/${settings.whatsapp}`

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-primary-soft shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4 relative">
        <button
          type="button"
          aria-label="פתח תפריט"
          onClick={() => setOpen(true)}
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-primary-soft"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          href="/"
          aria-label="תמתגילי - עמוד הבית"
          className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center"
        >
          <Image
            src={logoSrc}
            alt="תמתגילי - מיתוג לאירועים ומתנות"
            width={918}
            height={314}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <Link
          href="/"
          aria-label="תמתגילי - עמוד הבית"
          className="hidden md:flex items-center shrink-0"
        >
          <Image
            src={logoSrc}
            alt="תמתגילי - מיתוג לאירועים ומתנות"
            width={918}
            height={314}
            priority
            className="h-12 md:h-14 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                isActive(link.href) ? 'text-accent' : 'text-text-dark'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={safeWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('header')}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#25D366] text-white px-3 h-10 text-sm font-medium hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden lg:inline">WhatsApp</span>
          </a>
          <a
            href={`tel:${settings.phone}`}
            onClick={() => trackPhoneClick('header')}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-primary text-primary px-3 h-10 text-sm font-medium hover:bg-primary-soft"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden lg:inline">התקשרו</span>
          </a>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute top-0 right-0 h-full w-72 bg-white shadow-xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Image
                src={logoSrc}
                alt="תמתגילי"
                width={918}
                height={314}
                className="h-10 w-auto"
              />
              <button
                type="button"
                aria-label="סגור תפריט"
                onClick={() => setOpen(false)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-2xl border border-primary-soft"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2 rounded-2xl text-sm font-medium ${
                    isActive(link.href)
                      ? 'bg-primary-soft text-accent'
                      : 'text-text-dark hover:bg-primary-soft'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </header>
  )
}
