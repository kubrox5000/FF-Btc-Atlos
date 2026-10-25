'use client'

import { Target, IdCard, CreditCard, Gem } from 'lucide-react'
import { Reveal } from '@/components/site/Reveal'
import { useLocale } from '@/components/geo/GeoLocaleProvider'

export function HowItWorks() {
  const { t } = useLocale()

  const steps = [
    { icon: Target, iconClass: 'text-rose-400', num: '01', title: t('how1_t'), desc: t('how1_d') },
    { icon: IdCard, iconClass: 'text-violet-400', num: '02', title: t('how2_t'), desc: t('how2_d') },
    { icon: CreditCard, iconClass: 'text-sky-400', num: '03', title: t('how3_t'), desc: t('how3_d') },
    { icon: Gem, iconClass: 'text-sky-300', num: '04', title: t('how4_t'), desc: t('how4_d') },
  ]

  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Reveal className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl">{t('how_title')}</h2>
      </Reveal>

      <div className="relative grid grid-cols-2 gap-y-10 lg:grid-cols-4">
        {/* connecting line (desktop) */}
        <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 lg:block" />

        {steps.map((s, i) => (
          <Reveal key={s.num} delay={i * 0.1} className="relative flex flex-col items-center px-2 text-center">
            <span className="relative z-10 grid h-16 w-16 place-items-center rounded-2xl border border-border bg-card">
              <s.icon className={`h-7 w-7 ${s.iconClass}`} />
            </span>
            <span className="mt-4 text-sm font-bold text-primary" translate="no">{s.num}</span>
            <h3 className="mt-1 text-base font-bold sm:text-lg">{s.title}</h3>
            <p className="mt-1.5 max-w-[16rem] text-sm text-muted-foreground">{s.desc}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}