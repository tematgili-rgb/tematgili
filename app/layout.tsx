import type { Metadata, Viewport } from 'next'
import { Heebo } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import ConditionalHeader from '@/components/layout/ConditionalHeader'
import ConditionalFooter from '@/components/layout/ConditionalFooter'
import StickyWhatsApp from '@/components/common/StickyWhatsApp'
import StickyInstagram from '@/components/common/StickyInstagram'
import AccessibilityWidget from '@/components/common/AccessibilityWidget'
import CookieConsent from '@/components/common/CookieConsent'
import ExitIntentPopup from '@/components/common/ExitIntentPopup'
import TrackingScripts from '@/components/common/TrackingScripts'
import { CONTACT_INFO } from '@/lib/constants'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-heebo',
  display: 'swap',
})

const displayFont = localFont({
  src: './fonts/OHSalmanHabaka.otf',
  variable: '--font-display',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'תמתגילי — מיתוג לאירועים ומתנות',
  description:
    'מוצרי מיתוג מודפסים בהתאמה אישית: חוברות צביעה, עטיפות שוקולד, קופסאות פופקורן, כובעי מסיבה ועוד',
  manifest: '/manifest.json',
  openGraph: {
    title: 'תמתגילי — מיתוג לאירועים ומתנות',
    description:
      'מוצרי מיתוג מודפסים בהתאמה אישית: חוברות צביעה, עטיפות שוקולד, קופסאות פופקורן, כובעי מסיבה ועוד',
    locale: 'he_IL',
    type: 'website',
    url: SITE_URL,
    siteName: 'תמתגילי',
  },
}

export const viewport: Viewport = {
  themeColor: '#F4A8B8',
  width: 'device-width',
  initialScale: 1,
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'תמתגילי',
  description:
    'מוצרי מיתוג מודפסים בהתאמה אישית לאירועים ומתנות',
  areaServed: 'IL',
  url: SITE_URL,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+972-50-000-0000',
    contactType: 'customer service',
    availableLanguage: ['Hebrew'],
  },
  sameAs: [CONTACT_INFO.instagram],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${displayFont.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-bg-soft text-text-dark font-sans">
        <a href="#main-content" className="skip-to-content">
          דלג לתוכן הראשי
        </a>
        <ConditionalHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <ConditionalFooter />
        <StickyWhatsApp />
        <StickyInstagram />
        <AccessibilityWidget />
        <CookieConsent />
        <ExitIntentPopup />
        <TrackingScripts />
      </body>
    </html>
  )
}
