'use client'

import ProtectedRoute from '@/components/admin/ProtectedRoute'
import CategoriesTab from '@/components/admin/home-tabs/CategoriesTab'

export default function AdminCategoriesPage() {
  return (
    <ProtectedRoute>
      <CategoriesTab />
    </ProtectedRoute>
  )
}
