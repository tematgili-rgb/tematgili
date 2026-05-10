import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MessageCircle, Clock } from 'lucide-react'
import { CONTACT_INFO } from '@/lib/constants'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  )
}

const NAV_LINKS = [
  { href: '/', label: 'בית' },
  { href: '/products', label: 'מוצרים' },
  { href: '/packages', label: 'חבילות' },
  { href: '/gallery', label: 'גלריה' },
  { href: '/about', label: 'אודות' },
  { href: '/contact', label: 'צור קשר' },
]

const LEGAL_LINKS = [
  { href: '/privacy', label: 'מדיניות פרטיות' },
  { href: '/terms', label: 'תנאי שימוש' },
  { href: '/accessibility', label: 'הצהרת נגישות' },
  { href: '/faq', label: 'שאלות ותשובות' },
]

export default function Footer() {
  return (
    <footer className="bg-text-dark text-white py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="inline-block bg-white rounded-2xl p-3 mb-2" aria-label="תמתגילי - עמוד הבית">
            <Image
              src="/logo.png"
              alt="תמתגילי"
              width={918}
              height={314}
              className="h-14 w-auto"
            />
          </Link>
          <p className="text-sm text-white/70 mb-4">מיתוג לאירועים ומתנות</p>
          <div className="flex items-center gap-3">
            {CONTACT_INFO.instagram && (
              <a
                href={CONTACT_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-primary"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            )}
            {CONTACT_INFO.facebook && (
              <a
                href={CONTACT_INFO.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-primary"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-3">ניווט</h3>
          <ul className="space-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/70 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3">יצירת קשר</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a href={`tel:${CONTACT_INFO.phone}`} className="hover:text-white">{CONTACT_INFO.phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                WhatsApp
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-white">{CONTACT_INFO.email}</a>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{CONTACT_INFO.workingHours}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3">משפטי</h3>
          <ul className="space-y-2 text-sm">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/70 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-10 pt-6 border-t border-white/10 text-center text-sm text-white/60">
        © 2026 תמתגילי. כל הזכויות שמורות.
      </div>
    </footer>
  )
}
