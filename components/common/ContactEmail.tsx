'use client'

import { useResolvedSettings } from '@/hooks/useResolvedSettings'

interface Props {
  asLink?: boolean
  className?: string
}

export default function ContactEmail({ asLink = true, className }: Props) {
  const { email } = useResolvedSettings()
  if (asLink) {
    return (
      <a href={`mailto:${email}`} className={className ?? 'text-accent hover:underline'}>
        {email}
      </a>
    )
  }
  return <span className={className}>{email}</span>
}
