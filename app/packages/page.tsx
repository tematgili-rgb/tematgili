import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Check } from 'lucide-react'
import Breadcrumbs from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/button'
import LeadFormInline from '@/components/forms/LeadFormInline'
import { getActivePackages } from '@/lib/db'
import type { Package } from '@/lib/types'

export const metadata: Metadata = {
  title: 'חבילות לאירועים — תמתגילי',
  description: 'חבילות מיתוג מוכנות לימי הולדת, חתונות, אירועי חברה ועוד.',
}

export default async function PackagesPage() {
  let packages: Package[] = []
  try {
    packages = await getActivePackages()
  } catch {
    packages = []
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'בית', href: '/' }, { label: 'החבילות שלנו' }]} />
      </div>

      <section className="container mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black font-display text-text-dark">
            חבילות מוכנות לאירועים
          </h1>
          <p className="text-text-dark/70 mt-3 text-lg">
            פתרונות מלאים — חוסכים לכם זמן וכסף
          </p>
        </div>

        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border-2 border-primary-soft overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
              >
                {pkg.imageUrl && (
                  <div className="relative aspect-[4/3] bg-primary-soft">
                    <Image
                      src={pkg.imageUrl}
                      alt={pkg.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <h2 className="text-xl font-bold text-text-dark">{pkg.name}</h2>
                  {pkg.description && (
                    <p className="text-sm text-text-dark/70">{pkg.description}</p>
                  )}
                  {pkg.includedItems?.length > 0 && (
                    <ul className="space-y-2 flex-1">
                      {pkg.includedItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-dark/80">
                          <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-primary-soft">
                    <span className="text-lg font-bold text-accent">
                      החל מ-₪{pkg.startingPrice}
                    </span>
                  </div>
                  <Button asChild className="w-full bg-accent text-white hover:bg-accent/90">
                    <Link href={`/packages/${pkg.slug}`}>אנחנו רוצים לשמוע פרטים</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-primary-soft">
            <div className="text-5xl mb-4">🎁</div>
            <h3 className="text-xl font-bold text-text-dark">החבילות שלנו בדרך</h3>
            <p className="text-text-dark/70 mt-2">
              בינתיים, השאירו פרטים ונכין לכם הצעה מותאמת אישית
            </p>
          </div>
        )}
      </section>

      <section className="bg-primary-soft py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl p-6 md:p-10 border-2 border-white shadow-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-text-dark">
                רוצים הצעה מותאמת אישית?
              </h2>
              <p className="text-text-dark/70 mt-2">השאירו פרטים ונבנה לכם חבילה לפי האירוע שלכם</p>
            </div>
            <LeadFormInline source="packages_page" />
          </div>
        </div>
      </section>
    </>
  )
}
