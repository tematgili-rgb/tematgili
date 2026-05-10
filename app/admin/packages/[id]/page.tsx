'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import PackageForm from '@/components/admin/PackageForm'
import { getDocument } from '@/lib/db'
import type { Package } from '@/lib/types'

export default function EditPackagePage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <Editor id={params.id} />
    </ProtectedRoute>
  )
}

function Editor({ id }: { id: string }) {
  const [item, setItem] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getDocument<Package>('packages', id)
      .then((p) => {
        if (!p) setNotFound(true)
        else setItem(p)
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
  if (notFound || !item) {
    return (
      <div className="text-center py-20" dir="rtl">
        <p className="text-lg text-gray-700">החבילה לא נמצאה</p>
      </div>
    )
  }

  return (
    <div dir="rtl">
      <h2 className="text-2xl font-bold text-text-dark mb-6">עריכת חבילה: {item.name}</h2>
      <PackageForm initial={item} packageId={id} />
    </div>
  )
}
