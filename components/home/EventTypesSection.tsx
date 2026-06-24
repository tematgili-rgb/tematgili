import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getActiveEventTypes } from '@/lib/db'
import { EVENT_TYPES } from '@/lib/constants'
import type { EventType } from '@/lib/types'

// Fallback built-ins, used when Firestore is empty or unavailable.
const BUILTIN_EVENTS: EventType[] = EVENT_TYPES.map((e, i) => ({
  id: e.id,
  slug: e.id,
  name: e.name,
  icon: e.emoji,
  sortOrder: i,
  isActive: true,
  createdAt: new Date(),
}))

export default async function EventTypesSection() {
  let events: EventType[] = []
  try {
    events = await getActiveEventTypes()
  } catch {
    events = []
  }

  if (events.length === 0) events = BUILTIN_EVENTS
  if (events.length === 0) return null

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
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/products?event=${event.slug}`}
              className="group bg-white rounded-2xl border border-primary-soft hover:border-primary transition-all p-4 flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary-soft flex items-center justify-center">
                <span className="text-2xl md:text-3xl leading-none" aria-hidden="true">
                  {event.icon}
                </span>
              </div>
              <span className="flex-1 font-semibold text-text-dark text-base md:text-lg group-hover:text-accent transition-colors text-right">
                {event.name}
              </span>
              <ChevronLeft className="w-5 h-5 text-primary/50 group-hover:text-accent group-hover:-translate-x-1 transition-all shrink-0" strokeWidth={2} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
