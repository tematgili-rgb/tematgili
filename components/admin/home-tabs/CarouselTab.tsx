'use client'

import { useEffect, useMemo, useState } from 'react'
import { Image as ImageIcon, Trash2, Loader2, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ImageSelector from '@/components/admin/ImageSelector'
import {
  getCarouselItems,
  createCarouselItem,
  updateCarouselItem,
  deleteCarouselItem,
} from '@/lib/db'
import type { CarouselItem } from '@/lib/types'

export default function Carousel() {
  const [items, setItems] = useState<CarouselItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newUrl, setNewUrl] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newOrder, setNewOrder] = useState<number>(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    void load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await getCarouselItems()
      setItems(data)
      setNewOrder((data[data.length - 1]?.order ?? 0) + 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newUrl) {
      alert('יש להעלות תמונה')
      return
    }
    if (!newTag.trim()) {
      alert('יש להזין תגית')
      return
    }
    setAdding(true)
    try {
      await createCarouselItem({
        imageUrl: newUrl,
        tag: newTag.trim(),
        order: Number(newOrder) || items.length + 1,
      })
      setNewUrl('')
      setNewTag('')
      await load()
    } catch (e) {
      console.error(e)
      alert('שגיאה בהוספה')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (item: CarouselItem) => {
    if (!confirm(`למחוק את "${item.tag}"?`)) return
    try {
      await deleteCarouselItem(item.id, item.imageUrl)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch (e) {
      console.error(e)
      alert('שגיאה במחיקה')
    }
  }

  const handleOrderChange = async (item: CarouselItem, order: number) => {
    try {
      await updateCarouselItem(item.id, { order })
      setItems((prev) =>
        [...prev]
          .map((i) => (i.id === item.id ? { ...i, order } : i))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      )
    } catch (e) {
      console.error(e)
    }
  }

  const handleTagChange = async (item: CarouselItem, tag: string) => {
    try {
      await updateCarouselItem(item.id, { tag })
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, tag } : i))
      )
    } catch (e) {
      console.error(e)
    }
  }

  const move = async (item: CarouselItem, dir: -1 | 1) => {
    const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    const idx = sorted.findIndex((i) => i.id === item.id)
    const neighborIdx = idx + dir
    if (neighborIdx < 0 || neighborIdx >= sorted.length) return
    const neighbor = sorted[neighborIdx]
    const a = item.order
    const b = neighbor.order
    try {
      await updateCarouselItem(item.id, { order: b })
      await updateCarouselItem(neighbor.id, { order: a })
      await load()
    } catch (e) {
      console.error(e)
    }
  }

  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [items]
  )

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-dark mb-1">קרוסלת בית</h2>
        <p className="text-gray-600">{items.length} פריטים בקרוסלה</p>
      </div>

      {/* Upload form */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 space-y-4">
        <h3 className="font-bold text-text-dark">הוספת פריט חדש</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Label htmlFor="tag">תגית *</Label>
            <Input
              id="tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="לדוגמה: חוברות צביעה"
            />
          </div>
          <div>
            <Label htmlFor="order">סדר</Label>
            <Input
              id="order"
              type="number"
              value={newOrder}
              onChange={(e) => setNewOrder(Number(e.target.value))}
            />
          </div>
          <div>
            <ImageSelector
              label="תמונה *"
              path="carousel/img"
              currentUrl={newUrl}
              onChange={setNewUrl}
            />
          </div>
        </div>
        <Button onClick={handleAdd} disabled={adding || !newUrl || !newTag.trim()}>
          {adding && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
          הוסף לקרוסלה
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>אין עדיין פריטים בקרוסלה. העלה את הראשון.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="aspect-square bg-primary-soft/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.tag}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div className="p-3 space-y-2">
                <Input
                  value={item.tag}
                  onChange={(e) => handleTagChange(item, e.target.value)}
                  className="text-sm"
                />
                <div className="flex items-center gap-2">
                  <Label className="text-xs m-0">סדר:</Label>
                  <Input
                    type="number"
                    value={item.order}
                    onChange={(e) => handleOrderChange(item, Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="flex-1"
                    onClick={() => move(item, -1)}
                    disabled={idx === 0}
                    aria-label="הזז למעלה"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="flex-1"
                    onClick={() => move(item, 1)}
                    disabled={idx === sorted.length - 1}
                    aria-label="הזז למטה"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="flex-1 border-accent text-accent hover:bg-accent hover:text-white"
                    onClick={() => handleDelete(item)}
                    aria-label="מחק"
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
