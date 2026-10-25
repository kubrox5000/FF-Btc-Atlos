import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter } from '@/components/site/SiteFooter'
import FloatingSupport from '@/components/site/LazySupport'
import { BinancePayReview } from '@/components/site/BinancePayReview'
import { LocalizedTitle } from '@/components/geo/LocalizedTitle'
import { getSettings } from '@/lib/settings'
import { localizedPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return localizedPageMetadata('title_payment_review')
}

export default async function BinancePayReviewPage() {
  const settings = await getSettings()

  return (
    <>
      <LocalizedTitle pageKey="title_payment_review" />
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <BinancePayReview binancePayId={settings.binancePayId} />
      </main>
      <SiteFooter settings={settings} />
      <FloatingSupport telegram={settings.telegram} discord={settings.discord} />
    </>
  )
}
