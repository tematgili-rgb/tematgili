'use client'

import { useEffect, useState } from 'react'
import { Heart, Share2, Copy, Check } from 'lucide-react'
import { trackWhatsAppClick } from '@/lib/tracking'

interface Props {
  productName: string
  productSlug: string
  productUrl: string
  productImageUrl?: string
}

const FAVORITES_KEY = 'favorites'

function readFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : []
  } catch {
    return []
  }
}

export default function ProductShareButtons({
  productName,
  productSlug,
  productUrl,
}: Props) {
  const [isFav, setIsFav] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setIsFav(readFavorites().includes(productSlug))
  }, [productSlug])

  const toggleFav = () => {
    const list = readFavorites()
    const next = list.includes(productSlug)
      ? list.filter((s) => s !== productSlug)
      : [...list, productSlug]
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
    setIsFav(next.includes(productSlug))
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const waText = `תראי את המוצר הזה: ${productName} ${productUrl}`
  const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`

  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick('product_share')}
        className="inline-flex items-center gap-2 rounded-2xl h-10 px-4 text-sm font-medium border-2 border-primary-soft text-text-dark hover:border-primary hover:bg-primary-soft transition-colors"
      >
        <Share2 className="h-4 w-4" />
        שתפו ב-WhatsApp
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-2xl h-10 px-4 text-sm font-medium border-2 border-primary-soft text-text-dark hover:border-primary hover:bg-primary-soft transition-colors"
      >
        {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
        {copied ? 'הקישור הועתק' : 'העתיקו קישור'}
      </button>
      <button
        type="button"
        onClick={toggleFav}
        aria-pressed={isFav}
        className={`inline-flex items-center gap-2 rounded-2xl h-10 px-4 text-sm font-medium border-2 transition-colors ${
          isFav
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-primary-soft text-text-dark hover:border-primary hover:bg-primary-soft'
        }`}
      >
        <Heart className={`h-4 w-4 ${isFav ? 'fill-accent' : ''}`} />
        {isFav ? 'נשמר במועדפים' : 'שמרו למועדפים'}
      </button>
    </div>
  )
}
