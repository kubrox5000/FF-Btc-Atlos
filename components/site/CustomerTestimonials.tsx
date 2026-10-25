'use client'

import { useState } from 'react'
import { Star, Gem, BadgeCheck, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { PublicReview } from '@/lib/types'
import { useLocale } from '@/components/geo/GeoLocaleProvider'
import { localizedReview } from '@/lib/reviews-locale'

const STEP = 6

const GOLD = 'oklch(0.82 0.15 85)'

const AVATAR_COLORS = ['bg-orange-500', 'bg-violet-500', 'bg-emerald-500', 'bg-sky-500', 'bg-rose-500', 'bg-amber-500']

function GoldStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          style={{ color: i < rating ? GOLD : 'oklch(0.35 0.02 265)' }}
          fill={i < rating ? GOLD : 'transparent'}
          strokeWidth={i < rating ? 0 : 1.5}
        />
      ))}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function CustomerTestimonials({ reviews }: { reviews: PublicReview[] }) {
  const { t, lang } = useLocale()
  const [visible, setVisible] = useState(STEP)
  const shown = reviews.slice(0, visible)

  return (
    <div>
      <div className="mb-10 text-center">
        <h2 key={lang} className="text-3xl font-extrabold sm:text-4xl">{t('tst_title')}</h2>
        <p key={`${lang}-sub`} className="mt-2 text-sm text-muted-foreground">{t('tst_sub')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((r, i) => (
          <TestimonialCard key={r.id} review={r} colorIdx={i} />
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        {visible < reviews.length && (
          <button
            onClick={() => setVisible((v) => Math.min(v + STEP, reviews.length))}
            className="btn-shimmer glow-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            {t('show_more')} <ChevronDown className="h-4 w-4" />
          </button>
        )}
        {visible > STEP && (
          <button
            onClick={() => setVisible(STEP)}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t('show_less')}
          </button>
        )}
      </div>
    </div>
  )
}

function TestimonialCard({ review, colorIdx }: { review: PublicReview; colorIdx: number }) {
  const { t, lang } = useLocale()
  const content = localizedReview(lang, review.name, review.title, review.comment)
  const initials = review.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="glass flex h-full flex-col rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground" translate="no">{formatDate(review.createdAt)}</span>
        <GoldStars rating={review.rating} />
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">“{content.comment}”</p>

      {review.packageLabel && (
        <div className="mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold" translate="no">
            {review.packageLabel} 💎 <Gem className="h-3.5 w-3.5" />
          </span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        {review.verified && (
          <span className="flex items-center gap-1 text-xs font-medium text-gold">
            <BadgeCheck className="h-3.5 w-3.5" /> {t('tst_verified')}
          </span>
        )}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-semibold leading-tight" translate="no">{review.name}</p>
            {review.country && (
              <p className="text-xs text-muted-foreground" translate="no">
                {review.countryCode ? `${review.countryCode} ` : ''}{review.country}
              </p>
            )}
          </div>
          <span
            className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white', AVATAR_COLORS[colorIdx % AVATAR_COLORS.length])}
            translate="no"
          >
            {initials}
          </span>
        </div>
      </div>
    </div>
  )
}
