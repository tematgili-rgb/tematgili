import type { Metadata } from 'next'
import ContactEmail from '@/components/common/ContactEmail'

export const metadata: Metadata = {
  title: 'הצהרת נגישות — תמתגילי',
  description: 'הצהרת נגישות אתר תמתגילי - תאימות לתקן ת״י 5568 ו-WCAG 2.1 AA.',
}

export default function AccessibilityPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl p-6 md:p-10 border-2 border-primary-soft shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-2">הצהרת נגישות</h1>
        <p className="text-text-dark/60 mb-8">עדכון אחרון: 06/05/2026</p>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">המחויבות שלנו לנגישות</h2>
          <p className="text-text-dark/85 leading-relaxed">
            תמתגילי מאמינה כי האינטרנט צריך להיות נגיש לכולם, ופועלת להבטיח חוויית גלישה שוויונית
            לאנשים עם מוגבלויות. אתר זה תוכנן ופותח על מנת להיות תואם לדרישות תקנות שוויון זכויות
            לאנשים עם מוגבלות (התאמות נגישות לשירות), תשע״ג-2013, ועומד במידת האפשר ברמה AA של
            תקן הנגישות הישראלי ת״י 5568 התואם להנחיות WCAG 2.1.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">התאמות הנגישות באתר</h2>
          <ul className="list-disc pr-6 space-y-2 text-text-dark/85">
            <li>תמיכה מלאה בניווט באמצעות מקלדת בלבד (Tab/Shift+Tab/Enter), כולל מסגרת מיקוד נראית.</li>
            <li>קישור &quot;דלג לתוכן הראשי&quot; בראש כל עמוד.</li>
            <li>טקסט חלופי (alt) לכל התמונות המשמעותיות באתר.</li>
            <li>תיוגי ARIA וסמנטיקה תקנית (HTML5) לקוראי מסך.</li>
            <li>ניגודיות צבעים תואמת AA (יחס 4.5:1 לפחות לטקסט).</li>
            <li>תמיכה מלאה בעברית RTL וכיווניות נכונה של ממשק.</li>
            <li>טקסטים ניתנים להגדלה עד 200% ללא אובדן תוכן או פונקציונליות.</li>
            <li>טפסים עם תוויות (labels) ברורות והודעות שגיאה זמינות לקוראי מסך.</li>
            <li>אין שימוש בהבזקים או תכנים העלולים לגרום להתקפי אפילפסיה.</li>
          </ul>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">פאנל הנגישות באתר</h2>
          <p className="text-text-dark/85 leading-relaxed">
            בכל עמוד באתר זמין פאנל נגישות (לחצן עגול בפינת המסך, או באמצעות צירוף המקשים
            <span className="px-2 py-0.5 mx-1 bg-primary-soft rounded text-sm">Ctrl + U</span>)
            המאפשר:
          </p>
          <ul className="list-disc pr-6 space-y-1 text-text-dark/85">
            <li>הגדלת גודל הטקסט.</li>
            <li>הקטנת גודל הטקסט.</li>
            <li>הפעלת מצב ניגודיות גבוהה.</li>
            <li>הדגשת קישורים.</li>
            <li>עצירת אנימציות וסרטונים.</li>
            <li>הגדלת רווחי טקסט וקריאוּת.</li>
            <li>איפוס כל ההגדרות לברירת המחדל.</li>
          </ul>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">חלקים שאינם נגישים מלא</h2>
          <p className="text-text-dark/85 leading-relaxed">
            למרות מאמצינו, ייתכנו דפים או רכיבים בודדים שטרם הותאמו במלואם, בעיקר בתכנים מצולמים
            (סרטונים מהרשתות החברתיות) ובמפת Google המוטמעת. אנו פועלות באופן שוטף לשיפור הנגישות.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-dark">פנייה ב-נושאי נגישות</h2>
          <p className="text-text-dark/85 leading-relaxed">
            אם נתקלתם בקושי בנגישות, או יש לכם הצעות לשיפור - אנו נשמח לקבל פנייה.
          </p>
          <ul className="list-none pr-0 space-y-1 text-text-dark/85">
            <li>אימייל לרכזת הנגישות: <ContactEmail /></li>
            <li>טופס יצירת קשר באתר.</li>
            <li>זמן תגובה: עד 5 ימי עסקים.</li>
          </ul>
        </section>
      </article>
    </div>
  )
}
