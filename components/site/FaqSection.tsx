'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useLocale } from '@/components/geo/GeoLocaleProvider'

export function FaqSection() {
  const { t } = useLocale()

  const faqs = [
    { q: t('faq1_q'), a: t('faq1_a') },
    { q: t('faq2_q'), a: t('faq2_a') },
    { q: t('faq3_q'), a: t('faq3_a') },
    { q: t('faq4_q'), a: t('faq4_a') },
    { q: t('faq5_q'), a: t('faq5_a') },
    { q: t('faq6_q'), a: t('faq6_a') },
  ]

  return (
    <Accordion type="single" collapsible className="mx-auto max-w-3xl">
      {faqs.map((f, i) => (
        <AccordionItem
          key={i}
          value={`item-${i}`}
          className="glass mb-3 rounded-2xl border border-border px-5"
        >
          <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline sm:text-base">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}