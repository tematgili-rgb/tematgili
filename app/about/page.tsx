import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import LeadFormInline from '@/components/forms/LeadFormInline'

export const metadata: Metadata = {
  title: 'אודות — תמתגילי',
  description:
    'תמתגילי - סטודיו לעיצוב ומיתוג מוצרים מודפסים לאירועים ומתנות. הסיפור שלנו, הערכים והייעוד.',
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-text-dark mb-3">אודות תמתגילי</h1>
        <p className="text-text-dark/70 max-w-2xl mx-auto text-lg">
          מיתוג אישי, מתוק ומדויק - לכל אירוע ולכל מתנה.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto mb-16">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-text-dark">הסיפור שלנו</h2>
          <p className="text-text-dark/80 leading-relaxed mb-3">
            תמתגילי נולדה מאהבה לעיצוב אישי ומהרצון להפוך כל אירוע לחוויה בלתי נשכחת. כל מוצר אצלנו
            מתוכנן בקפידה, מודפס באיכות גבוהה ומותאם בדיוק עבורכם.
          </p>
          <p className="text-text-dark/80 leading-relaxed">
            התחלנו עם רעיון פשוט: שכל ילד וילדה יוכלו לקבל את המתנה שתמיד חלמו עליה, ושכל הורה יוכל להפיק
            יום הולדת מושלם בלי כאב ראש. היום אנחנו מלווים מאות לקוחות בשנה - מימי הולדת קטנים ועד
            אירועים גדולים.
          </p>
        </div>
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-primary-soft">
          <Image
            src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80"
            alt="חגיגת יום הולדת מעוצבת"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto mb-16">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream md:order-1 order-2">
          <Image
            src="https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800&q=80"
            alt="עיצוב מיתוג מוצרים"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="md:order-2 order-1">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-text-dark">המשימה שלנו</h2>
          <p className="text-text-dark/80 leading-relaxed mb-3">
            להפוך כל פריט קטן - חוברת צביעה, עטיפת שוקולד, קופסת פופקורן - למשהו ייחודי שמספר את
            הסיפור שלכם. אנחנו מאמינים שהפרטים הקטנים הם מה שעושה את ההבדל.
          </p>
          <p className="text-text-dark/80 leading-relaxed">
            מהשרטוט הראשון ועד למשלוח, אנחנו ליד הלקוחות שלנו - מקשיבים, מייעצים ומלווים. כי הצלחה של
            אירוע היא גם הצלחה שלנו.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-text-dark">
          למה לבחור בנו?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🎨', title: 'עיצוב אישי', text: 'כל הזמנה מקבלת התאמה ייחודית, עם הקשבה לטעם ולסגנון שלכם.' },
            { icon: '⚡', title: 'מהירות תגובה', text: 'מענה תוך 24 שעות, ייצור מהיר וזמני אספקה אמינים.' },
            { icon: '💖', title: 'איכות שאוהבים', text: 'הדפסות חדות, חומרים פרימיום, גימור מקצועי - הכל ב-MVP.' },
          ].map((c) => (
            <div
              key={c.title}
              className="bg-white rounded-2xl p-6 border-2 border-primary-soft text-center shadow-sm"
            >
              <div className="text-4xl mb-3" aria-hidden>{c.icon}</div>
              <h3 className="font-bold text-lg mb-2 text-text-dark">{c.title}</h3>
              <p className="text-text-dark/70 text-sm leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 md:p-10 max-w-4xl mx-auto border-2 border-primary-soft shadow-sm">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-text-dark">
          מוכנים להתחיל?
        </h2>
        <p className="text-center text-text-dark/70 mb-6">
          השאירו פרטים ונחזור אליכם עם הצעה מותאמת לאירוע שלכם.
        </p>
        <LeadFormInline source="about_page" />
        <div className="text-center mt-6">
          <Link href="/products" className="text-accent hover:underline font-semibold">
            או צפו בקטלוג המוצרים שלנו ←
          </Link>
        </div>
      </section>
    </div>
  )
}
