import { Suspense } from 'react'
import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter } from '@/components/site/SiteFooter'
import FloatingSupport from '@/components/site/LazySupport'
import { TrackClient } from '@/components/site/TrackClient'
import { PageHeader } from '@/components/geo/PageHeader'
import { LocalizedTitle } from '@/components/geo/LocalizedTitle'
import { getSettings } from '@/lib/settings'
import { localizedPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return localizedPageMetadata('title_track')
}

export default async function TrackPage() {
  const settings = await getSettings()
  return (
    <>
      <LocalizedTitle pageKey="title_track" />
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <PageHeader kicker="tr_kicker" title="tr_title" sub="tr_sub" center />
        <Suspense fallback={<div className="mx-auto h-16 max-w-xl animate-pulse rounded-2xl bg-secondary/40" />}>
          <TrackClient />
        </Suspense>
      </main>
      <SiteFooter settings={settings} />
      <FloatingSupport telegram={settings.telegram} discord={settings.discord} />
    </>
  )
}
