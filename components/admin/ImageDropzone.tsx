'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadFile } from '@/lib/storage'
import { Button } from '@/components/ui/button'

interface ImageDropzoneProps {
  onUpload: (url: string) => void
  path: string
  currentUrl?: string
  label?: string
}

export default function ImageDropzone({ onUpload, path, currentUrl, label }: ImageDropzoneProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | undefined>(currentUrl)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return
      setError(null)
      setUploading(true)
      try {
        const ext = file.name.split('.').pop() || 'jpg'
        const fullPath = path.includes('.') ? path : `${path}-${Date.now()}.${ext}`
        const url = await uploadFile(file, fullPath)
        setPreview(url)
        onUpload(url)
      } catch (e: any) {
        console.error(e)
        const msg = e?.message || ''
        if (msg.includes('storage') || msg.includes('Storage')) {
          setError('להעלאת תמונות חדשות צריך להפעיל Firebase Storage. בינתיים אפשר לבחור מהגלריה הקיימת.')
        } else {
          setError('שגיאה בהעלאת תמונה')
        }
      } finally {
        setUploading(false)
      }
    },
    [path, onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    multiple: false,
    disabled: uploading,
  })

  const handleRemove = () => {
    setPreview(undefined)
    onUpload('')
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-text-dark">{label}</p>}
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
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
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary-soft' : 'border-gray-300 hover:border-primary'
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragActive ? 'שחרר את הקובץ...' : 'גרור תמונה לכאן או לחץ לבחירה'}
              </p>
            </>
          )}
        </div>
      )}
      {error && <p className="text-sm text-accent">{error}</p>}
    </div>
  )
}
