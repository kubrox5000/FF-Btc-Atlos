import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter } from '@/components/site/SiteFooter'
import FloatingSupport from '@/components/site/LazySupport'
import { PolicyPage } from '@/components/site/PolicyPage'
import { LocalizedTitle } from '@/components/geo/LocalizedTitle'
import { getSettings } from '@/lib/settings'
import { localizedPageMetadata } from '@/lib/seo'

// revalidate كل 5 دقائق — الإعدادات نادراً ما تتغير
export const revalidate = 300

export async function generateMetadata() {
  return localizedPageMetadata('title_privacy')
}

export default async function PrivacyPage() {
  const settings = await getSettings()
  return (
    <>
      <LocalizedTitle pageKey="title_privacy" />
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <PolicyPage policy="privacy" />
      </main>
      <SiteFooter settings={settings} />
      <FloatingSupport telegram={settings.telegram} discord={settings.discord} />
    </>
  )
}
