import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/common/Breadcrumbs'
import LeadFormInline from '@/components/forms/LeadFormInline'
import WhatsAppButton from '@/components/common/WhatsAppButton'
import PhoneButton from '@/components/common/PhoneButton'
import { getPackageBySlug, getDocument } from '@/lib/db'
import type { Product } from '@/lib/types'

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

  const includedProductIds = pkg.includedProducts ?? []
  const includedProducts: Product[] = (
    await Promise.all(
      includedProductIds.map((id) =>
        getDocument<Product>('products', id).catch(() => null)
      )
    )
  ).filter((p): p is Product => p !== null)

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

            {includedProducts.length > 0 && (
              <div>
                <h2 className="font-bold text-text-dark mb-3">מה כלול בחבילה:</h2>
                <ul className="space-y-3">
                  {includedProducts.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.slug}`}
                        className="flex items-center gap-3 p-3 rounded-2xl border-2 border-primary-soft hover:border-primary transition"
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-primary-soft/40 shrink-0">
                          {p.mainImageUrl && (
                            <Image
                              src={p.mainImageUrl}
                              alt={p.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-dark truncate">{p.name}</p>
                          <p className="text-sm text-accent font-semibold">
                            ₪{p.startingPrice} ליחידה
                          </p>
                        </div>
                      </Link>
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
