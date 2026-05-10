'use client'

import { Star } from 'lucide-react'

interface Props {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}

export default function StarRating({ value, onChange, disabled }: Props) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="דירוג">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} כוכבים`}
            disabled={disabled}
            onClick={() => onChange(n)}
            className="p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          >
            <Star
              className={`h-9 w-9 transition-colors ${
                active ? 'fill-accent text-accent' : 'fill-transparent text-text-dark/30'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
