'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Option {
  id: string
  name: string
  emoji?: string
  icon?: string
}

interface Props {
  categories: Option[]
  events: Option[]
  selectedCategory?: string
  selectedEvent?: string
  onCategoryChange: (value: string | undefined) => void
  onEventChange: (value: string | undefined) => void
}

const ALL = '__all__'

export default function ProductFiltersBar({
  categories,
  events,
  selectedCategory,
  selectedEvent,
  onCategoryChange,
  onEventChange,
}: Props) {
  const hasFilters = Boolean(selectedCategory || selectedEvent)

  return (
    <div className="bg-white rounded-2xl border-2 border-primary-soft p-4 flex flex-col md:flex-row gap-3 md:items-end">
      <div className="flex-1">
        <label className="text-sm font-medium text-text-dark mb-1 block">קטגוריה</label>
        <Select
          value={selectedCategory || ALL}
          onValueChange={(v) => onCategoryChange(v === ALL ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="כל הקטגוריות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>כל הקטגוריות</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ''}
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="text-sm font-medium text-text-dark mb-1 block">סוג אירוע</label>
        <Select
          value={selectedEvent || ALL}
          onValueChange={(v) => onEventChange(v === ALL ? undefined : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="כל האירועים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>כל האירועים</SelectItem>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.emoji ? `${e.emoji} ` : ''}
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onCategoryChange(undefined)
            onEventChange(undefined)
          }}
        >
          נקי הכל
        </Button>
      )}
    </div>
  )
}
