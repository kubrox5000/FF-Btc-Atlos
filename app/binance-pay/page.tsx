import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter } from '@/components/site/SiteFooter'
import FloatingSupport from '@/components/site/LazySupport'
import { BinancePayClient } from '@/components/site/BinancePayClient'
import { LocalizedTitle } from '@/components/geo/LocalizedTitle'
import { getSettings } from '@/lib/settings'
import { localizedPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return localizedPageMetadata('title_binance')
}

export default async function BinancePayPage() {
  const settings = await getSettings()

  return (
    <>
      <LocalizedTitle pageKey="title_binance" />
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <BinancePayClient binancePayId={settings.binancePayId} />
      </main>
      <SiteFooter settings={settings} />
      <FloatingSupport telegram={settings.telegram} discord={settings.discord} />
    </>
  )
}
