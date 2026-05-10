import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface Props {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      ...(item.href ? { item: item.href } : {}),
    })),
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex items-center gap-2 flex-wrap text-text-dark/70">
        {items.map((item, idx) => {
          const last = idx === items.length - 1
          return (
            <li key={idx} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-accent">
                  {item.label}
                </Link>
              ) : (
                <span className={last ? 'text-text-dark font-medium' : ''}>
                  {item.label}
                </span>
              )}
              {!last && <ChevronLeft className="h-4 w-4 opacity-50" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
