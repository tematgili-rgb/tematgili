import Link from 'next/link'
import { EVENT_TYPES } from '@/lib/constants'
import { Cake, Baby, GraduationCap, Briefcase, Heart, Sparkles, ChevronLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  birthday: Cake,
  baby:     Baby,
  school:   GraduationCap,
  business: Briefcase,
  wedding:  Heart,
  holidays: Sparkles,
}

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {EVENT_TYPES.map((e) => {
            const Icon = ICON_MAP[e.id] ?? Sparkles
            return (
              <Link
                key={e.id}
                href={`/products?event=${e.id}`}
                className="group bg-white rounded-2xl border border-primary-soft hover:border-primary transition-all p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary-soft flex items-center justify-center">
                  <Icon className="w-6 h-6 md:w-7 md:h-7 text-primary" strokeWidth={1.6} />
                </div>
                <span className="flex-1 font-semibold text-text-dark text-base md:text-lg group-hover:text-accent transition-colors text-right">
                  {e.name}
                </span>
                <ChevronLeft className="w-5 h-5 text-primary/50 group-hover:text-accent group-hover:-translate-x-1 transition-all shrink-0" strokeWidth={2} />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
