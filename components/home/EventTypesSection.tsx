import Link from 'next/link'
import { EVENT_TYPES } from '@/lib/constants'

export default function EventTypesSection() {
  return (
    <section className="py-16 md:py-24 bg-bg-soft">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-text-dark">
            לכל אירוע — הפיתרון שלנו
          </h2>
          <p className="text-text-dark/70 mt-3 text-lg">
            בחרו את סוג האירוע שלכם וגלו את המוצרים המתאימים
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {EVENT_TYPES.map((type) => (
            <Link
              key={type.id}
              href={`/products?event=${type.id}`}
              className="group bg-white rounded-2xl border-2 border-primary-soft hover:border-primary transition-colors p-6 text-center flex flex-col items-center gap-3 shadow-sm hover:shadow-md"
            >
              <span className="text-5xl md:text-6xl" aria-hidden>
                {type.emoji}
              </span>
              <span className="font-semibold text-text-dark text-base md:text-lg group-hover:text-accent transition-colors">
                {type.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
