import ConfettiBalloons from '@/components/home/ConfettiBalloons'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import EventTypesSection from '@/components/home/EventTypesSection'
import ProductsShowcase from '@/components/home/ProductsShowcase'
import PackagesPreviewSection from '@/components/home/PackagesPreviewSection'
import GalleryStrip from '@/components/home/GalleryStrip'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import FinalCTASection from '@/components/home/FinalCTASection'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/constants'

const ContactFormSection = dynamic(() => import('@/components/home/ContactFormSection'), {
  ssr: false,
})

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description:
    'מוצרי מיתוג מודפסים בהתאמה אישית: חוברות צביעה, עטיפות שוקולד, קופסאות פופקורן, כובעי מסיבה ועוד. הפכו כל אירוע למיוחד.',
}

export default function HomePage() {
  return (
    <>
      <ConfettiBalloons />
      <HeroSection />
      <EventTypesSection />
      <ProductsShowcase />
      <PackagesPreviewSection />
      <GalleryStrip />
      <TestimonialsSection />
      <ContactFormSection />
      <FinalCTASection />
    </>
  )
}
