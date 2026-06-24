import Link from 'next/link'
import { getMergedCategories } from '@/lib/categories'

export default async function ProductsShowcase() {
  let categories: Awaited<ReturnType<typeof getMergedCategories>> = []
  try {
    categories = await getMergedCategories()
  } catch {
    categories = []
  }

  const active = categories
    .filter((c) => c.isActive)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  if (active.length === 0) return null

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
          {active.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border-2 p-6 flex flex-col items-center text-center gap-4 shadow-sm hover:shadow-md transition-shadow bg-white border-primary-soft"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary-soft flex items-center justify-center border-2 border-primary-soft">
                <span className="text-3xl md:text-4xl leading-none" aria-hidden="true">
                  {cat.icon}
                </span>
              </div>
              <h3 className="font-bold text-text-dark text-lg">{cat.name}</h3>
              <Link
                href={`/products?category=${cat.slug}`}
                className="mt-auto inline-flex items-center justify-center rounded-2xl h-10 px-4 text-sm font-medium bg-white border-2 border-text-dark/10 text-text-dark hover:border-accent hover:text-accent transition-colors"
              >
                צפו במוצרים
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
