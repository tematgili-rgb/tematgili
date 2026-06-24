'use client'

import { Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  GalleryHorizontal,
  CalendarDays,
  Sparkles,
  Megaphone,
} from 'lucide-react'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import HeroTab from '@/components/admin/home-tabs/HeroTab'
import Carousel from '@/components/admin/home-tabs/CarouselTab'
import EventTypesAdmin from '@/components/admin/home-tabs/EventTypesTab'
import FinalCtaTab from '@/components/admin/home-tabs/FinalCtaTab'

type TabId = 'hero' | 'carousel' | 'event-types' | 'cta'

const TABS: Array<{
  id: TabId
  label: string
  icon: typeof GalleryHorizontal
  Component: () => JSX.Element
}> = [
  { id: 'hero',        label: 'Hero',          icon: Sparkles,          Component: HeroTab },
  { id: 'carousel',    label: 'קרוסלת בית',   icon: GalleryHorizontal, Component: Carousel },
  { id: 'event-types', label: 'סוגי אירועים', icon: CalendarDays,      Component: EventTypesAdmin },
  { id: 'cta',         label: 'סיום + CTA',    icon: Megaphone,         Component: FinalCtaTab },
]

function HomeAdminInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = (searchParams.get('tab') as TabId) || 'hero'
  const active = useMemo(
    () => (TABS.some((t) => t.id === tabParam) ? tabParam : 'hero'),
    [tabParam]
  )

  const setTab = (id: TabId) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', id)
    router.replace(`/admin/home?${params.toString()}`, { scroll: false })
  }

  const ActiveTab = TABS.find((t) => t.id === active)!.Component

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-dark mb-1">עמוד הבית</h2>
        <p className="text-gray-600">נהל את התוכן והעיצוב של העמוד הראשי</p>
      </div>

      <div
        role="tablist"
        aria-label="ניהול עמוד הבית"
        className="flex gap-2 flex-wrap mb-6 bg-white rounded-2xl p-2 border-2 border-primary-soft shadow-sm"
      >
        {TABS.map((t) => {
          const Icon = t.icon
          const isActive = active === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-text-dark hover:bg-primary-soft'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel">
        <ActiveTab />
      </div>
    </div>
  )
}

export default function AdminHomePage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="py-20 text-center text-text-dark/60">טוען…</div>
        }
      >
        <HomeAdminInner />
      </Suspense>
    </ProtectedRoute>
  )
}
