'use client'

import ProtectedRoute from '@/components/admin/ProtectedRoute'
import PackagesTab from '@/components/admin/home-tabs/PackagesTab'

export default function AdminPackagesPage() {
  return (
    <ProtectedRoute>
      <PackagesTab />
    </ProtectedRoute>
  )
}
