'use client'

import { useEffect, useMemo, useState } from 'react'

const COLORS = ['#F4A8B8', '#DC4848', '#F2DCB6', '#C9A876', '#FBD9DF', '#FFFFFF']

export default function ConfettiBalloons() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const played = sessionStorage.getItem('intro_played')
    if (!isLocal && played) return
    setShow(true)
    sessionStorage.setItem('intro_played', '1')
    const t = window.setTimeout(() => setShow(false), 6500)
    return () => window.clearTimeout(t)
  }, [])

  const pieces = useMemo(() => {
    return Array.from({ length: 70 }, (_, i) => ({
      key: `c${i}`,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 1.2,
      duration: 3.2 + Math.random() * 2.4,
      size: 6 + Math.random() * 8,
      rotateStart: Math.random() * 360,
      isCircle: Math.random() < 0.35,
    }))
  }, [])

  const balloons = useMemo(
    () => [
      { left: 4,  color: '#F4A8B8', delay: 0,    duration: 5.5 },
      { left: 11, color: '#22D3EE', delay: 0.8,  duration: 6.0 },
      { left: 18, color: '#DC4848', delay: 0.4,  duration: 6.2 },
      { left: 26, color: '#FACC15', delay: 1.2,  duration: 5.4 },
      { left: 33, color: '#A78BFA', delay: 0.2,  duration: 6.4 },
      { left: 41, color: '#F2DCB6', delay: 0.9,  duration: 5.8 },
      { left: 49, color: '#34D399', delay: 0.5,  duration: 6.1 },
      { left: 56, color: '#FBD9DF', delay: 0.2,  duration: 6.4 },
      { left: 63, color: '#F472B6', delay: 1.0,  duration: 5.7 },
      { left: 71, color: '#60A5FA', delay: 0.6,  duration: 6.0 },
      { left: 78, color: '#C9A876', delay: 0.7,  duration: 5.6 },
      { left: 85, color: '#FB923C', delay: 0.3,  duration: 6.3 },
      { left: 92, color: '#F4A8B8', delay: 1.1,  duration: 6.0 },
      { left: 14, color: '#A3E635', delay: 1.5,  duration: 5.9 },
      { left: 47, color: '#EC4899', delay: 1.7,  duration: 6.1 },
      { left: 80, color: '#06B6D4', delay: 1.9,  duration: 5.8 },
    ],
    []
  )

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.key}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: p.isCircle ? `${p.size}px` : `${p.size * 0.4}px`,
            background: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            transform: `rotate(${p.rotateStart}deg)`,
            animation: `confetti-fall ${p.duration}s cubic-bezier(0.25,0.5,0.5,1) ${p.delay}s forwards`,
          }}
        />
      ))}
      {balloons.map((b, i) => (
        <div
          key={`b${i}`}
          className="absolute bottom-0"
          style={{
            left: `${b.left}%`,
            animation: `balloon-rise ${b.duration}s ease-out ${b.delay}s forwards`,
          }}
        >
          <svg width="44" height="64" viewBox="0 0 44 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="22" cy="22" rx="20" ry="22" fill={b.color} />
            <ellipse cx="14" cy="14" rx="5" ry="6" fill="#ffffff" opacity="0.45" />
            <path d="M19 43 L22 48 L25 43 Z" fill={b.color} />
            <path d="M22 48 Q26 54 20 60 T22 64" stroke="#9ca3af" strokeWidth="1" fill="none" />
          </svg>
        </div>
      ))}
    </div>
  )
}
