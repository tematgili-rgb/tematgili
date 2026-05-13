'use client'

import { useState } from 'react'
import { ImagePlus, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ImageDropzone from '@/components/admin/ImageDropzone'
import ImagePickerDialog from '@/components/admin/ImagePickerDialog'

interface Props {
  label?: string
  currentUrl: string
  path: string
  onChange: (url: string) => void
}

export default function ImageSelector({ label, currentUrl, path, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const handleRemove = () => {
    onChange('')
    setShowUpload(false)
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-text-dark">{label}</p>}
      {currentUrl ? (
        <div className="space-y-2">
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUrl}
              alt="preview"
              className="w-40 h-40 object-cover rounded-2xl border-2 border-primary-soft"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute -top-2 -left-2 h-7 w-7"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
              <ImagePlus className="w-4 h-4 ml-1" /> החלף מהגלריה
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { onChange(''); setShowUpload(true) }}>
              <Upload className="w-4 h-4 ml-1" /> העלה חדש
            </Button>
          </div>
        </div>
      ) : showUpload ? (
        <div className="space-y-2">
          <ImageDropzone
            path={path}
            currentUrl={currentUrl}
            onUpload={(url) => { onChange(url); setShowUpload(false) }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => setShowUpload(false)}>
            ביטול
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <Button type="button" variant="outline" onClick={() => setShowUpload(true)}>
            <Upload className="w-4 h-4 ml-1" /> העלה חדש
          </Button>
          <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
            <ImagePlus className="w-4 h-4 ml-1" /> בחר מהגלריה
          </Button>
        </div>
      )}

      <ImagePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        mode="single"
        onPick={(url) => {
          if (typeof url === 'string') onChange(url)
        }}
        currentUrls={currentUrl ? [currentUrl] : []}
      />
    </div>
  )
}
