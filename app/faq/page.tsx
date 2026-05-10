import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'שאלות נפוצות — תמתגילי',
  description: 'תשובות לשאלות נפוצות על מוצרי המיתוג, הזמנה מינימלית, זמני אספקה, התאמה אישית ועוד.',
}

const FAQ: { q: string; a: string }[] = [
  {
    q: 'מהי כמות מינימלית להזמנה?',
    a: 'כמות המינימום משתנה בין מוצר למוצר. עטיפות שוקולד וקופסאות פופקורן - החל מ-25 יחידות, חוברות צביעה - החל מ-10 יחידות, כובעי מסיבה ושלטי קישוט - לפי דרישה. בדף כל מוצר רשום המינימום המדויק.',
  },
  {
    q: 'תוך כמה זמן אקבל את ההזמנה?',
    a: 'זמן הייצור הסטנדרטי הוא 7-14 ימי עסקים מרגע אישור העיצוב. בעיצובים מורכבים יותר (כגון חבילות שלמות) הזמן עשוי להגיע ל-21 ימים. יש לנו גם שירות אקספרס בתוספת תשלום.',
  },
  {
    q: 'איך מתבצע המשלוח?',
    a: 'אנחנו עובדות עם חברות שליחויות מובילות. משלוח עד הבית בכל הארץ - 30-50 ש"ח לפי האזור. ניתן גם לאסוף עצמית בתיאום מראש מהסטודיו ללא עלות.',
  },
  {
    q: 'אפשר לקבל עיצוב מותאם אישית?',
    a: 'בוודאי! זו ההתמחות שלנו. כל הזמנה מקבלת התאמה לפי הצבעים, השם, התאריך והנושא של האירוע. אנחנו שולחות שרטוט/הדמיה לאישור לפני ההדפסה.',
  },
  {
    q: 'אילו אמצעי תשלום אתם מקבלים?',
    a: 'אנחנו מקבלות העברה בנקאית, ביט, פייבוקס ותשלום בכרטיס אשראי (כולל עד 3 תשלומים ללא ריבית). דרושה מקדמה של 50% בעת אישור הזמנה והיתרה לפני המשלוח.',
  },
  {
    q: 'מה מדיניות ההחזרות?',
    a: 'מכיוון שכל המוצרים מותאמים אישית ונושאים את שם הלקוח/האירוע, לא ניתן להחזיר אותם. עם זאת, במקרה של פגם בייצור או טעות מצדנו - נחליף את המוצר ללא עלות.',
  },
  {
    q: 'האם אפשר לקבל דוגמה לפני הזמנה גדולה?',
    a: 'כן, אנחנו מציעות הזמנת דוגמה בעלות סמלית. הדוגמה מתבצעת עם העיצוב הסופי שלכם, וכך תוכלו לראות ולהרגיש את המוצר לפני הייצור המלא.',
  },
  {
    q: 'עטיפות השוקולד כשרות?',
    a: 'עטיפות השוקולד עצמן מודפסות על נייר באישור מגע מזון. השוקולדים שאנחנו עובדות איתם הם שוקולדי עלית/קרמבו עם כשרות בד״ץ או רבנות. ניתן לציין דרישת כשרות מיוחדת בעת ההזמנה.',
  },
]

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-bold font-display text-text-dark mb-3">שאלות נפוצות</h1>
        <p className="text-text-dark/70 max-w-2xl mx-auto">
          לא מצאתם תשובה? <Link href="/contact" className="text-accent hover:underline">פנו אלינו</Link>.
        </p>
      </header>

      <div className="max-w-3xl mx-auto space-y-3">
        {FAQ.map((item, i) => (
          <details
            key={i}
            className="group bg-white rounded-2xl border-2 border-primary-soft p-5 shadow-sm open:border-primary"
          >
            <summary className="cursor-pointer list-none flex justify-between items-start gap-4 font-semibold text-text-dark text-lg">
              <span>{item.q}</span>
              <span
                aria-hidden
                className="text-primary text-2xl transition-transform group-open:rotate-45 leading-none select-none"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-text-dark/80 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
