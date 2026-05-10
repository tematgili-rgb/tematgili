import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Check, Star } from 'lucide-react'
import Image from 'next/image'
import Breadcrumbs from '@/components/common/Breadcrumbs'
import ProductGallery from '@/components/product/ProductGallery'
import ContactCTABox from '@/components/product/ContactCTABox'
import ProductShareButtons from '@/components/product/ProductShareButtons'
import CategoryPill from '@/components/product/CategoryPill'
import LeadFormInline from '@/components/forms/LeadFormInline'
import { getProductBySlug, getApprovedReviewsByCategory } from '@/lib/db'
import { PRODUCT_CATEGORIES } from '@/lib/constants'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

async function fetchProduct(slug: string) {
  try {
    return await getProductBySlug(slug)
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await fetchProduct(params.slug)
  if (!product) {
    return { title: 'מוצר לא נמצא' }
  }
  return {
    title: `${product.name} — תמתגילי`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.mainImageUrl ? [product.mainImageUrl] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await fetchProduct(params.slug)
  if (!product) notFound()

  let reviews: Awaited<ReturnType<typeof getApprovedReviewsByCategory>> = []
  try {
    reviews = await getApprovedReviewsByCategory(product.category)
  } catch {
    reviews = []
  }

  const productUrl = `${SITE_URL}/products/${product.slug}`
  const galleryImages = [product.mainImageUrl, ...(product.galleryUrls || [])].filter(
    (u): u is string => Boolean(u)
  )
  const categoryName =
    PRODUCT_CATEGORIES.find((c) => c.id === product.category)?.name || ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: galleryImages,
    category: categoryName,
    brand: { '@type': 'Brand', name: 'תמתגילי' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ILS',
      price: product.startingPrice,
      availability: 'https://schema.org/InStock',
      url: productUrl,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs
          items={[
            { label: 'בית', href: '/' },
            { label: 'המוצרים שלנו', href: '/products' },
            { label: product.name },
          ]}
        />
      </div>

      <section className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <ProductGallery images={galleryImages} productName={product.name} />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <CategoryPill category={product.category} />
              <h1 className="text-3xl md:text-4xl font-black text-text-dark leading-tight">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-lg text-text-dark/80">{product.shortDescription}</p>
              )}
            </div>

            <div className="flex items-baseline gap-3 pb-4 border-b border-primary-soft">
              <span className="text-3xl font-black text-accent">
                החל מ-₪{product.startingPrice}
              </span>
              {product.minQuantity > 0 && (
                <span className="text-sm text-text-dark/60">
                  • מינ׳ {product.minQuantity} יח׳
                </span>
              )}
            </div>

            {product.features?.length > 0 && (
              <div>
                <h2 className="font-bold text-text-dark mb-3">מה תקבלו:</h2>
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-text-dark/80">
                      <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.longDescription && (
              <div>
                <h2 className="font-bold text-text-dark mb-2">פרטים נוספים</h2>
                <p className="text-text-dark/80 whitespace-pre-line leading-relaxed">
                  {product.longDescription}
                </p>
              </div>
            )}

            <ContactCTABox productName={product.name} minQuantity={product.minQuantity} />

            <ProductShareButtons
              productName={product.name}
              productSlug={product.slug}
              productUrl={productUrl}
              productImageUrl={product.mainImageUrl}
            />
          </div>
        </div>
      </section>

      <section className="bg-primary-soft py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl p-6 md:p-10 border-2 border-white shadow-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-text-dark">
                רוצים הצעת מחיר ל{product.name}?
              </h2>
              <p className="text-text-dark/70 mt-2">השאירו פרטים ונחזור אליכם עם כל הפרטים</p>
            </div>
            <LeadFormInline source="product_page" productInterest={product.name} />
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-black text-text-dark text-center mb-10">
              המלצות לקוחות
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {reviews.slice(0, 6).map((r) => (
                <div
                  key={r.id}
                  className="bg-bg-soft rounded-2xl border-2 border-primary-soft p-6 flex flex-col gap-3"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < r.rating ? 'fill-accent text-accent' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-text-dark/80 flex-1">״{r.text}״</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-primary-soft">
                    {r.imageUrl ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={r.imageUrl}
                          alt={r.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                        {r.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-semibold text-text-dark text-sm">{r.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
