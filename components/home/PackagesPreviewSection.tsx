import Link from 'next/link'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getActivePackages } from '@/lib/db'
import type { Package } from '@/lib/types'

export default async function PackagesPreviewSection() {
  let packages: Package[] = []
  try {
    packages = (await getActivePackages()).slice(0, 3)
  } catch {
    packages = []
  }

  if (packages.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-cream/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-text-dark">
            חבילות מוכנות לאירועים פופולריים
          </h2>
          <p className="text-text-dark/70 mt-3 text-lg">
            פתרונות מלאים לאירוע שלם — במחיר משתלם
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
                <h3 className="text-xl font-bold text-text-dark">{pkg.name}</h3>
                {pkg.includedItems?.length > 0 && (
                  <ul className="space-y-2 flex-1">
                    {pkg.includedItems.slice(0, 5).map((item, i) => (
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
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/packages/${pkg.slug}`}>פרטים נוספים</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button asChild size="lg" className="bg-accent text-white hover:bg-accent/90">
            <Link href="/packages">ראו את כל החבילות</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
