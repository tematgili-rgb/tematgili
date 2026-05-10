'use client'

import ProtectedRoute from '@/components/admin/ProtectedRoute'
import PackageForm from '@/components/admin/PackageForm'

export default function NewPackagePage() {
  return (
    <ProtectedRoute>
      <div dir="rtl">
        <h2 className="text-2xl font-bold text-text-dark mb-6">חבילה חדשה</h2>
        <PackageForm />
      </div>
    </ProtectedRoute>
  )
}
