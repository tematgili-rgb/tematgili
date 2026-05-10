'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import { getSettings, updateSettings } from '@/lib/db'
import type { Settings } from '@/lib/types'

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsForm />
    </ProtectedRoute>
  )
}

function SettingsForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Settings>({
    contactPhone: '',
    contactWhatsapp: '',
    contactEmail: '',
    instagramUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    address: '',
    workingHours: '',
  })
  const [saved, setSaved] = useState<Settings | null>(null)

  useEffect(() => {
    getSettings()
      .then((s) => {
        if (s) {
          setForm({
            contactPhone: s.contactPhone ?? '',
            contactWhatsapp: s.contactWhatsapp ?? '',
            contactEmail: s.contactEmail ?? '',
            instagramUrl: s.instagramUrl ?? '',
            facebookUrl: s.facebookUrl ?? '',
            tiktokUrl: s.tiktokUrl ?? '',
            address: s.address ?? '',
            workingHours: s.workingHours ?? '',
          })
          setSaved(s)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const update = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  const validate = (): string | null => {
    if (!form.contactPhone.match(/^0\d{1,2}-?\d{6,8}$/) && !form.contactPhone.match(/^05\d{8}$/)) {
      if (form.contactPhone) return 'פורמט טלפון לא תקין'
    }
    if (form.contactEmail && !form.contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return 'פורמט אימייל לא תקין'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      await updateSettings(form)
      setSaved({ ...form })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'שגיאה בשמירה')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div dir="rtl">
      <h2 className="text-2xl font-bold text-text-dark mb-6">הגדרות אתר</h2>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h3 className="font-bold text-text-dark">פרטי קשר</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                type="tel"
                value={form.contactPhone}
                onChange={(e) => update('contactPhone', e.target.value)}
                placeholder="050-0000000"
              />
              {saved?.contactPhone && (
                <p className="text-xs text-gray-500 mt-1">שמור: {saved.contactPhone}</p>
              )}
            </div>
            <div>
              <Label htmlFor="wa">WhatsApp (פורמט בינלאומי)</Label>
              <Input
                id="wa"
                type="tel"
                value={form.contactWhatsapp}
                onChange={(e) => update('contactWhatsapp', e.target.value)}
                placeholder="972500000000"
              />
              {saved?.contactWhatsapp && (
                <p className="text-xs text-gray-500 mt-1">שמור: {saved.contactWhatsapp}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              value={form.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value)}
              placeholder="info@tematgili.co.il"
            />
            {saved?.contactEmail && (
              <p className="text-xs text-gray-500 mt-1">שמור: {saved.contactEmail}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address">כתובת</Label>
            <Input
              id="address"
              value={form.address ?? ''}
              onChange={(e) => update('address', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="hours">שעות פעילות</Label>
            <Textarea
              id="hours"
              rows={2}
              value={form.workingHours ?? ''}
              onChange={(e) => update('workingHours', e.target.value)}
              placeholder="א-ה 09:00-21:00 | ו 09:00-13:00"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h3 className="font-bold text-text-dark">רשתות חברתיות</h3>

          <div>
            <Label htmlFor="ig">Instagram URL</Label>
            <Input
              id="ig"
              type="url"
              value={form.instagramUrl}
              onChange={(e) => update('instagramUrl', e.target.value)}
              placeholder="https://instagram.com/tematgili"
            />
          </div>

          <div>
            <Label htmlFor="fb">Facebook URL</Label>
            <Input
              id="fb"
              type="url"
              value={form.facebookUrl ?? ''}
              onChange={(e) => update('facebookUrl', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="tt">TikTok URL</Label>
            <Input
              id="tt"
              type="url"
              value={form.tiktokUrl ?? ''}
              onChange={(e) => update('tiktokUrl', e.target.value)}
            />
          </div>
        </div>

        {error && <div className="bg-accent/10 text-accent rounded-2xl p-3 text-sm">{error}</div>}
        {success && (
          <div className="bg-primary-soft text-text-dark rounded-2xl p-3 text-sm">
            ההגדרות נשמרו בהצלחה
          </div>
        )}

        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 ml-2" />
          )}
          שמור הגדרות
        </Button>
      </form>
    </div>
  )
}
