'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2, Copy, Check,
  Loader2, ShieldCheck, Clock, Gem, ArrowRight, HeadphonesIcon,
} from 'lucide-react'
import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter } from '@/components/site/SiteFooter'

function ConfirmedContent() {
  const params      = useSearchParams()
  const orderNumber = params.get('order') ?? ''

  const [copied, setCopied] = useState(false)
  const [show, setShow] = useState(false)
  useEffect(() => { setTimeout(() => setShow(true), 50) }, [])

  function copyOrder() {
    navigator.clipboard.writeText(orderNumber).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div
        className={`mb-8 flex flex-col items-center text-center transition-all duration-700 ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="relative mb-6">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
          <span className="absolute inset-3 animate-ping rounded-full bg-emerald-500/15 [animation-delay:0.25s]" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30">
            <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold">تم استلام طلبك! 🎉</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          شكراً لك على إتمام الدفع. سيقوم فريقنا بمراجعة العملية<br />
          وإضافة الماسات إلى حسابك في أقرب وقت.
        </p>
      </div>

      <div
        className={`mb-5 transition-all duration-700 delay-100 ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-3 border-b border-emerald-500/20 bg-emerald-500/10 px-5 py-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Gem className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-emerald-300">FF Diamond 💎</p>
              <p className="text-xs text-muted-foreground">Free Fire Top-Up</p>
            </div>
          </div>

          <div className="divide-y divide-border/50 px-5">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">رقم الطلب</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">{orderNumber}</span>
                <button
                  onClick={copyOrder}
                  className="grid h-7 w-7 place-items-center rounded-lg bg-secondary/60 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-muted-foreground">الحالة</span>
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
                <Clock className="h-3 w-3" /> قيد المراجعة
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`mb-5 transition-all duration-700 delay-200 ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="space-y-4 rounded-2xl border border-border bg-card/50 p-5">
          <p className="text-sm font-semibold text-muted-foreground">ماذا يحدث الآن؟</p>
          {[
            { icon: ShieldCheck, color: 'text-violet-400 bg-violet-500/10', text: 'فريقنا يراجع إثبات الدفع ويتحقق منه يدوياً' },
            { icon: Clock,       color: 'text-sky-400 bg-sky-500/10',       text: 'عادةً ما تتم المراجعة خلال دقائق من استلامك للدفع' },
            { icon: Gem,         color: 'text-emerald-400 bg-emerald-500/10', text: 'بعد التأكيد يتم إضافة الماسات لحسابك خلال وقت قصير' },
          ].map(({ icon: Icon, color, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`mb-8 transition-all duration-700 delay-300 ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
          <HeadphonesIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p>
            إذا لم تستلم الماسات خلال <span className="font-bold">24 ساعة</span>، تواصل مع الدعم وأرسل رقم طلبك{' '}
            <span className="font-mono font-bold">{orderNumber}</span>.
          </p>
        </div>
      </div>

      <div
        className={`flex flex-col gap-3 transition-all duration-700 delay-[400ms] ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <Link
          href={`/track?q=${orderNumber}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02]"
        >
          <ArrowRight className="h-4 w-4" />
          تتبع حالة طلبك
        </Link>
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}

export default function PaymentConfirmedPage() {
  return (
    <>
      <SiteNav />
      <main>
        <Suspense fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }>
          <ConfirmedContent />
        </Suspense>
      </main>
      <SiteFooter settings={{} as never} />
    </>
  )
}
