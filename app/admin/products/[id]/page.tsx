'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import ProductForm from '@/components/admin/ProductForm'
import { getDocument } from '@/lib/db'
import type { Product } from '@/lib/types'

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <Editor id={params.id} />
    </ProtectedRoute>
  )
}

function Editor({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getDocument<Product>('products', id)
      .then((p) => {
        if (!p) setNotFound(true)
        else setProduct(p)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="text-center py-20" dir="rtl">
        <p className="text-lg text-gray-700">המוצר לא נמצא</p>
      </div>
    )
  }

  return (
    <div dir="rtl">
      <h2 className="text-2xl font-bold text-text-dark mb-6">עריכת מוצר: {product.name}</h2>
      <ProductForm initial={product} productId={id} />
    </div>
  )
}
