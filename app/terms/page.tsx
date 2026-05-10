import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'תקנון — תמתגילי',
  description: 'תקנון השימוש באתר תמתגילי ובשירותים המוצעים בו.',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl p-6 md:p-10 border-2 border-primary-soft shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-2">תקנון</h1>
        <p className="text-text-dark/60 mb-8">עדכון אחרון: 06/05/2026</p>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">1. כללי</h2>
          <p className="text-text-dark/85 leading-relaxed">
            ברוכות הבאות לאתר תמתגילי. השימוש באתר ובשירותים המוצעים בו כפוף לתנאים שלהלן. השימוש
            באתר מהווה הסכמה לתנאים אלה במלואם. אם אינך מסכימה לתנאים - אנא הימנעי משימוש באתר.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">2. אופי השירות</h2>
          <p className="text-text-dark/85 leading-relaxed">
            האתר משמש כקטלוג מוצרים ומידע על שירותי החברה. ההזמנה והרכישה מתבצעות בהתקשרות אישית
            (טלפון/וואטסאפ/אימייל) לאחר השארת פרטים והצעת מחיר ספציפית. אין באתר זה רכישה מקוונת.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">3. מחירים והצעות</h2>
          <p className="text-text-dark/85 leading-relaxed">
            המחירים המופיעים באתר הם מחירי בסיס (&quot;החל מ-&quot;) המתייחסים לכמות המינימום הנקובה. המחיר
            הסופי ייקבע בהתאם לכמות, מורכבות העיצוב, חומרי הגלם ודמי המשלוח. הצעת מחיר תקפה ל-14 יום
            ממועד שליחתה אלא אם צוין אחרת.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">4. ביטולים והחזרות</h2>
          <p className="text-text-dark/85 leading-relaxed">
            מאחר שמדובר במוצרים המיוצרים בהתאמה אישית (&quot;טובין שיוצרו במיוחד בעבור הצרכן&quot; כהגדרתם
            בחוק הגנת הצרכן), לא ניתן לבטל הזמנה לאחר אישור העיצוב הסופי והתחלת הייצור. במקרה של
            פגם או טעות בייצור מצדנו - נחליף את המוצר ללא עלות.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">5. קניין רוחני</h2>
          <p className="text-text-dark/85 leading-relaxed">
            כל התכנים באתר - טקסטים, תמונות, עיצובים, לוגו - הם רכושה הבלעדי של תמתגילי ומוגנים
            בזכויות יוצרים. אין להעתיק, לשכפל, להפיץ או לעשות בהם שימוש מסחרי ללא אישור בכתב.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">6. אחריות</h2>
          <p className="text-text-dark/85 leading-relaxed">
            החברה תעשה כל מאמץ סביר לספק מוצרים איכותיים בזמן. עם זאת, אין החברה אחראית לנזק עקיף,
            תוצאתי או הפסד רווחים. אחריותה של החברה מוגבלת לערך ההזמנה הספציפית.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">7. שימוש בתמונות</h2>
          <p className="text-text-dark/85 leading-relaxed">
            הלקוחה מאשרת לחברה להשתמש בתמונות העבודה הסופית לצרכים שיווקיים (אתר, רשתות חברתיות,
            פורטפוליו) - אלא אם ביקשה אחרת בכתב בעת ההזמנה.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-dark">8. סמכות שיפוט</h2>
          <p className="text-text-dark/85 leading-relaxed">
            על תקנון זה יחולו דיני מדינת ישראל. סמכות השיפוט הבלעדית בכל סכסוך תהיה לבתי המשפט
            המוסמכים בישראל בלבד.
          </p>
        </section>
      </article>
    </div>
  )
}
