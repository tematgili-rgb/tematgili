import { escapeHtml } from './utils'
import { CONTACT_INFO } from '@/lib/constants'

export function leadConfirmationEmail(name: string): { subject: string; html: string; text: string } {
  const safeName = escapeHtml(name)
  const subject = 'קיבלנו את פנייתכם - תמתגילי 💕'

  const html = `<!doctype html>
<html lang="he" dir="rtl">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
  <body style="margin:0;padding:0;background:#FFFAF7;font-family:'Heebo',Arial,sans-serif;direction:rtl;text-align:right;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#F4A8B8;border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:28px;">תודה רבה! 💕</h1>
      </div>
      <div style="background:#fff;border:2px solid #FBD9DF;border-top:0;border-radius:0 0 16px 16px;padding:32px 24px;">
        <p style="margin:0 0 16px 0;color:#1F1F2E;font-size:18px;">שלום ${safeName},</p>
        <p style="margin:0 0 16px 0;color:#1F1F2E;line-height:1.7;">קיבלנו את פנייתכם! נחזור אליכם תוך 24 שעות (בדרך כלל הרבה יותר מהר 😊).</p>
        <p style="margin:0 0 24px 0;color:#1F1F2E;line-height:1.7;">בינתיים אפשר לעקוב אחרינו באינסטגרם לראות עוד עיצובים מקסימים שיצרנו ללקוחות שלנו.</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${CONTACT_INFO.instagram}" style="display:inline-block;background:#F4A8B8;color:#fff;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:700;">עקבו אחרינו באינסטגרם 📸</a>
        </div>
        <p style="margin:24px 0 0 0;color:#1F1F2E;">באהבה,<br/>צוות תמתגילי</p>
        <p style="margin:24px 0 0 0;font-size:12px;color:#888;text-align:center;">אם לא ביקשתם זאת, אפשר להתעלם מהמייל.</p>
      </div>
    </div>
  </body>
</html>`

  const text = `שלום ${name},

קיבלנו את פנייתכם! נחזור אליכם תוך 24 שעות.
בינתיים אפשר לעקוב אחרינו באינסטגרם: ${CONTACT_INFO.instagram}

באהבה,
צוות תמתגילי`

  return { subject, html, text }
}
