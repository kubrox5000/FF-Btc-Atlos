'use client'

import { useState } from 'react'
import { MessageCircle, Send, X, Headphones } from 'lucide-react'
import { useLocale } from '@/components/geo/GeoLocaleProvider'

interface Props {
  telegram?: string
  discord?: string
}

export function FloatingSupport({ telegram, discord }: Props) {
  const [open, setOpen] = useState(false)
  const { t } = useLocale()

  const buttons = [
    telegram && {
      key: 'tg',
      label: t('float_tg'),
      href: `https://t.me/${telegram}`,
      className: 'bg-sky-500 hover:bg-sky-400',
      icon: <Send className="h-5 w-5" />,
    },
    discord && {
      key: 'dc',
      label: t('float_dc'),
      href: discord,
      className: 'bg-indigo-500 hover:bg-indigo-400',
      icon: <MessageCircle className="h-5 w-5" />,
    },
  ].filter(Boolean) as { key: string; label: string; href: string; className: string; icon: React.ReactNode }[]

  if (buttons.length === 0) return null

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 pb-safe sm:bottom-5 sm:right-5">
      {open &&
        buttons.map((b) => (
          <a
            key={b.key}
            href={b.href}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 touch-manipulation min-h-[44px] ${b.className}`}
          >
            {b.icon}
            <span>{b.label}</span>
          </a>
        ))}
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-shimmer glow-primary grid h-14 w-14 place-items-center rounded-full text-white shadow-xl transition-transform hover:scale-105 touch-manipulation"
        aria-label={t('float_support')}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <Headphones className="h-6 w-6" />}
      </button>
    </div>
  )
}
