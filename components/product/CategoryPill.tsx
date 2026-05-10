import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { ProductCategoryId } from '@/lib/types'

interface Props {
  category: ProductCategoryId
  className?: string
}

export default function CategoryPill({ category, className }: Props) {
  const cat = PRODUCT_CATEGORIES.find((c) => c.id === category)
  if (!cat) return null
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-2xl border-2 px-3 py-1 text-xs font-semibold',
        cat.color,
        className || '',
      ].join(' ')}
    >
      <span aria-hidden>{cat.icon}</span>
      <span>{cat.name}</span>
    </span>
  )
}
