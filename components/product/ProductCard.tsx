import Link from 'next/link'
import Image from 'next/image'
import CategoryPill from './CategoryPill'
import type { Product } from '@/lib/types'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-2xl border-2 border-primary-soft hover:border-primary transition-all overflow-hidden flex flex-col shadow-sm hover:shadow-lg"
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
        <div className="absolute top-3 right-3">
          <CategoryPill category={product.category} />
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-text-dark text-lg leading-tight group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        {product.shortDescription && (
          <p className="text-sm text-text-dark/70 line-clamp-2">
            {product.shortDescription}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-primary-soft">
          <span className="text-base font-bold text-accent">
            החל מ-₪{product.startingPrice}
          </span>
          {product.minQuantity > 0 && (
            <span className="text-xs text-text-dark/60">
              מינ׳ {product.minQuantity} יח׳
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
