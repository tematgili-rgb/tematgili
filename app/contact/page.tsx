import type { Metadata } from 'next'
import LeadFormInline from '@/components/forms/LeadFormInline'
import WhatsAppButton from '@/components/common/WhatsAppButton'
import PhoneButton from '@/components/common/PhoneButton'
import { CONTACT_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'צור קשר — תמתגילי',
  description: 'יצירת קשר עם תמתגילי - מוצרי מיתוג מודפסים בהתאמה אישית לאירועים ומתנות.',
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-bold font-display text-text-dark mb-3">צור קשר</h1>
        <p className="text-text-dark/70 max-w-2xl mx-auto">
          נשמח לשמוע מכם! מלאו את הטופס או דברו איתנו ישירות בוואטסאפ.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-primary-soft shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-text-dark">השאירו פרטים</h2>
          <LeadFormInline source="contact_page" />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-primary-soft shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-text-dark">פרטי התקשרות</h2>
            <ul className="space-y-3 text-text-dark">
              <li>
                <span className="font-semibold ml-2">טלפון:</span>
                <a href={`tel:${CONTACT_INFO.phone}`} className="text-accent hover:underline">
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li>
                <span className="font-semibold ml-2">WhatsApp:</span>
                <span dir="ltr">+{CONTACT_INFO.whatsapp}</span>
              </li>
              <li>
                <span className="font-semibold ml-2">אימייל:</span>
                <a href={`mailto:${CONTACT_INFO.email}`} className="text-accent hover:underline">
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li>
                <span className="font-semibold ml-2">שעות פעילות:</span>
                {CONTACT_INFO.workingHours}
              </li>
            </ul>
            <div className="flex gap-3 mt-5 flex-wrap">
              <WhatsAppButton source="contact_page" message="היי, הגעתי מהאתר 💕" />
              <PhoneButton />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-2 border-2 border-primary-soft shadow-sm overflow-hidden">
            <iframe
              src="https://www.google.com/maps?q=Israel&output=embed"
              width="100%"
              height="280"
              loading="lazy"
              className="rounded-xl block"
              title="מפה - תמתגילי"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  )
}
