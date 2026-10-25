'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle2, Home, Search, ShieldCheck, Clock } from 'lucide-react'
import { CryptoIcon } from '@/components/site/CryptoIcon'
import { useLocale } from '@/components/geo/GeoLocaleProvider'

export function BinancePayReview({ binancePayId }: { binancePayId: string }) {
  const { t } = useLocale()
  const router = useRouter()

  return (
    <div className="mx-auto max-w-lg">
      <div className="glass overflow-hidden rounded-2xl border">
        <div className="flex flex-col items-center border-b border-border bg-emerald-500/10 p-8 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <h2 className="mt-4 text-xl font-extrabold text-emerald-200">{t('bpr_title')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('bpr_sub')}</p>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white">
              <CryptoIcon id="BINANCE_PAY" className="h-8 w-8" />
            </span>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t('bpr_method')}</p>
              <p className="font-semibold">{t('bpr_method_val')}</p>
            </div>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <Clock className="mr-1 inline h-3 w-3" />
              {t('bpr_status_val')}
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t('bpr_payid')}</p>
              <p className="font-mono text-base font-bold" translate="no">
                {binancePayId || '—'}
              </p>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>

          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
            {t('bpr_note')}
          </div>

          <button
            onClick={() => router.push('/track')}
            className="btn-shimmer flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            <Search className="h-4 w-4" />
            {t('bpr_track')}
          </button>

          <button
            onClick={() => router.push('/')}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm font-semibold hover:bg-secondary"
          >
            <Home className="h-4 w-4" />
            {t('bpr_home')}
          </button>
        </div>
      </div>
    </div>
  )
}
