'use client'

import { CONTACT_INFO } from '@/lib/constants'
import { trackWhatsAppClick } from '@/lib/tracking'
import { isAuthorizedRedirect } from '@/lib/url-validation'

interface Props {
  phone?: string
  message?: string
  source: string
  label?: string
  variant?: 'primary' | 'outline'
  className?: string
}

export default function WhatsAppButton({
  phone = CONTACT_INFO.whatsapp,
  message,
  source,
  label = 'WhatsApp',
  variant = 'primary',
  className,
}: Props) {
  const url = `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`
  const safeUrl = isAuthorizedRedirect(url) ? url : `https://wa.me/${phone}`

  const base = 'inline-flex items-center justify-center gap-2 rounded-2xl h-10 px-4 text-sm font-medium transition-colors'
  const variantClass =
    variant === 'primary'
      ? 'bg-[#25D366] text-white hover:opacity-90'
      : 'border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10'

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick(source)}
      className={[base, variantClass, className || ''].join(' ')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden
      >
        <path d="M20.52 3.48A11.88 11.88 0 0 0 12 0C5.37 0 0 5.37 0 12a11.93 11.93 0 0 0 1.64 6L0 24l6.18-1.62A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52ZM12 22a10 10 0 0 1-5.1-1.4l-.36-.21-3.67.96.98-3.57-.24-.37A10 10 0 1 1 22 12c0 5.52-4.48 10-10 10Zm5.47-7.39c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15s-.78.98-.96 1.18c-.18.2-.36.22-.66.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.36.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.68-1.65-.93-2.26-.25-.6-.5-.52-.68-.53l-.58-.01a1.1 1.1 0 0 0-.8.37c-.27.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.12 3.24 5.13 4.55 3.01 1.31 3.01.87 3.55.82.55-.05 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.42-.07-.13-.27-.2-.57-.35Z" />
      </svg>
      {label}
    </a>
  )
}
