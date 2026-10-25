import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter } from '@/components/site/SiteFooter'
import FloatingSupport from '@/components/site/LazySupport'
import { PolicyPage } from '@/components/site/PolicyPage'
import { LocalizedTitle } from '@/components/geo/LocalizedTitle'
import { getSettings } from '@/lib/settings'
import { localizedPageMetadata } from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata() {
  return localizedPageMetadata('title_terms')
}

export default async function TermsPage() {
  const settings = await getSettings()
  return (
    <>
      <LocalizedTitle pageKey="title_terms" />
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <PolicyPage policy="terms" />
      </main>
      <SiteFooter settings={settings} />
      <FloatingSupport telegram={settings.telegram} discord={settings.discord} />
    </>
  )
}
