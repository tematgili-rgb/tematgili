import Link from 'next/link'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import { getActiveProducts } from '@/lib/db'

export default async function ProductsShowcase() {
  let hasProducts = false
  try {
    const products = await getActiveProducts()
    hasProducts = products.length > 0
  } catch {
    hasProducts = false
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-text-dark">
            המוצרים שלנו
          </h2>
          <p className="text-text-dark/70 mt-3 text-lg">
            הכל מודפס בהתאמה אישית, באיכות גבוהה ובכמויות שמתאימות לכם
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {PRODUCT_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`rounded-2xl border-2 p-6 flex flex-col items-center text-center gap-4 shadow-sm hover:shadow-md transition-shadow ${cat.color}`}
            >
              <span className="text-5xl md:text-6xl" aria-hidden>
                {cat.icon}
              </span>
              <h3 className="font-bold text-text-dark text-lg">{cat.name}</h3>
              <Link
                href={`/products?category=${cat.id}`}
                className="mt-auto inline-flex items-center justify-center rounded-2xl h-10 px-4 text-sm font-medium bg-white border-2 border-text-dark/10 text-text-dark hover:border-accent hover:text-accent transition-colors"
              >
                צפו במוצרים
              </Link>
            </div>
          ))}
        </div>

        {!hasProducts && (
          <p className="text-center text-text-dark/50 text-sm mt-8">
            המוצרים שלנו בדרך — צרו קשר ונכין לכם הצעה מותאמת אישית
          </p>
        )}
      </div>
    </section>
  )
}
