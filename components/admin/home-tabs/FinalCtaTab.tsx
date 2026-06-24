'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getSettings, updateSettings } from '@/lib/db'
import { DEFAULT_RESOLVED_SETTINGS } from '@/lib/settings'

interface CtaForm {
  ctaTitle: string
  ctaSubtitle: string
  ctaButtonText: string
}

export default function FinalCtaTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<CtaForm>({
    ctaTitle: '',
    ctaSubtitle: '',
    ctaButtonText: '',
  })

  useEffect(() => {
    getSettings()
      .then((s) => {
        setForm({
          ctaTitle: s?.ctaTitle ?? DEFAULT_RESOLVED_SETTINGS.ctaTitle,
          ctaSubtitle: s?.ctaSubtitle ?? DEFAULT_RESOLVED_SETTINGS.ctaSubtitle,
          ctaButtonText: s?.ctaButtonText ?? DEFAULT_RESOLVED_SETTINGS.ctaButtonText,
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const update = <K extends keyof CtaForm>(k: K, v: CtaForm[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      await updateSettings(form)
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-dark mb-1">סיום + CTA</h2>
        <p className="text-gray-600">הבאנר האדום בתחתית עמוד הבית</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <Label htmlFor="ctaTitle">כותרת</Label>
            <Input
              id="ctaTitle"
              value={form.ctaTitle}
              onChange={(e) => update('ctaTitle', e.target.value)}
              placeholder="מוכנים להפוך את האירוע שלכם למיוחד?"
            />
          </div>

          <div>
            <Label htmlFor="ctaSubtitle">תיאור</Label>
            <Textarea
              id="ctaSubtitle"
              rows={2}
              value={form.ctaSubtitle}
              onChange={(e) => update('ctaSubtitle', e.target.value)}
              placeholder="דברו איתנו ב-WhatsApp ונכין לכם הצעה מותאמת אישית"
            />
          </div>

          <div>
            <Label htmlFor="ctaButtonText">טקסט הכפתור</Label>
            <Input
              id="ctaButtonText"
              value={form.ctaButtonText}
              onChange={(e) => update('ctaButtonText', e.target.value)}
              placeholder="לכתוב לנו ב-WhatsApp"
            />
          </div>
        </div>

        {error && <div className="bg-accent/10 text-accent rounded-2xl p-3 text-sm">{error}</div>}
        {success && (
          <div className="bg-primary-soft text-text-dark rounded-2xl p-3 text-sm">
            נשמר
          </div>
        )}

        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 ml-2" />
          )}
          שמור
        </Button>
      </form>
    </div>
  )
}
