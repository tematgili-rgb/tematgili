import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 — הדף לא נמצא | תמתגילי',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 md:py-28 text-center">
      <div className="max-w-xl mx-auto">
        <p className="text-[120px] md:text-[180px] font-extrabold leading-none text-primary select-none">
          404
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-text-dark mt-4 mb-3">
          אופס... הדף הזה לא קיים
        </h1>
        <p className="text-text-dark/70 mb-8">
          ייתכן שהקישור התיישן, או שהקלדת כתובת שגויה. אבל יש לנו עוד הרבה לראות!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl h-11 px-6 text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
          >
            חזרה לדף הבית
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-primary-soft shadow-sm">
          <p className="text-sm font-semibold text-text-dark mb-3">קישורים פופולריים:</p>
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <Link href="/products" className="text-accent hover:underline">קטלוג מוצרים</Link>
            <span aria-hidden className="text-text-dark/30">·</span>
            <Link href="/packages" className="text-accent hover:underline">חבילות מוכנות</Link>
            <span aria-hidden className="text-text-dark/30">·</span>
            <Link href="/gallery" className="text-accent hover:underline">גלריה</Link>
            <span aria-hidden className="text-text-dark/30">·</span>
            <Link href="/contact" className="text-accent hover:underline">צור קשר</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
