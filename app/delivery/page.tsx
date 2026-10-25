import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter } from '@/components/site/SiteFooter'
import FloatingSupport from '@/components/site/LazySupport'
import { PolicyPage } from '@/components/site/PolicyPage'
import { LocalizedTitle } from '@/components/geo/LocalizedTitle'
import { getSettings } from '@/lib/settings'
import { localizedPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return localizedPageMetadata('title_delivery')
}

export default async function DeliveryPage() {
  const settings = await getSettings()
  return (
    <>
      <LocalizedTitle pageKey="title_delivery" />
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <PolicyPage policy="delivery" />
      </main>
      <SiteFooter settings={settings} />
      <FloatingSupport telegram={settings.telegram} discord={settings.discord} />
    </>
  )
}
