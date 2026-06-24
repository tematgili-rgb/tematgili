'use client'

import ProtectedRoute from '@/components/admin/ProtectedRoute'
import EventTypesTab from '@/components/admin/home-tabs/EventTypesTab'

export default function AdminEventTypesPage() {
  return (
    <ProtectedRoute>
      <EventTypesTab />
    </ProtectedRoute>
  )
}
