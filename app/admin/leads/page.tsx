'use client'

import { useEffect, useState } from 'react'
import { Search, Phone, Mail, Calendar, Loader2, Users, Trash2, MessageSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import { getAllLeads, updateLeadStatus, deleteDocument } from '@/lib/db'
import { LEAD_STATUSES } from '@/lib/constants'
import type { Lead } from '@/lib/types'

const statusColors: Record<string, string> = {
  new: 'bg-primary-soft text-text-dark',
  answered: 'bg-cream text-text-dark',
  called_no_answer: 'bg-twine/30 text-text-dark',
  not_relevant: 'bg-gray-100 text-gray-700',
  closed_deal: 'bg-accent text-white',
}

function statusLabel(value: string): string {
  return LEAD_STATUSES.find((s) => s.value === value)?.label ?? value
}

function toDate(t: any): Date | null {
  if (!t) return null
  if (t.toDate) return t.toDate()
  if (t instanceof Date) return t
  return null
}

export default function AdminLeadsPage() {
  return (
    <ProtectedRoute>
      <Leads />
    </ProtectedRoute>
  )
}

function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    getAllLeads()
      .then((data) =>
        setLeads(
          [...data].sort(
            (a, b) =>
              (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0)
          )
        )
      )
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateLeadStatus(id, status as Lead['status'])
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: status as Lead['status'] } : l))
      )
      if (status === 'closed_deal') {
        const lead = leads.find((l) => l.id === id)
        const valueStr = window.prompt('סכום העסקה ב-₪?', '500') || '500'
        const value = Number(valueStr) || 500
        try {
          await fetch('/api/lead-webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'offline_conversion',
              lead_id: id,
              gclid: lead?.gclid,
              value,
              currency: 'ILS',
              conversion_name: 'closed_deal',
              source: 'admin_status_change',
            }),
          })
        } catch (err) {
          console.error('[lead-webhook]', err)
        }
      }
    } catch (e) {
      console.error(e)
      alert('שגיאה בעדכון סטטוס')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק את הליד?')) return
    try {
      await deleteDocument('leads', id)
      setLeads((prev) => prev.filter((l) => l.id !== id))
    } catch (e) {
      console.error(e)
      alert('שגיאה במחיקה')
    }
  }

  const filtered = leads.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      l.name.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      (l.email ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div dir="rtl">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-text-dark mb-1">ניהול לידים</h2>
        <p className="text-gray-600">
          {leads.filter((l) => l.status === 'new').length} חדשים ·{' '}
          {leads.filter((l) => l.status === 'answered' || l.status === 'called_no_answer').length} בטיפול ·{' '}
          {leads.filter((l) => l.status === 'closed_deal').length} סגורים · סה״כ {leads.length}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="חיפוש לפי שם, טלפון, אימייל..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
            statusFilter === 'all' ? 'bg-primary text-white' : 'bg-white text-text-dark shadow'
          }`}
        >
          הכל ({leads.length})
        </button>
        {LEAD_STATUSES.map((s) => {
          const count = leads.filter((l) => l.status === s.value).length
          const active = statusFilter === s.value
          return (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                active ? 'bg-primary text-white' : 'bg-white text-text-dark shadow'
              }`}
            >
              {s.label} ({count})
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-2xl shadow-lg">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">אין לידים</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lead) => {
            const date = toDate(lead.createdAt)
            const dateStr = date?.toLocaleDateString('he-IL') ?? ''
            const timeStr =
              date?.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) ?? ''
            const cleanPhone = lead.phone.replace(/\D/g, '')
            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl border-2 border-transparent hover:border-primary-soft transition-all cursor-pointer"
                onClick={() =>
                  window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener')
                }
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-lg font-bold text-text-dark truncate">{lead.name}</h3>
                  <span
                    className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[lead.status] ?? 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {statusLabel(lead.status)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <a
                    href={`tel:${lead.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-text-dark hover:text-primary"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{lead.phone}</span>
                  </a>
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-text-dark hover:text-primary"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-sm truncate">{lead.email}</span>
                    </a>
                  )}
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {dateStr} • {timeStr}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lead.source && <Badge variant="secondary">{lead.source}</Badge>}
                    {lead.productInterest && (
                      <Badge variant="outline">{lead.productInterest}</Badge>
                    )}
                    {lead.eventType && <Badge variant="outline">{lead.eventType}</Badge>}
                  </div>
                  {lead.message && (
                    <div className="flex items-start gap-2 bg-primary-soft/30 rounded-2xl p-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <p className="text-sm text-text-dark">{lead.message}</p>
                    </div>
                  )}
                </div>

                <div
                  className="pt-3 border-t border-primary-soft flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    className="flex-1 border-2 border-gray-200 rounded-2xl px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    value={lead.status}
                    onChange={(e) => handleStatus(lead.id, e.target.value)}
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-white"
                    onClick={() => handleDelete(lead.id)}
                    aria-label="מחק"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
