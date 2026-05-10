import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'מדיניות פרטיות — תמתגילי',
  description: 'מדיניות הפרטיות של אתר תמתגילי - איסוף מידע, שימוש בעוגיות, זכויות הגולש.',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl p-6 md:p-10 border-2 border-primary-soft shadow-sm prose-rtl">
        <h1 className="text-3xl md:text-4xl font-bold text-text-dark mb-2">מדיניות פרטיות</h1>
        <p className="text-text-dark/60 mb-8">עדכון אחרון: 06/05/2026</p>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">1. כללי</h2>
          <p className="text-text-dark/85 leading-relaxed">
            תמתגילי (להלן: &quot;החברה&quot;, &quot;אנחנו&quot;) מכבדת את פרטיותכם. מסמך זה מתאר את האופן שבו אנו אוספים,
            משתמשים ומגנים על המידע האישי שלכם בעת השימוש באתר tematgili.co.il. השימוש באתר מהווה
            הסכמה למדיניות זו, ומיישם את הוראות חוק הגנת הפרטיות, התשמ״א-1981 ותיקון 13 לחוק (תיקון
            2024).
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">2. איסוף מידע</h2>
          <p className="text-text-dark/85 leading-relaxed">אנו אוספים מידע כדלקמן:</p>
          <ul className="list-disc pr-6 space-y-1 text-text-dark/85">
            <li>מידע שאתם מוסרים ביוזמתכם - שם, טלפון, אימייל, פרטי האירוע, הודעות.</li>
            <li>מידע טכני - כתובת IP, סוג דפדפן, מערכת הפעלה, דפים שנצפו ומשך הצפייה.</li>
            <li>מזהי קמפיין - gclid, fbclid וזיהויי מקור אחרים לצורכי שיוך לידים.</li>
          </ul>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">3. שימוש במידע</h2>
          <p className="text-text-dark/85 leading-relaxed">המידע משמש אותנו לצרכים הבאים:</p>
          <ul className="list-disc pr-6 space-y-1 text-text-dark/85">
            <li>מענה לפניות, ניהול לידים והפקת הצעות מחיר.</li>
            <li>שיפור חוויית המשתמש באתר וניתוח התנהגות גולשים אנונימי.</li>
            <li>שיווק ישיר (רק בהסכמתכם המפורשת) - דיוור, מבצעים והטבות.</li>
            <li>עמידה בדרישות חוקיות.</li>
          </ul>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">4. עוגיות (Cookies)</h2>
          <p className="text-text-dark/85 leading-relaxed">
            האתר משתמש בעוגיות הכרחיות לתפעולו ובעוגיות אנליטיקה (Google Analytics, Meta Pixel)
            לצורך מדידת ביצועים ופרסום. ניתן לחסום עוגיות בהגדרות הדפדפן, אך הדבר עלול לפגום בחוויית
            השימוש. ב-בנר העוגיות בכניסה לאתר ניתן לאשר/לדחות עוגיות לא הכרחיות.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">5. צד שלישי</h2>
          <p className="text-text-dark/85 leading-relaxed">
            אנו עובדים עם ספקי שירות חיצוניים: Firebase (Google) לאחסון נתונים, Resend לשליחת מיילים,
            Google Analytics ו-Meta Pixel למדידה ופרסום, וחברות שליחויות לצורך משלוח. כל הספקים
            מחויבים לתקני אבטחת מידע. לא נמכור או נשכיר את המידע שלכם לגורם חיצוני לצרכים שיווקיים.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">6. אבטחה</h2>
          <p className="text-text-dark/85 leading-relaxed">
            אנו נוקטים באמצעי אבטחה מקובלים: הצפנת תעבורה (HTTPS/TLS), ניהול הרשאות, הצפנת מסדי
            נתונים, הגבלת קצב בקשות (rate limiting) וגיבויים. עם זאת, אין מערכת מאובטחת ב-100% ואיננו
            יכולים להבטיח חסינות מוחלטת.
          </p>
        </section>

        <section className="space-y-3 mb-8">
          <h2 className="text-xl font-bold text-text-dark">7. זכויות הגולש</h2>
          <p className="text-text-dark/85 leading-relaxed">בהתאם לחוק הגנת הפרטיות, יש לכם הזכויות הבאות:</p>
          <ul className="list-disc pr-6 space-y-1 text-text-dark/85">
            <li>לעיין במידע שנאסף עליכם.</li>
            <li>לדרוש תיקון של מידע שגוי.</li>
            <li>לדרוש מחיקת מידע (זכות ה&quot;להישכח&quot;).</li>
            <li>להסיר עצמכם מרשימות דיוור בכל עת.</li>
          </ul>
          <p className="text-text-dark/85 leading-relaxed">
            למימוש הזכויות יש לפנות אלינו במייל info@tematgili.co.il - נטפל בבקשתכם תוך 30 יום.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-text-dark">8. יצירת קשר</h2>
          <p className="text-text-dark/85 leading-relaxed">
            לשאלות בנושאי פרטיות:
            <br />
            אימייל: info@tematgili.co.il
            <br />
            דרך טופס יצירת הקשר באתר.
          </p>
        </section>
      </article>
    </div>
  )
}
