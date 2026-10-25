// Server-side locale resolution so the first render already matches the visitor.
// Imported only from server components (App Router) — never from client code.
import { headers, cookies } from 'next/headers'
import { localeForCountry, FALLBACK_LOCALE, type Lang } from './currencies'

export const OVERRIDE_COOKIE = 'ff_locale_lang'
export const COUNTRY_COOKIE = 'ff_country'

export interface ServerLocale {
  lang: Lang
  currency: string
  countryCode?: string
}

/** Resolve the visitor's locale on the server, without any network call. */
export async function resolveServerLocale(): Promise<ServerLocale> {
  const [h, c] = await Promise.all([headers(), cookies()])

  // 1. Manual language override (persisted from the language switcher).
  const override = c.get(OVERRIDE_COOKIE)?.value
  const storedLang: Lang | undefined =
    override === 'en' || override === 'ar' || override === 'fr' || override === 'es'
      ? (override as Lang)
      : undefined

  // 2. Country: prefer geo cookie, then CDN/Cloud geo headers, then Accept-Language header
  let country =
    c.get(COUNTRY_COOKIE)?.value ||
    h.get('cf-ipcountry') ||
    h.get('x-vercel-ip-country') ||
    h.get('x-appengine-country') ||
    h.get('x-country-code') ||
    undefined

  const acceptLanguage = h.get('accept-language') ?? ''
  let browserLang: Lang | undefined

  if (!country) {
    const m = acceptLanguage.match(/(?:^|,)\s*([a-z]{2})(?:-([A-Z]{2}))?/i)
    if (m && m[2]) {
      country = m[2].toUpperCase()
    }
  }

  // Detect preferred browser language among supported (ar, en, fr, es)
  const langMatch = acceptLanguage.match(/(?:^|,)\s*(ar|en|fr|es)\b/i)
  if (langMatch) {
    browserLang = langMatch[1].toLowerCase() as Lang
  }

  if (country) country = country.toUpperCase()

  const base = country
    ? localeForCountry(country, browserLang)
    : browserLang
    ? { lang: browserLang, currency: browserLang === 'ar' ? 'SAR' : browserLang === 'fr' ? 'EUR' : 'USD' }
    : FALLBACK_LOCALE

  const lang: Lang = storedLang ?? base.lang

  return { lang, currency: base.currency, countryCode: country }
}
