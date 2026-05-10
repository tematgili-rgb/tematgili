'use client'

import { Phone } from 'lucide-react'
import { CONTACT_INFO } from '@/lib/constants'
import { trackPhoneClick } from '@/lib/tracking'

interface Props {
  phone?: string
  label?: string
  className?: string
  source?: string
}

export default function PhoneButton({
  phone = CONTACT_INFO.phone,
  label = 'התקשרו',
  className,
  source = 'phone_button',
}: Props) {
  return (
    <a
      href={`tel:${phone}`}
      onClick={() => trackPhoneClick(source)}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-2xl h-10 px-4 text-sm font-medium border-2 border-primary text-primary hover:bg-primary-soft transition-colors',
        className || '',
      ].join(' ')}
    >
      <Phone className="h-4 w-4" />
      {label}
    </a>
  )
}
