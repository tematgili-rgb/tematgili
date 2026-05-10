import type { Metadata } from 'next'
import Link from 'next/link'
import WhatsAppButton from '@/components/common/WhatsAppButton'

export const metadata: Metadata = {
  title: 'תודה רבה — תמתגילי',
  description: 'הפנייה התקבלה. ניצור איתכם קשר תוך 24 שעות.',
  robots: { index: false, follow: false },
}

export default function ThankYouPage() {
  const conversionScript = `
    try {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', { send_to: 'lead', event_category: 'lead', event_label: 'thank_you' });
      }
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'Lead');
      }
    } catch (e) {}
  `

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <script dangerouslySetInnerHTML={{ __html: conversionScript }} />

      <div className="max-w-xl mx-auto text-center bg-white rounded-2xl p-8 md:p-12 border-2 border-primary-soft shadow-sm">
        <div className="text-6xl mb-4" aria-hidden>💕</div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">תודה רבה!</h1>
        <p className="text-lg text-text-dark/80 mb-2">פנייתכם התקבלה.</p>
        <p className="text-text-dark/70 mb-8">
          נחזור אליכם תוך 24 שעות, בדרך כלל הרבה מהר יותר.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl h-11 px-6 text-sm font-medium bg-primary text-white hover:opacity-90 transition-opacity"
          >
            חזרה לדף הבית
          </Link>
          <WhatsAppButton
            source="thank_you"
            label="דברו איתנו ב-WhatsApp"
            message="היי, השארתי פרטים באתר 💕"
            className="h-11 px-6"
          />
        </div>

        <div className="mt-10 pt-6 border-t border-primary-soft">
          <p className="text-sm text-text-dark/60 mb-3">בינתיים אפשר לעיין:</p>
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <Link href="/products" className="text-accent hover:underline">קטלוג מוצרים</Link>
            <span aria-hidden className="text-text-dark/30">·</span>
            <Link href="/packages" className="text-accent hover:underline">חבילות מוכנות</Link>
            <span aria-hidden className="text-text-dark/30">·</span>
            <Link href="/gallery" className="text-accent hover:underline">גלריה</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
