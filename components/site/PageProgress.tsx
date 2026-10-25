'use client'

/**
 * شريط تقدم رفيع يظهر أعلى الصفحة عند كل انتقال بين الصفحات.
 * يعمل عبر Next.js navigation events بدون أي مكتبة خارجية.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'

export function PageProgress() {
  const pathname = usePathname()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevPathname = useRef(pathname)

  const start = useCallback(() => {
    setVisible(true)
    setWidth(0)
    let w = 0
    timerRef.current = setInterval(() => {
      // يتقدم بسرعة إلى 85% ثم يبطئ بشكل متدرج
      w += w < 40 ? 8 : w < 70 ? 4 : w < 85 ? 1 : 0
      setWidth(Math.min(w, 85))
    }, 60)
  }, [])

  const finish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setWidth(100)
    setTimeout(() => {
      setVisible(false)
      setWidth(0)
    }, 300)
  }, [])

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      finish()
    }
  }, [pathname, finish])

  // أضف معالج لروابط Link — يبدأ الشريط عند الضغط
  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest('a')
      if (!a) return
      const href = a.getAttribute('href')
      if (!href) return
      // فقط روابط داخلية
      if (href.startsWith('/') && !href.startsWith('//') && !a.getAttribute('target')) {
        start()
      }
    }
    document.addEventListener('click', onLinkClick, true)
    return () => document.removeEventListener('click', onLinkClick, true)
  }, [start])

  if (!visible) return null

  return (
    <div
      role="progressbar"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        height: '3px',
        width: `${width}%`,
        background: 'linear-gradient(90deg, #f5a623, #ff6b2b)',
        boxShadow: '0 0 8px #f5a62380',
        transition: width === 100 ? 'width 0.15s ease' : 'width 0.06s linear',
        borderRadius: '0 2px 2px 0',
        pointerEvents: 'none',
      }}
    />
  )
}
