'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import { getCarouselItems } from '@/lib/db'
import type { CarouselItem } from '@/lib/types'

const ROTATE_MS = 3500

export default function HeroCarousel3D() {
  const [items, setItems] = useState<CarouselItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [active, setActive] = useState(0)
  const [reduced, setReduced] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const SWIPE_THRESHOLD = 50

  useEffect(() => {
    getCarouselItems()
      .then((list) => setItems(list))
      .catch(() => setItems([]))
      .finally(() => setLoaded(true))
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => setReduced(mq.matches)
    onMq()
    mq.addEventListener('change', onMq)
    const sm = window.matchMedia('(max-width: 640px)')
    const onSm = () => setIsMobile(sm.matches)
    onSm()
    sm.addEventListener('change', onSm)
    return () => {
      mq.removeEventListener('change', onMq)
      sm.removeEventListener('change', onSm)
    }
  }, [])

  const N = items.length

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (N === 0) return
    intervalRef.current = setInterval(() => {
      if (document.hidden) return
      setActive(a => (a + 1) % N)
    }, ROTATE_MS)
  }

  useEffect(() => {
    if (reduced || N === 0) return
    startInterval()
    const onVis = () => {
      if (document.hidden && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      } else if (!document.hidden && !intervalRef.current) {
        startInterval()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, N])

  const goTo = (i: number) => {
    setActive(i)
    if (!reduced) startInterval()
  }

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const t = e.touches[0]
    const dx = t.clientX - touchStartRef.current.x
    const dy = t.clientY - touchStartRef.current.y
    // If horizontal intent dominates, prevent the page from scrolling
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10 && e.cancelable) {
      e.preventDefault()
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start || N === 0) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) < SWIPE_THRESHOLD) return
    if (Math.abs(dy) > Math.abs(dx)) return // vertical scroll
    // RTL-agnostic: swipe LEFT (dx < 0) → next; swipe RIGHT (dx > 0) → prev
    if (dx < 0) {
      goTo((active + 1) % N)
    } else {
      goTo((active - 1 + N) % N)
    }
  }

  const onCardKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      goTo(i)
    }
  }

  // Normalize delta to range [-floor(N/2), ceil(N/2)-1] so each card picks the shortest visual path.
  const slotFor = (i: number) => {
    if (N === 0) return 0
    let delta = ((i - active) % N + N) % N
    if (delta > Math.floor(N / 2)) delta -= N
    return delta
  }

  const transformFor = (slot: number): CSSProperties => {
    const transition = reduced
      ? 'none'
      : 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms ease'
    if (slot === 0) {
      return {
        transform: 'translate3d(-50%, -50%, 0) rotateY(0deg) scale(1)',
        opacity: 1,
        zIndex: 30,
        transition,
      }
    }
    if (slot === 1) {
      return {
        transform: isMobile
          ? 'translate3d(calc(-50% + 220px), calc(-50% - 32px), -140px) rotateY(-28deg) scale(0.92)'
          : 'translate3d(calc(-50% + 270px), calc(-50% - 32px), -180px) rotateY(-32deg) scale(0.85)',
        opacity: 0.85,
        zIndex: 20,
        transition,
      }
    }
    if (slot === -1) {
      return {
        transform: isMobile
          ? 'translate3d(calc(-50% - 220px), calc(-50% - 32px), -140px) rotateY(28deg) scale(0.92)'
          : 'translate3d(calc(-50% - 270px), calc(-50% - 32px), -180px) rotateY(32deg) scale(0.85)',
        opacity: 0.85,
        zIndex: 20,
        transition,
      }
    }
    if (slot === 2) {
      const hideOnMobile = isMobile
      return {
        transform: hideOnMobile
          ? 'translate3d(calc(-50% + 410px), calc(-50% - 56px), -380px) rotateY(-46deg) scale(0)'
          : 'translate3d(calc(-50% + 410px), calc(-50% - 56px), -380px) rotateY(-46deg) scale(0.6)',
        opacity: hideOnMobile ? 0 : 0.4,
        zIndex: 10,
        transition,
        pointerEvents: hideOnMobile ? 'none' : undefined,
      }
    }
    if (slot === -2) {
      const hideOnMobile = isMobile
      return {
        transform: hideOnMobile
          ? 'translate3d(calc(-50% - 410px), calc(-50% - 56px), -380px) rotateY(46deg) scale(0)'
          : 'translate3d(calc(-50% - 410px), calc(-50% - 56px), -380px) rotateY(46deg) scale(0.6)',
        opacity: hideOnMobile ? 0 : 0.4,
        zIndex: 10,
        transition,
        pointerEvents: hideOnMobile ? 'none' : undefined,
      }
    }
    return {
      transform: 'translate3d(-50%, -50%, -600px) scale(0)',
      opacity: 0,
      zIndex: 0,
      pointerEvents: 'none',
      transition,
    }
  }

  if (loaded && N === 0) {
    return (
      <div
        className="relative w-full h-[360px] md:h-[440px] lg:h-[460px] flex items-center justify-center"
        role="region"
        aria-label="קרוסלת המוצרים"
      >
        <div className="text-center text-text-dark/60 max-w-xs">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-primary-soft/60 flex items-center justify-center text-3xl">
            ✨
          </div>
          <p className="text-sm">הקרוסלה תוצג כאן ברגע שיתווספו פריטים בניהול האתר.</p>
        </div>
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="relative w-full h-[360px] md:h-[440px] lg:h-[460px] flex items-center justify-center">
        <div className="animate-pulse w-[260px] h-[340px] md:w-[320px] md:h-[420px] lg:w-[400px] lg:h-[520px] rounded-2xl bg-primary-soft/40" />
      </div>
    )
  }

  const liveText = `מוצר ${active + 1} מתוך ${N}: ${items[active]?.tag ?? ''}`

  return (
    <div
      className="relative w-full h-[360px] md:h-[440px] lg:h-[460px] flex items-center justify-center touch-pan-y"
      role="region"
      aria-roledescription="קרוסלה"
      aria-label="המוצרים שלנו"
      style={{ perspective: '1400px' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="relative w-full h-full"
        style={{ perspective: '1400px', transformStyle: 'preserve-3d' }}
      >
        {items.map((item, i) => {
          const slot = slotFor(i)
          const isActive = slot === 0
          return (
            <div
              key={item.id}
              aria-hidden={!isActive}
              role={isActive ? undefined : 'button'}
              aria-label={isActive ? undefined : `הצג ${item.tag}`}
              tabIndex={isActive ? -1 : 0}
              onClick={isActive ? undefined : () => goTo(i)}
              onKeyDown={isActive ? undefined : (e) => onCardKeyDown(e, i)}
              className={`absolute top-1/2 left-1/2 w-[260px] h-[340px] md:w-[320px] md:h-[420px] lg:w-[400px] lg:h-[520px] flex items-center justify-center ${isActive ? '' : 'cursor-pointer'}`}
              style={{ ...transformFor(slot), transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}
            >
              {isActive && (
                <div
                  aria-hidden="true"
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-black/15 blur-xl rounded-full"
                />
              )}
              <Image
                src={item.imageUrl}
                alt={item.tag}
                width={600}
                height={600}
                priority={i === 0}
                sizes="(max-width: 768px) 260px, (max-width: 1024px) 320px, 400px"
                className={`relative w-full h-full object-contain ${isActive ? 'drop-shadow-2xl' : 'drop-shadow-lg'}`}
              />
            </div>
          )
        })}
      </div>

      {items.map((item, i) => (
        <div
          key={`label-${item.id}`}
          aria-hidden={i !== active}
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur text-text-dark text-sm font-semibold shadow-md transition-opacity duration-500 ${i === active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {item.tag}
        </div>
      ))}

      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={item.tag}
            className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'bg-accent w-6' : 'bg-text-dark/20 w-2 hover:bg-text-dark/40'}`}
          />
        ))}
      </div>

      <div className="sr-only" aria-live="polite">{liveText}</div>
    </div>
  )
}
