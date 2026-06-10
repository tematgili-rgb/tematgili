'use client'

import WhatsAppButton from '@/components/common/WhatsAppButton'
import PhoneButton from '@/components/common/PhoneButton'
import { useResolvedSettings } from '@/hooks/useResolvedSettings'

export default function ContactDetails() {
  const settings = useResolvedSettings()

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-primary-soft shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-text-dark">פרטי התקשרות</h2>
      <ul className="space-y-3 text-text-dark">
        <li>
          <span className="font-semibold ml-2">טלפון:</span>
          <a href={`tel:${settings.phone}`} className="text-accent hover:underline">
            {settings.phone}
          </a>
        </li>
        <li>
          <span className="font-semibold ml-2">WhatsApp:</span>
          <span dir="ltr">+{settings.whatsapp}</span>
        </li>
        <li>
          <span className="font-semibold ml-2">אימייל:</span>
          <a href={`mailto:${settings.email}`} className="text-accent hover:underline">
            {settings.email}
          </a>
        </li>
        <li>
          <span className="font-semibold ml-2">שעות פעילות:</span>
          {settings.workingHours}
        </li>
      </ul>
      <div className="flex gap-3 mt-5 flex-wrap">
        <WhatsAppButton source="contact_page" message="היי, הגעתי מהאתר 💕" />
        <PhoneButton />
      </div>
    </div>
  )
}
