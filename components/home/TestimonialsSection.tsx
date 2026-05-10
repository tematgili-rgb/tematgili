import Image from 'next/image'
import { Star } from 'lucide-react'
import { getApprovedReviews } from '@/lib/db'
import type { Review } from '@/lib/types'

const SEED_REVIEWS: Pick<Review, 'name' | 'rating' | 'text' | 'imageUrl'>[] = [
  {
    name: 'מיכל',
    rating: 5,
    text: 'החוברות צביעה היו פשוט מהממות! הילדים בכיתה התלהבו בטירוף. תודה ענקית, חזרתי כבר לעוד הזמנה ליום הולדת הבא.',
  },
  {
    name: 'רותם',
    rating: 5,
    text: 'הזמנתי עטיפות שוקולד ליום הולדת 30 שלי. השירות אישי, מהיר ומחיר הוגן. הסטיילינג של השולחן יצא מושלם!',
  },
  {
    name: 'הילה',
    rating: 5,
    text: 'הקופסאות פופקורן הוסיפו את הוואו לאירוע. עוצב בדיוק לפי הגוון שביקשתי. ממליצה בלב שלם.',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`דירוג ${rating} מתוך 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${i < rating ? 'fill-accent text-accent' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

export default async function TestimonialsSection() {
  let reviews: Pick<Review, 'name' | 'rating' | 'text' | 'imageUrl'>[] = []
  try {
    const fetched = await getApprovedReviews()
    reviews = fetched.slice(0, 3)
  } catch {
    reviews = []
  }
  if (reviews.length === 0) reviews = SEED_REVIEWS

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-text-dark">
            מה אומרות הלקוחות
          </h2>
          <p className="text-text-dark/70 mt-3 text-lg">
            סיפורים של אירועים שהפכו לבלתי נשכחים
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((r, idx) => (
            <div
              key={idx}
              className="bg-bg-soft rounded-2xl border-2 border-primary-soft p-6 flex flex-col gap-4"
            >
              <StarRating rating={r.rating} />
              <p className="text-text-dark/80 leading-relaxed flex-1">״{r.text}״</p>
              <div className="flex items-center gap-3 pt-2 border-t border-primary-soft">
                {r.imageUrl ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={r.imageUrl}
                      alt={r.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    {r.name.charAt(0)}
                  </div>
                )}
                <span className="font-semibold text-text-dark">{r.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
