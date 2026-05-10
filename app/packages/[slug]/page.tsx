import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Check } from 'lucide-react'
import Breadcrumbs from '@/components/common/Breadcrumbs'
import LeadFormInline from '@/components/forms/LeadFormInline'
import WhatsAppButton from '@/components/common/WhatsAppButton'
import PhoneButton from '@/components/common/PhoneButton'
import { getPackageBySlug } from '@/lib/db'

async function fetchPackage(slug: string) {
  try {
    return await getPackageBySlug(slug)
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const pkg = await fetchPackage(params.slug)
  if (!pkg) return { title: 'חבילה לא נמצאה' }
  return {
    title: `${pkg.name} — תמתגילי`,
    description: pkg.description,
    openGraph: {
      title: pkg.name,
      description: pkg.description,
      images: pkg.imageUrl ? [pkg.imageUrl] : [],
    },
  }
}

export default async function PackageDetailPage({ params }: { params: { slug: string } }) {
  const pkg = await fetchPackage(params.slug)
  if (!pkg) notFound()

  const waMessage = `היי! אני מתעניין/ת בחבילה "${pkg.name}". אשמח לקבל פרטים נוספים.`

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs
          items={[
            { label: 'בית', href: '/' },
            { label: 'החבילות שלנו', href: '/packages' },
            { label: pkg.name },
          ]}
        />
      </div>

      <section className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-primary-soft border-2 border-primary-soft">
            {pkg.imageUrl ? (
              <Image
                src={pkg.imageUrl}
                alt={pkg.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🎁</div>
            )}
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-black text-text-dark leading-tight">
              {pkg.name}
            </h1>
            {pkg.description && (
              <p className="text-lg text-text-dark/80 whitespace-pre-line">{pkg.description}</p>
            )}

            <div className="pb-4 border-b border-primary-soft">
              <span className="text-3xl font-black text-accent">
                החל מ-₪{pkg.startingPrice}
              </span>
            </div>

            {pkg.includedItems?.length > 0 && (
              <div>
                <h2 className="font-bold text-text-dark mb-3">מה כלול בחבילה:</h2>
                <ul className="space-y-2">
                  {pkg.includedItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-text-dark/80">
                      <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-primary-soft border-2 border-primary rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-text-dark text-center">
                מתעניינים בחבילה? דברו איתנו 💕
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <WhatsAppButton
                  source="package_page"
                  message={waMessage}
                  label="WhatsApp"
                  className="flex-1 h-12 text-base"
                />
                <PhoneButton label="התקשרו אלינו" className="flex-1 h-12 text-base bg-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary-soft py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl p-6 md:p-10 border-2 border-white shadow-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-text-dark">
                רוצים הצעת מחיר ל{pkg.name}?
              </h2>
              <p className="text-text-dark/70 mt-2">השאירו פרטים ונחזור אליכם</p>
            </div>
            <LeadFormInline source="package_page" productInterest={pkg.name} />
          </div>
        </div>
      </section>
    </>
  )
}
