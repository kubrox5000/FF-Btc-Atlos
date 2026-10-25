'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Copy, Check, ShieldCheck, ChevronRight, Loader2, Upload } from 'lucide-react'
import { CryptoIcon } from '@/components/site/CryptoIcon'
import { useLocale } from '@/components/geo/GeoLocaleProvider'

export function BinancePayClient({ binancePayId }: { binancePayId: string }) {
  const { t } = useLocale()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [proof, setProof] = useState<string | null>(null)
  const [proofName, setProofName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(binancePayId)
    setCopied(true)
    toast.success(t('pay_copied'))
    setTimeout(() => setCopied(false), 1500)
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) return toast.error(t('pay_under3'))
    const reader = new FileReader()
    reader.onload = () => {
      setProof(reader.result as string)
      setProofName(file.name)
    }
    reader.readAsDataURL(file)
  }

  async function verify() {
    if (!proof) return toast.error(t('pay_need_proof'))
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 500))
    router.push('/binance-pay/review')
  }

  const steps = [t('bp_step1'), t('bp_step2'), t('bp_step3')]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="glass overflow-hidden rounded-2xl border">
        <div className="flex items-center gap-4 border-b border-border bg-gradient-to-r from-amber-400/10 via-white/5 to-yellow-500/10 p-6">
          <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow">
            <CryptoIcon id="BINANCE_PAY" className="h-12 w-12" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold">{t('bp_title')}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{t('bp_sub')}</p>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{t('bp_id_label')}</p>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 p-1.5 pl-4">
              <code className="flex-1 break-all text-base font-bold" translate="no">
                {binancePayId || '—'}
              </code>
              <button
                onClick={copy}
                disabled={!binancePayId}
                className="btn-shimmer grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white disabled:opacity-50"
                aria-label={t('pay_copied')}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gold">{t('bp_steps')}</p>
            <ol className="space-y-2.5">
              {steps.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3 text-sm"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Screenshot proof upload */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">{t('pay_proof')}</label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed py-3.5 px-4 text-sm text-muted-foreground hover:border-primary/50">
              <Upload className="h-4 w-4" />
              <span className="truncate">{proofName || t('pay_upload')}</span>
              <input type="file" accept="image/*" className="hidden" onChange={onFile} />
            </label>
            {proof && (
              <img
                src={proof}
                alt={t('pay_alt')}
                className="mt-3 max-h-52 rounded-lg border border-border object-contain"
              />
            )}
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200/90">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{t('bp_after')}</p>
          </div>

          <button
            onClick={verify}
            disabled={submitting}
            className="btn-shimmer glow-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
            {t('pay_verify')}
          </button>
        </div>
      </div>
    </div>
  )
}
