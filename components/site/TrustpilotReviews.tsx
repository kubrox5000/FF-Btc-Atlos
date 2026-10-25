'use client'

import { useState } from 'react'
import { Star, Gem, BadgeCheck, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatNumber } from '@/lib/currencies'
import type { PublicReview } from '@/lib/types'
import { useLocale } from '@/components/geo/GeoLocaleProvider'
import { localizedReview } from '@/lib/reviews-locale'

const TRUST_GREEN = '#00b67a'
const STEP = 6

// small avatar color palette (Trustpilot-like)
const AVATAR_COLORS = ['bg-sky-500', 'bg-orange-500', 'bg-rose-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500']

function TrustStars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const box = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn('grid place-items-center rounded-[3px]', box)}
          style={{ backgroundColor: i < rating ? TRUST_GREEN : 'oklch(0.3 0.02 265)' }}
        >
          <Star className="h-2.5 w-2.5 fill-white text-white" strokeWidth={0} />
        </span>
      ))}
    </div>
  )
}

function TrustpilotLogo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-semibold', className)} translate="no">
      <Star className="h-4 w-4 fill-current" style={{ color: TRUST_GREEN }} strokeWidth={0} />
      <span>Trustpilot</span>
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function TrustpilotReviews({
  reviews,
  averageRating,
  totalReviews,
}: {
  reviews: PublicReview[]
  averageRating: number
  totalReviews: number
}) {
  const { t, lang } = useLocale()
  const [visible, setVisible] = useState(STEP)
  const shown = reviews.slice(0, visible)

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
      {/* Summary card */}
      <div className="glass rounded-2xl border border-border p-6 lg:sticky lg:top-24">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            <span translate="no">{t('rev_based')}</span>
            <p className="text-2xl font-extrabold text-foreground" translate="no">{formatNumber(totalReviews)}+</p>
            <span>{t('rev_reviews')}</span>
          </div>
          <div className="text-right">
            <p className="text-4xl font-extrabold" translate="no">{averageRating.toFixed(1)}</p>
            <div className="mt-1 flex justify-end">
              <TrustStars rating={Math.round(averageRating)} />
            </div>
            <p className="mt-1 text-xs font-medium" style={{ color: TRUST_GREEN }}>{t('rev_excellent')}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <span className="rounded px-2 py-1 text-xs font-bold text-white" style={{ backgroundColor: '#191919' }}>
            <TrustpilotLogo />
          </span>
        </div>
      </div>

      {/* Header + grid of reviews */}
      <div>
        <div className="mb-6 text-center lg:text-left">
          <h2 key={lang} className="text-3xl font-extrabold sm:text-4xl">{t('rev_title')}</h2>
          <p key={`${lang}-sub`} className="mt-2 text-sm text-muted-foreground">{t('rev_sub')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((r, i) => (
            <ReviewCard key={r.id} review={r} colorIdx={i} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          {visible < reviews.length && (
            <button
              onClick={() => setVisible((v) => Math.min(v + STEP, reviews.length))}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: TRUST_GREEN }}
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
    </div>
  )
}

function ReviewCard({ review, colorIdx }: { review: PublicReview; colorIdx: number }) {
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
        <TrustStars rating={review.rating} size="sm" />
      </div>

      <h3 className="mt-4 font-bold leading-snug">{content.title ?? t('rev_default')}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{content.comment}</p>

      {review.packageLabel && (
        <div className="mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold" translate="no">
            {review.packageLabel} <Gem className="h-3.5 w-3.5" />
          </span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        {review.verified && (
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: TRUST_GREEN }}>
            <BadgeCheck className="h-3.5 w-3.5" /> {t('rev_verified')}
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

export function TrustpilotFooter() {
  const { t } = useLocale()
  return (
    <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <span translate="no">{t('rev_powered')}</span>
      <TrustpilotLogo className="text-foreground" />
    </div>
  )
}
