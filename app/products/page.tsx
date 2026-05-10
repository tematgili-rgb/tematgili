'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Breadcrumbs from '@/components/common/Breadcrumbs'
import ProductCard from '@/components/product/ProductCard'
import ProductFiltersBar from '@/components/product/ProductFiltersBar'
import LeadFormInline from '@/components/forms/LeadFormInline'
import { PRODUCT_CATEGORIES, EVENT_TYPES } from '@/lib/constants'
import { getActiveProducts } from '@/lib/db'
import type { Product, ProductCategoryId } from '@/lib/types'

function ProductsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category') || undefined
  const selectedEvent = searchParams.get('event') || undefined

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    getActiveProducts()
      .then((list) => {
        if (active) setProducts(list)
      })
      .catch(() => {
        if (active) setProducts([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory && p.category !== (selectedCategory as ProductCategoryId)) return false
      if (selectedEvent && !(p.occasions || []).includes(selectedEvent)) return false
      return true
    })
  }, [products, selectedCategory, selectedEvent])

  const updateParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    const qs = params.toString()
    router.replace(qs ? `/products?${qs}` : '/products', { scroll: false })
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'בית', href: '/' }, { label: 'המוצרים שלנו' }]} />
      </div>

      <section className="container mx-auto px-4 pb-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black font-display text-text-dark">המוצרים שלנו</h1>
          <p className="text-text-dark/70 mt-3 text-lg">
            מודפס בהתאמה אישית, עם השם והעיצוב שלכם
          </p>
        </div>

        <div className="mb-8">
          <ProductFiltersBar
            categories={PRODUCT_CATEGORIES.map((c) => ({ id: c.id, name: c.name, icon: c.icon }))}
            events={EVENT_TYPES.map((e) => ({ id: e.id, name: e.name, emoji: e.emoji }))}
            selectedCategory={selectedCategory}
            selectedEvent={selectedEvent}
            onCategoryChange={(v) => updateParam('category', v)}
            onEventChange={(v) => updateParam('event', v)}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-primary-soft/50 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-primary-soft">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-text-dark">לא מצאנו מוצרים בקטגוריה הזו</h3>
            <p className="text-text-dark/70 mt-2">
              נסו לשנות את הסינון או צרו איתנו קשר ונכין לכם פתרון מותאם
            </p>
          </div>
        )}
      </section>

      <section className="bg-primary-soft py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl p-6 md:p-10 border-2 border-white shadow-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-text-dark">
                לא מצאתם מה שחיפשתם?
              </h2>
              <p className="text-text-dark/70 mt-2">השאירו פרטים ונחזור אליכם עם הצעה מותאמת</p>
            </div>
            <LeadFormInline source="catalog_bottom" />
          </div>
        </div>
      </section>
    </>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 text-center text-text-dark/60">
        טוען מוצרים…
      </div>
    }>
      <ProductsPageInner />
    </Suspense>
  )
}
