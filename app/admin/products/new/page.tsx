'use client'

import ProtectedRoute from '@/components/admin/ProtectedRoute'
import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <ProtectedRoute>
      <div dir="rtl">
        <h2 className="text-2xl font-bold text-text-dark mb-6">מוצר חדש</h2>
        <ProductForm />
      </div>
    </ProtectedRoute>
  )
}
