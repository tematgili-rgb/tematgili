'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
  adminMode?: boolean
  onToggleActive?: (p: Product) => void
  onEdit?: (p: Product) => void
  onDelete?: (p: Product) => void
}

export default function ProductCard({
  product,
  adminMode,
  onToggleActive,
  onEdit,
  onDelete,
}: Props) {
  const price = product.pricePerUnit ?? product.startingPrice

  const stop = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group bg-white rounded-2xl border-2 border-primary-soft hover:border-primary transition-all overflow-hidden flex flex-col shadow-sm hover:shadow-lg ${
        adminMode && !product.isActive ? 'opacity-60' : ''
      }`}
    >
      <div className="relative aspect-square bg-primary-soft overflow-hidden">
        {product.mainImageUrl ? (
          <Image
            src={product.mainImageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary text-5xl">
            🎁
          </div>
        )}

        {adminMode && (
          <div
            className="absolute top-2 left-2 flex gap-1 z-10"
            style={{ pointerEvents: 'auto' }}
          >
            <button
              type="button"
              aria-label={product.isActive ? 'הסתר מוצר' : 'הצג מוצר'}
              onClick={(e) => { stop(e); onToggleActive?.(product) }}
              className="bg-white/90 hover:bg-white text-text-dark rounded-full p-1.5 shadow border border-primary-soft"
            >
              {product.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              type="button"
              aria-label="ערוך מוצר"
              onClick={(e) => { stop(e); onEdit?.(product) }}
              className="bg-white/90 hover:bg-white text-text-dark rounded-full p-1.5 shadow border border-primary-soft"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="מחק מוצר"
              onClick={(e) => { stop(e); onDelete?.(product) }}
              className="bg-white/90 hover:bg-accent hover:text-white text-accent rounded-full p-1.5 shadow border border-accent"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-text-dark text-base leading-tight group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <div className="mt-auto pt-2">
          <span className="text-base font-bold text-accent">
            {product.pricePerUnit ? `₪${price} ליח׳` : `החל מ-₪${price}`}
          </span>
        </div>
      </div>
    </Link>
  )
}
