'use client'

// SiteBrand — reads from a global injected by the server layout (no extra fetch).
// Falls back gracefully when the script tag is absent (e.g. Storybook / tests).

declare global {
  interface Window {
    __FF_BRAND__?: { siteName: string; logo: string }
  }
}

function getBrand() {
  if (typeof window !== 'undefined' && window.__FF_BRAND__) return window.__FF_BRAND__
  return { siteName: 'FF Diamond', logo: '' }
}

export function SiteBrand({ nameClass = 'text-lg font-extrabold tracking-tight text-gradient' }: { nameClass?: string }) {
  const { siteName, logo } = getBrand()
  const name = siteName?.trim() || 'FF Diamond'
  const src  = logo?.trim() || ''

  return (
    <>
      {src ? (
         
        <img src={src} alt={name} className="h-8 w-auto max-w-40 object-contain" />
      ) : (
        <span className="text-2xl diamond-float leading-none" aria-hidden>💎</span>
      )}
      <span className={nameClass} translate="no">{name}</span>
    </>
  )
}
