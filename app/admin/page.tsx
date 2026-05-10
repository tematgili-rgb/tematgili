'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Package as PackageIcon,
  Star,
  TrendingUp,
  Plus,
  Phone,
  Mail,
  Calendar,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import { getAllLeads, getActiveProducts, getApprovedReviews } from '@/lib/db'
import type { Lead, Product, Review } from '@/lib/types'

function toDate(t: any): Date | null {
  if (!t) return null
  if (t.toDate) return t.toDate()
  if (t instanceof Date) return t
  return null
}

function isWithinDays(date: Date | null, days: number): boolean {
  if (!date) return false
  const ms = days * 24 * 60 * 60 * 1000
  return Date.now() - date.getTime() <= ms
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}

function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const safe = async <T,>(fn: () => Promise<T[]>): Promise<T[]> => {
      try {
        return await fn()
      } catch (e) {
        console.error(e)
        return []
      }
    }
    Promise.all([safe(getAllLeads), safe(getActiveProducts), safe(getApprovedReviews)])
      .then(([l, p, r]) => {
        setLeads(l)
        setProducts(p)
        setReviews(r)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const leadsThisWeek = leads.filter((l) => isWithinDays(toDate(l.createdAt), 7)).length
  const wonDeals = leads.filter((l) => l.status === 'closed_deal').length
  const conversion = leads.length > 0 ? Math.round((wonDeals / leads.length) * 100) : 0

  const sources = leads.reduce<Record<string, number>>((acc, l) => {
    const src = l.source || 'unknown'
    acc[src] = (acc[src] || 0) + 1
    return acc
  }, {})
  const topSource =
    Object.entries(sources).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  const recent = [...leads]
    .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0))
    .slice(0, 5)

  const stats = [
    {
      label: 'לידים השבוע',
      value: leadsThisWeek,
      icon: Users,
      bg: 'bg-primary-soft',
      iconColor: 'text-accent',
    },
    {
      label: 'סה"כ לידים',
      value: leads.length,
      icon: TrendingUp,
      bg: 'bg-cream',
      iconColor: 'text-twine',
    },
    {
      label: 'מוצרים פעילים',
      value: products.length,
      icon: PackageIcon,
      bg: 'bg-primary-soft',
      iconColor: 'text-primary',
    },
    {
      label: 'ביקורות מאושרות',
      value: reviews.length,
      icon: Star,
      bg: 'bg-cream',
      iconColor: 'text-accent',
    },
  ]

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-dark mb-1">דשבורד</h2>
        <p className="text-gray-600">סקירה כללית של המערכת</p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/leads">
          <Button variant="default">
            <Plus className="w-4 h-4 ml-1" /> ליד חדש
          </Button>
        </Link>
        <Link href="/admin/products/new">
          <Button variant="outline">
            <Plus className="w-4 h-4 ml-1" /> מוצר חדש
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className={`${s.bg} p-3 rounded-2xl`}>
                    <Icon className={`w-6 h-6 ${s.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{s.label}</p>
                    <p className="text-2xl font-bold text-text-dark">{s.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">אחוז המרה (עסקאות סגורות)</p>
            <p className="text-3xl font-bold text-text-dark">{conversion}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {wonDeals} עסקאות סגורות מתוך {leads.length} לידים
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">מקור מוביל</p>
            <p className="text-2xl font-bold text-text-dark">{topSource}</p>
            <p className="text-xs text-gray-500 mt-1">{sources[topSource] || 0} פניות</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent leads */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-dark">לידים אחרונים</h3>
            <Link href="/admin/leads" className="text-sm text-primary hover:underline">
              הצג הכל
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">אין לידים עדיין</p>
          ) : (
            <div className="space-y-2">
              {recent.map((l) => {
                const date = toDate(l.createdAt)
                return (
                  <div
                    key={l.id}
                    className="flex items-center justify-between gap-3 py-3 border-b border-primary-soft/50 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-text-dark truncate">{l.name}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {l.phone}
                        </span>
                        {l.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {l.email}
                          </span>
                        )}
                        {date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {date.toLocaleDateString('he-IL')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-soft text-text-dark whitespace-nowrap">
                      {l.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
