'use client'

import { useEffect, useState } from 'react'
import { Loader2, Upload, Check } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSettings, updateSettings } from '@/lib/db'
import { uploadFile } from '@/lib/storage'
import type { FontSetting, Settings } from '@/lib/types'
import { HEBREW_FONTS, HEBREW_FONT_SAMPLE, type HebrewFontOption } from '@/lib/hebrewFonts'

type Slot = 'heading' | 'body'
type Mode = 'upload' | 'google' | 'catalog'
type CatFilter = 'all' | 'sans' | 'serif' | 'display'

export default function AdminFontsPage() {
  return (
    <ProtectedRoute>
      <Fonts />
    </ProtectedRoute>
  )
}

function Fonts() {
  const [settings, setSettings] = useState<Partial<Settings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  // Inject all Google catalog font CSS links once so previews render correctly.
  // Local fonts are loaded site-wide via /fonts/local-hebrew.css in layout.tsx.
  useEffect(() => {
    const ids = new Set<string>()
    HEBREW_FONTS.forEach((f) => {
      if (f.source === 'local' || !f.url) return
      const id = `hebfont-${f.family.replace(/\s+/g, '-')}`
      if (ids.has(id) || document.getElementById(id)) return
      ids.add(id)
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = f.url
      document.head.appendChild(link)
    })
  }, [])

  useEffect(() => {
    getSettings()
      .then((s) => setSettings(s ?? {}))
      .catch(() => setSettings({}))
      .finally(() => setLoading(false))
  }, [])

  const updateFont = (slot: Slot, font: FontSetting | undefined) => {
    setSettings((prev) => ({
      ...prev,
      [slot === 'heading' ? 'fontHeading' : 'fontBody']: font,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSavedMessage(null)
    try {
      await updateSettings({
        fontHeading: settings.fontHeading,
        fontBody: settings.fontBody,
      } as Partial<Settings>)
      setSavedMessage('הפונטים נשמרו. רענן את האתר כדי לראות את השינויים.')
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
    <div dir="rtl" className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-dark mb-1">פונטים</h2>
        <p className="text-gray-600">בחר פונט לכותרות ופונט לטקסט הגוף.</p>
      </div>

      <FontCard
        title="פונט כותרות"
        slot="heading"
        font={settings.fontHeading}
        onChange={(f) => updateFont('heading', f)}
        sampleText="כותרת ראשית — תמתגילי"
      />

      <FontCard
        title="פונט טקסט"
        slot="body"
        font={settings.fontBody}
        onChange={(f) => updateFont('body', f)}
        sampleText="זהו טקסט לדוגמה. נשתמש בו לכל פסקאות האתר."
      />

      {error && <div className="bg-accent/10 text-accent rounded-2xl p-3 text-sm">{error}</div>}
      {savedMessage && <div className="bg-green-50 text-green-800 rounded-2xl p-3 text-sm">{savedMessage}</div>}

      <div>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
          שמור פונטים
        </Button>
      </div>
    </div>
  )
}

interface FontCardProps {
  title: string
  slot: Slot
  font?: FontSetting
  onChange: (font: FontSetting | undefined) => void
  sampleText: string
}

function FontCard({ title, slot, font, onChange, sampleText }: FontCardProps) {
  const initialMode: Mode =
    font?.source === 'upload' ? 'upload' :
    (font && HEBREW_FONTS.some((h) => h.family === font.family)) ? 'catalog' :
    'google'

  const [mode, setMode] = useState<Mode>(initialMode)
  const [family, setFamily] = useState(font?.family ?? '')
  const [url, setUrl] = useState(font?.url ?? '')
  const [pickedSource, setPickedSource] = useState<'google' | 'local'>(
    font?.source === 'local' ? 'local' : 'google'
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [catFilter, setCatFilter] = useState<CatFilter>('all')

  // For Settings: upload stays upload; catalog picks carry the catalog source ('google' | 'local');
  // free-text google URL stays google.
  const sourceForSettings: 'upload' | 'google' | 'local' =
    mode === 'upload' ? 'upload' :
    mode === 'catalog' ? pickedSource :
    'google'

  useEffect(() => {
    onChange(
      family.trim()
        ? { family: family.trim(), url: url || undefined, source: sourceForSettings }
        : undefined
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family, url, mode, pickedSource])

  const dropzone = useDropzone({
    accept: {
      'font/woff2': ['.woff2'],
      'font/woff': ['.woff'],
      'font/ttf': ['.ttf'],
      'font/otf': ['.otf'],
      'application/octet-stream': ['.woff2', '.woff', '.ttf', '.otf'],
    },
    multiple: false,
    onDrop: async (files) => {
      const file = files[0]
      if (!file) return
      setUploading(true)
      setUploadError(null)
      try {
        const ext = file.name.split('.').pop() || 'woff2'
        const uploadedUrl = await uploadFile(
          file,
          `fonts/${slot}-${Date.now()}.${ext}`
        )
        setUrl(uploadedUrl)
      } catch (e: any) {
        console.error(e)
        setUploadError('Firebase Storage לא מופעל — הפעל אותו ב-Firebase Console כדי להעלות פונטים')
      } finally {
        setUploading(false)
      }
    },
  })

  const pickCatalog = (opt: HebrewFontOption) => {
    setFamily(opt.family)
    setUrl(opt.url)
    setPickedSource(opt.source === 'local' ? 'local' : 'google')
  }

  const visibleFonts = HEBREW_FONTS.filter((f) =>
    catFilter === 'all' ? true : f.category === catFilter
  )

  const previewStyle: React.CSSProperties = family
    ? { fontFamily: `"${family}", system-ui, sans-serif` }
    : {}

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h3 className="font-bold text-lg text-text-dark">{title}</h3>

      <div>
        <Label htmlFor={`${slot}-family`}>שם הפונט (font-family)</Label>
        <Input
          id={`${slot}-family`}
          value={family}
          onChange={(e) => setFamily(e.target.value)}
          placeholder="לדוגמה: Heebo, Rubik"
        />
      </div>

      <div>
        <Label>מקור</Label>
        <div className="flex flex-wrap gap-3 mt-2">
          <ModeRadio slot={slot} value="catalog" current={mode} onChange={setMode} label="בחר מהקטלוג" />
          <ModeRadio slot={slot} value="google"  current={mode} onChange={setMode} label="Google Fonts URL" />
          <ModeRadio slot={slot} value="upload"  current={mode} onChange={setMode} label="העלה קובץ" />
        </div>
      </div>

      {mode === 'catalog' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'all', label: 'הכל' },
                { id: 'sans', label: 'סנס' },
                { id: 'serif', label: 'סריף' },
                { id: 'display', label: 'דקורטיבי' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCatFilter(f.id)}
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  catFilter === f.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-text-dark border-gray-300 hover:border-primary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {visibleFonts.map((opt) => {
              const selected = family === opt.family
              return (
                <button
                  key={opt.family}
                  type="button"
                  onClick={() => pickCatalog(opt)}
                  className={`relative text-right rounded-2xl border-2 p-3 transition ${
                    selected
                      ? 'border-primary bg-primary-soft'
                      : 'border-gray-200 hover:border-primary/60 bg-white'
                  }`}
                >
                  {selected && (
                    <Check className="absolute top-2 left-2 w-4 h-4 text-primary" />
                  )}
                  {opt.source === 'local' && (
                    <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-cream text-text-dark/70 border border-twine/40">
                      מקומי
                    </span>
                  )}
                  <div className="text-xs text-text-dark/60 mb-1" dir="ltr">
                    {opt.family}
                  </div>
                  <div
                    className="text-lg text-text-dark leading-tight"
                    style={{ fontFamily: `"${opt.family}", system-ui, sans-serif` }}
                  >
                    {HEBREW_FONT_SAMPLE}
                  </div>
                  <div className="text-xs text-text-dark/50 mt-2">{opt.description}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {mode === 'google' && (
        <div>
          <Label htmlFor={`${slot}-url`}>קישור CSS של Google Fonts</Label>
          <Input
            id={`${slot}-url`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap"
            dir="ltr"
          />
          <p className="text-xs text-gray-500 mt-1">
            הדבק את קישור ה-CSS המלא. שם המשפחה חייב להתאים לערך family שבקישור.
          </p>
        </div>
      )}

      {mode === 'upload' && (
        <div className="space-y-2">
          <div
            {...dropzone.getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer ${
              dropzone.isDragActive
                ? 'border-primary bg-primary-soft'
                : 'border-gray-300 hover:border-primary'
            }`}
          >
            <input {...dropzone.getInputProps()} />
            {uploading ? (
              <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
            ) : (
              <>
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  גרור קובץ פונט (.woff2 / .woff / .ttf / .otf) או לחץ לבחירה
                </p>
              </>
            )}
          </div>
          {url && (
            <p className="text-xs text-gray-600 truncate" dir="ltr">
              קובץ: {url}
            </p>
          )}
          {uploadError && (
            <p className="text-sm text-accent">{uploadError}</p>
          )}
        </div>
      )}

      <div className="bg-bg-soft rounded-2xl p-4 border-2 border-primary-soft">
        <p className="text-xs text-text-dark/60 mb-2">תצוגה מקדימה</p>
        {slot === 'heading' ? (
          <h3 className="text-2xl font-black text-text-dark" style={previewStyle}>
            {sampleText}
          </h3>
        ) : (
          <p className="text-base text-text-dark" style={previewStyle}>
            {sampleText}
          </p>
        )}
      </div>
    </div>
  )
}

interface ModeRadioProps {
  slot: Slot
  value: Mode
  current: Mode
  onChange: (m: Mode) => void
  label: string
}

function ModeRadio({ slot, value, current, onChange, label }: ModeRadioProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name={`${slot}-source`}
        checked={current === value}
        onChange={() => onChange(value)}
        className="accent-primary"
      />
      <span className="text-sm">{label}</span>
    </label>
  )
}
