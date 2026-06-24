'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, EyeOff, Gift, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAllDocuments, updateDocument, deleteDocument } from '@/lib/db'
import { EVENT_TYPES } from '@/lib/constants'
import type { Package } from '@/lib/types'

function eventName(id?: string): string {
  if (!id) return ''
  return EVENT_TYPES.find((e) => e.id === id)?.name ?? id
}

export default function PackagesTab() {
  const [items, setItems] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllDocuments<Package>('packages')
      .then((data) => setItems(data.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggleActive = async (p: Package) => {
    try {
      await updateDocument<Package>('packages', p.id, { isActive: !p.isActive })
      setItems((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, isActive: !p.isActive } : x))
      )
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (p: Package) => {
    if (!confirm(`למחוק את "${p.name}"?`)) return
    try {
      await deleteDocument('packages', p.id)
      setItems((prev) => prev.filter((x) => x.id !== p.id))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-text-dark mb-1">ניהול חבילות</h2>
          <p className="text-gray-600">
            {items.length} חבילות סה״כ · {items.filter((p) => p.isActive).length} פעילות
          </p>
        </div>
        <Link href="/admin/packages/new">
          <Button>
            <Plus className="w-4 h-4 ml-1" /> חבילה חדשה
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
          <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-700 mb-4">אין חבילות עדיין</p>
          <Link href="/admin/packages/new">
            <Button>
              <Plus className="w-4 h-4 ml-1" /> הוסף חבילה ראשונה
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                p.isActive ? '' : 'opacity-60'
              }`}
            >
              <div className="aspect-video bg-primary-soft/30">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Gift className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-text-dark">{p.name}</h3>
                <p className="text-xs text-gray-500">{eventName(p.eventType)}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between text-sm pt-2">
                  <span className="font-bold text-accent">החל מ-₪{p.startingPrice}</span>
                  <span className="text-gray-500">{p.includedProducts?.length ?? 0} מוצרים</span>
                </div>
                <div className="flex gap-1 pt-2 border-t border-primary-soft">
                  <Button
                    size="icon"
                    variant="outline"
                    className="flex-1"
                    onClick={() => toggleActive(p)}
                  >
                    {p.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Link href={`/admin/packages/${p.id}`} className="flex-1">
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
