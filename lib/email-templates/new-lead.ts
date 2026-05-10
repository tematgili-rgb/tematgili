import { escapeHtml } from './utils'

interface LeadInput {
  name: string
  phone: string
  email?: string
  message?: string
  source?: string
  productInterest?: string
  eventType?: string
}

export function newLeadEmail(lead: LeadInput): { subject: string; html: string; text: string } {
  const name = escapeHtml(lead.name)
  const phone = escapeHtml(lead.phone)
  const email = lead.email ? escapeHtml(lead.email) : ''
  const message = lead.message ? escapeHtml(lead.message) : ''
  const source = lead.source ? escapeHtml(lead.source) : ''
  const productInterest = lead.productInterest ? escapeHtml(lead.productInterest) : ''
  const eventType = lead.eventType ? escapeHtml(lead.eventType) : ''

  const subject = `ליד חדש מתמתגילי - ${lead.name}`

  const row = (label: string, value: string) =>
    value
      ? `<tr><td style="padding:10px 14px;border-bottom:1px solid #FBD9DF;font-weight:700;color:#1F1F2E;width:140px;background:#FFFAF7;">${label}</td><td style="padding:10px 14px;border-bottom:1px solid #FBD9DF;color:#1F1F2E;">${value}</td></tr>`
      : ''

  const html = `<!doctype html>
<html lang="he" dir="rtl">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
  <body style="margin:0;padding:0;background:#FFFAF7;font-family:'Heebo',Arial,sans-serif;direction:rtl;text-align:right;">
    <div style="max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:#F4A8B8;border-radius:16px 16px 0 0;padding:24px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:24px;">💌 ליד חדש</h1>
        <p style="margin:6px 0 0 0;color:#fff;opacity:.95;">תמתגילי - מערכת לידים</p>
      </div>
      <div style="background:#fff;border:2px solid #FBD9DF;border-top:0;border-radius:0 0 16px 16px;padding:24px;">
        <p style="margin:0 0 16px 0;color:#1F1F2E;">התקבלה פנייה חדשה מהאתר. פרטי הפנייה:</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #FBD9DF;border-radius:8px;overflow:hidden;">
          ${row('שם', name)}
          ${row('טלפון', `<a href="tel:${phone}" style="color:#DC4848;text-decoration:none;">${phone}</a>`)}
          ${row('אימייל', email ? `<a href="mailto:${email}" style="color:#DC4848;text-decoration:none;">${email}</a>` : '')}
          ${row('סוג אירוע', eventType)}
          ${row('מוצר/קטגוריה', productInterest)}
          ${row('מקור', source)}
          ${row('הודעה', message ? `<div style="white-space:pre-wrap;">${message}</div>` : '')}
        </table>
        <div style="margin-top:24px;text-align:center;">
          <a href="https://wa.me/972${phone.replace(/^0/, '')}" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;">פתח ב-WhatsApp</a>
        </div>
        <p style="margin:24px 0 0 0;font-size:12px;color:#888;text-align:center;">מייל זה נשלח אוטומטית ממערכת תמתגילי</p>
      </div>
    </div>
  </body>
</html>`

  const text = [
    'ליד חדש מתמתגילי',
    '',
    `שם: ${lead.name}`,
    `טלפון: ${lead.phone}`,
    lead.email ? `אימייל: ${lead.email}` : '',
    lead.eventType ? `סוג אירוע: ${lead.eventType}` : '',
    lead.productInterest ? `מוצר/קטגוריה: ${lead.productInterest}` : '',
    lead.source ? `מקור: ${lead.source}` : '',
    lead.message ? `הודעה: ${lead.message}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return { subject, html, text }
}
