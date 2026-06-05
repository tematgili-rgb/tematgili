'use client'

import Image from 'next/image'
import { useSiteLogo } from '@/hooks/useSiteLogo'

interface Props {
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

export default function LogoImage({ alt, width, height, className, priority }: Props) {
  const src = useSiteLogo()
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  )
}
