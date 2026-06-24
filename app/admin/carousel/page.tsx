'use client'

import ProtectedRoute from '@/components/admin/ProtectedRoute'
import CarouselTab from '@/components/admin/home-tabs/CarouselTab'

export default function AdminCarouselPage() {
  return (
    <ProtectedRoute>
      <CarouselTab />
    </ProtectedRoute>
  )
}
