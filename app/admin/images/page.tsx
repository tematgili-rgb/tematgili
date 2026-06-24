'use client'

import ProtectedRoute from '@/components/admin/ProtectedRoute'
import ImagesTab from '@/components/admin/home-tabs/ImagesTab'

export default function AdminImagesPage() {
  return (
    <ProtectedRoute>
      <ImagesTab />
    </ProtectedRoute>
  )
}
