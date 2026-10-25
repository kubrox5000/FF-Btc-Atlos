'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

// Scroll-reveal that NEVER hides content: the children are fully visible in the
// initial HTML (no opacity:0), so sections appear instantly even before JS
// loads. Once in view, a subtle slide-up is applied as progressive enhancement.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(className, 'reveal', shown && 'reveal-in')}
      style={shown && delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
