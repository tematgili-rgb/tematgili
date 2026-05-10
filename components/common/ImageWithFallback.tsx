'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { ImageIcon } from 'lucide-react'

interface Props extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  className,
  ...rest
}: Props) {
  const [errored, setErrored] = useState(false)

  if (errored && !fallbackSrc) {
    return (
      <div
        className={['flex items-center justify-center bg-gray-100 text-gray-400', className || ''].join(' ')}
        style={{ width: rest.width, height: rest.height }}
        aria-label={typeof alt === 'string' ? alt : ''}
      >
        <ImageIcon className="h-8 w-8" />
      </div>
    )
  }

  return (
    <Image
      {...rest}
      src={errored && fallbackSrc ? fallbackSrc : src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
    />
  )
}
