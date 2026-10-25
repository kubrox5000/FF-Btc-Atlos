'use client'

import { Turnstile } from '@marsidev/react-turnstile'
import { useLocale } from '@/components/geo/GeoLocaleProvider'

interface CaptchaWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
}

export function CaptchaWidget({ onVerify, onExpire }: CaptchaWidgetProps) {
  const { lang } = useLocale()
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA'

  return (
    <div className="flex justify-center">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onVerify}
        onExpire={onExpire}
        options={{
          language: lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : lang === 'es' ? 'es' : 'en',
          theme: 'dark',
          size: 'normal',
        }}
      />
    </div>
  )
}
