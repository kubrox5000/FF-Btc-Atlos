'use client'

import { Star } from 'lucide-react'
import type { PublicReview } from '@/lib/types'

export function ReviewsGrid({ reviews }: { reviews: PublicReview[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {reviews.map((r) => (
        <div
          key={r.id}
          className="glass flex flex-col rounded-2xl border border-border p-5"
        >
          <div className="mb-3 flex gap-0.5">
            {Array.from({ length: 5 }).map((_, s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${s < r.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`}
              />
            ))}
          </div>
          <p className="flex-1 text-sm leading-relaxed text-muted-foreground">“{r.comment}”</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white" translate="no">
              {r.name.charAt(0)}
            </span>
            <div>
              <p className="text-sm font-semibold" translate="no">{r.name}</p>
              {r.country && <p className="text-xs text-muted-foreground">{r.country}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
