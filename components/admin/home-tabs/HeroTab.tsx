'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getSettings, updateSettings } from '@/lib/db'
import { DEFAULT_RESOLVED_SETTINGS } from '@/lib/settings'

interface HeroForm {
  heroBadge: string
  heroTitle: string
  heroSubtitle: string
  heroCtaPrimary: string
  heroCtaSecondary: string
}

export default function HeroTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<HeroForm>({
    heroBadge: '',
    heroTitle: '',
    heroSubtitle: '',
    heroCtaPrimary: '',
    heroCtaSecondary: '',
  })

  useEffect(() => {
    getSettings()
      .then((s) => {
        setForm({
          heroBadge: s?.heroBadge ?? DEFAULT_RESOLVED_SETTINGS.heroBadge,
          heroTitle: s?.heroTitle ?? DEFAULT_RESOLVED_SETTINGS.heroTitle,
          heroSubtitle: s?.heroSubtitle ?? DEFAULT_RESOLVED_SETTINGS.heroSubtitle,
          heroCtaPrimary: s?.heroCtaPrimary ?? DEFAULT_RESOLVED_SETTINGS.heroCtaPrimary,
          heroCtaSecondary: s?.heroCtaSecondary ?? DEFAULT_RESOLVED_SETTINGS.heroCtaSecondary,
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const update = <K extends keyof HeroForm>(k: K, v: HeroForm[K]) => {
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
        <h2 className="text-2xl font-bold text-text-dark mb-1">כותרת ראשית (Hero)</h2>
        <p className="text-gray-600">הטקסט שמופיע בראש עמוד הבית</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div>
            <Label htmlFor="heroBadge">תגית עליונה</Label>
            <Input
              id="heroBadge"
              value={form.heroBadge}
              onChange={(e) => update('heroBadge', e.target.value)}
              placeholder="מיתוג אישי לכל אירוע ✨"
            />
          </div>

          <div>
            <Label htmlFor="heroTitle">כותרת ראשית (ורודה)</Label>
            <Input
              id="heroTitle"
              value={form.heroTitle}
              onChange={(e) => update('heroTitle', e.target.value)}
              placeholder="מיתוג לאירועים ומתנות"
            />
          </div>

          <div>
            <Label htmlFor="heroSubtitle">תיאור (פסקה מתחת לכותרת)</Label>
            <Textarea
              id="heroSubtitle"
              rows={3}
              value={form.heroSubtitle}
              onChange={(e) => update('heroSubtitle', e.target.value)}
              placeholder="חוברות צביעה, עטיפות שוקולד..."
            />
            <p className="text-xs text-gray-500 mt-1">
              המילה &quot;למיוחד&quot; תוצג מודגשת בעיצוב הוורוד באתר
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="heroCtaPrimary">כפתור ראשי</Label>
              <Input
                id="heroCtaPrimary"
                value={form.heroCtaPrimary}
                onChange={(e) => update('heroCtaPrimary', e.target.value)}
                placeholder="ראו את המוצרים"
              />
            </div>
            <div>
              <Label htmlFor="heroCtaSecondary">כפתור משני</Label>
              <Input
                id="heroCtaSecondary"
                value={form.heroCtaSecondary}
                onChange={(e) => update('heroCtaSecondary', e.target.value)}
                placeholder="חבילות מוכנות"
              />
            </div>
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
