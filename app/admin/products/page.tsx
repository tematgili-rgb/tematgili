'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Loader2,
  Package as PackageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import { getAllDocuments, updateDocument, deleteDocument } from '@/lib/db'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { Product } from '@/lib/types'

function categoryName(id: string): string {
  return PRODUCT_CATEGORIES.find((c) => c.id === id)?.name ?? id
}

export default function AdminProductsPage() {
  return (
    <ProtectedRoute>
      <Products />
    </ProtectedRoute>
  )
}

function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAllDocuments<Product>('products')
      setProducts(data.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (p: Product) => {
    try {
      await updateDocument<Product>('products', p.id, { isActive: !p.isActive })
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, isActive: !p.isActive } : x))
      )
    } catch (e) {
      console.error(e)
    }
  }

  const toggleFeatured = async (p: Product) => {
    try {
      await updateDocument<Product>('products', p.id, { isFeatured: !p.isFeatured })
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, isFeatured: !p.isFeatured } : x))
      )
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (p: Product) => {
    if (!confirm(`למחוק את "${p.name}"?`)) return
    try {
      await deleteDocument('products', p.id)
      setProducts((prev) => prev.filter((x) => x.id !== p.id))
    } catch (e) {
      console.error(e)
      alert('שגיאה במחיקה')
    }
  }

  return (
    <div dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-dark mb-1">ניהול מוצרים</h2>
          <p className="text-gray-600">
            {products.length > 0 && `${products.length} מוצרים`}
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4 ml-1" /> מוצר חדש
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
          <PackageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-700 mb-4">אין מוצרים עדיין</p>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="w-4 h-4 ml-1" /> הוסף מוצר ראשון
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${
                p.isActive ? 'border-transparent' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="aspect-square bg-primary-soft/30 relative">
                {p.mainImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.mainImageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <PackageIcon className="w-12 h-12" />
                  </div>
                )}
                {p.isFeatured && (
                  <span className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> מומלץ
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-text-dark truncate">{p.name}</h3>
                <p className="text-xs text-gray-500">{categoryName(p.category)}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-accent">₪{p.startingPrice}</span>
                  <span className="text-gray-500">מינ' {p.minQuantity}</span>
                </div>
                <div className="flex gap-1 pt-2 border-t border-primary-soft">
                  <Button
                    size="icon"
                    variant="outline"
                    className="flex-1"
                    onClick={() => toggleActive(p)}
                    title={p.isActive ? 'הסתר' : 'הצג'}
                  >
                    {p.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className={`flex-1 ${p.isFeatured ? 'bg-cream' : ''}`}
                    onClick={() => toggleFeatured(p)}
                    title={p.isFeatured ? 'בטל מומלץ' : 'סמן כמומלץ'}
                  >
                    <Star className={`w-4 h-4 ${p.isFeatured ? 'fill-current text-twine' : ''}`} />
                  </Button>
                  <Link href={`/admin/products/${p.id}`} className="flex-1">
                    <Button size="icon" variant="outline" className="w-full">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="outline"
                    className="flex-1 border-accent text-accent hover:bg-accent hover:text-white"
                    onClick={() => handleDelete(p)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
