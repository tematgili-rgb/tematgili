'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Image from 'next/image'

const ITEMS = [
  { name: 'חוברות צביעה',   imageUrl: '/products/coloring-book.png', slug: 'coloring-book' },
  { name: 'עטיפות שוקולד',   imageUrl: '/products/chocolate.png',    slug: 'snack-wrap' },
  { name: 'חטיפים ממותגים',  imageUrl: '/products/snack.png',        slug: 'snack-wrap' },
  { name: 'אריזות מתנה',     imageUrl: '/products/packaging.png',    slug: 'gift-box' },
  { name: 'חבילות מוכנות',   imageUrl: '/products/bundle.png',       slug: 'gift-box' },
  { name: 'צנצנות ממותגות',  imageUrl: '/products/jar.png',          slug: 'bottle-label' },
  { name: 'בועות סבון',      imageUrl: '/products/bubbles.png',      slug: 'party-hat' },
]

const ROTATE_MS = 3500
const N = ITEMS.length

export default function HeroCarousel3D() {
  const [active, setActive] = useState(0)
  const [reduced, setReduced] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (document.hidden) return
      setActive(a => (a + 1) % N)
    }, ROTATE_MS)
  }

  useEffect(() => {
    if (reduced) return
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
  }, [reduced])

  const goTo = (i: number) => {
    setActive(i)
    if (!reduced) startInterval()
  }

  // Normalize delta to range [-floor(N/2), ceil(N/2)-1] so each card picks the shortest visual path.
  const slotFor = (i: number) => {
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
        transform: 'translate3d(calc(-50% + 270px), calc(-50% - 32px), -180px) rotateY(-32deg) scale(0.85)',
        opacity: 0.85,
        zIndex: 20,
        transition,
      }
    }
    if (slot === -1) {
      return {
        transform: 'translate3d(calc(-50% - 270px), calc(-50% - 32px), -180px) rotateY(32deg) scale(0.85)',
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

  const liveText = `מוצר ${active + 1} מתוך ${N}: ${ITEMS[active].name}`

  return (
    <div
      className="relative w-full h-[360px] md:h-[440px] lg:h-[460px] flex items-center justify-center"
      role="region"
      aria-roledescription="קרוסלה"
      aria-label="המוצרים שלנו"
      style={{ perspective: '1400px' }}
    >
      <div
        className="relative w-full h-full"
        style={{ perspective: '1400px', transformStyle: 'preserve-3d' }}
      >
        {ITEMS.map((item, i) => {
          const slot = slotFor(i)
          const isActive = slot === 0
          return (
            <div
              key={item.slug}
              aria-hidden={!isActive}
              className="absolute top-1/2 left-1/2 w-[260px] h-[340px] md:w-[320px] md:h-[420px] lg:w-[400px] lg:h-[520px] flex items-center justify-center"
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
                alt={item.name}
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

      {ITEMS.map((item, i) => (
        <div
          key={`label-${item.slug}`}
          aria-hidden={i !== active}
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur text-text-dark text-sm font-semibold shadow-md transition-opacity duration-500 ${i === active ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {item.name}
        </div>
      ))}

      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {ITEMS.map((item, i) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => goTo(i)}
            aria-label={item.name}
            className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'bg-accent w-6' : 'bg-text-dark/20 w-2 hover:bg-text-dark/40'}`}
          />
        ))}
      </div>

      <div className="sr-only" aria-live="polite">{liveText}</div>
    </div>
  )
}
