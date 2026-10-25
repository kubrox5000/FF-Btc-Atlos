'use client'

import { useLocale } from '@/components/geo/GeoLocaleProvider'
import type { TKey } from '@/lib/i18n'

export function PageHeader({
  kicker,
  title,
  sub,
  center = false,
}: {
  kicker: TKey
  title: TKey
  sub?: TKey
  center?: boolean
}) {
  const { t } = useLocale()
  return (
    <div className={center ? 'mb-8 text-center' : 'mb-8'}>
      <p className="text-xs font-bold uppercase tracking-widest text-primary">{t(kicker)}</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{t(title)}</h1>
      {sub && <p className={`mt-2 text-sm text-muted-foreground ${center ? 'mx-auto max-w-md' : ''}`}>{t(sub)}</p>}
    </div>
  )
}