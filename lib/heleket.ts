import 'server-only'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { db } from '@/db'
import { orders, type Order } from '@/db/schemas'
import { eq } from 'drizzle-orm'
import type { PublicPaymentMethod } from '@/lib/types'

// Heleket crypto payment gateway (https://doc.heleket.com).
// Requires HELEKET_MERCHANT_ID and HELEKET_API_KEY (payment API key) env vars.

export const HELEKET_KEY = 'HELEKET'
const API_BASE = 'https://api.heleket.com/v1'

export function getHeleketCredentials(): { merchantId?: string; apiKey?: string } {
  let merchantId = process.env.HELEKET_MERCHANT_ID?.trim()
  let apiKey = process.env.HELEKET_API_KEY?.trim()

  if (!merchantId || !apiKey) {
    try {
      const envPath = path.join(process.cwd(), '.env')
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8')
        const mMatch = content.match(/^HELEKET_MERCHANT_ID=(.+)$/m)
        const kMatch = content.match(/^HELEKET_API_KEY=(.+)$/m)
        if (mMatch && !merchantId) merchantId = mMatch[1].trim()
        if (kMatch && !apiKey) apiKey = kMatch[1].trim()
        if (merchantId) process.env.HELEKET_MERCHANT_ID = merchantId
        if (apiKey) process.env.HELEKET_API_KEY = apiKey
      }
    } catch {
      // ignore
    }
  }

  return { merchantId, apiKey }
}

export function isHeleketConfigured(): boolean {
  const { merchantId, apiKey } = getHeleketCredentials()
  return Boolean(merchantId && apiKey)
}

// sign = md5(base64(body) + API_KEY)
function sign(body: string): string {
  const { apiKey } = getHeleketCredentials()
  const b64 = Buffer.from(body, 'utf8').toString('base64')
  return crypto.createHash('md5').update(b64 + (apiKey ?? '')).digest('hex')
}

async function call<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const { merchantId } = getHeleketCredentials()
  const body = JSON.stringify(payload)
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      merchant: merchantId ?? '',
      sign: sign(body),
    },
    body,
    cache: 'no-store',
  })
  const data = (await res.json().catch(() => null)) as { state?: number; result?: T; message?: string } | null
  if (!res.ok || !data || data.state !== 0 || !data.result) {
    throw new Error(data?.message || `Heleket request failed (${res.status})`)
  }
  return data.result
}

export interface HeleketInvoice {
  uuid: string
  order_id: string
  amount: string
  url: string
  payment_status: string
  status?: string
  is_final: boolean
}

export function siteOrigin(fallback: string): string {
  return (process.env.URL || process.env.NEXT_PUBLIC_SITE_URL || fallback).replace(/\/$/, '')
}

export function createHeleketInvoice(opts: {
  orderNumber: string
  amountUsdt: string
  origin: string
}): Promise<HeleketInvoice> {
  const origin = siteOrigin(opts.origin)
  return call<HeleketInvoice>('/payment', {
    amount: opts.amountUsdt,
    currency: 'USDT',
    order_id: opts.orderNumber,
    url_callback: `${origin}/api/heleket/webhook`,
    url_return: `${origin}/payment/${opts.orderNumber}`,
    url_success: `${origin}/payment/${opts.orderNumber}`,
    lifetime: 1800,
  })
}

export function getHeleketInvoice(uuid: string): Promise<HeleketInvoice> {
  return call<HeleketInvoice>('/payment/info', { uuid })
}

// Webhook body carries `sign`; it is computed over the remaining fields encoded
// like PHP's json_encode (slashes escaped).
export function verifyWebhookSign(payload: Record<string, unknown>): boolean {
  const { apiKey } = getHeleketCredentials()
  const { sign: received, ...rest } = payload
  if (typeof received !== 'string' || !apiKey) return false
  const json = JSON.stringify(rest).replace(/\//g, '\\/')
  const expected = sign(json)
  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  )
}

// Map a Heleket payment status onto the store's order status. Only moves the
// order forward from the pre-payment states; never downgrades a handled order.
function nextStatus(current: string, heleketStatus: string): string | null {
  if (current !== 'pending_payment' && current !== 'payment_review') return null
  switch (heleketStatus) {
    case 'paid':
    case 'paid_over':
      return 'paid'
    case 'wrong_amount':
    case 'wrong_amount_waiting':
      return 'payment_review'
    case 'cancel':
    case 'fail':
    case 'system_fail':
      return current === 'pending_payment' ? 'cancelled' : null
    default:
      return null
  }
}

// Pull the authoritative invoice status from Heleket and update the order.
// The invoice uuid is stored in `txId` when the order is created.
export async function syncHeleketOrder(order: Order): Promise<Order> {
  if (order.paymentMethod !== HELEKET_KEY || !order.txId || !isHeleketConfigured()) return order
  const invoice = await getHeleketInvoice(order.txId)
  if (invoice.order_id !== order.orderNumber) return order
  const status = nextStatus(order.status, invoice.payment_status ?? invoice.status ?? '')
  if (!status || status === order.status) return order
  const updated = (
    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, order.id))
      .returning()
  )[0]
  return updated ?? order
}

// Add Heleket to the store's payment methods when configured and not already
// managed from the admin payment-methods table.
export function withHeleket(methods: PublicPaymentMethod[]): PublicPaymentMethod[] {
  if (!isHeleketConfigured() || methods.some((m) => m.key === HELEKET_KEY)) return methods
  return [
    {
      id: 0,
      key: HELEKET_KEY,
      label: 'Heleket',
      network: 'USDT · BTC · ETH · TRX…',
      cat: 'crypto',
      icon: 'heleket',
      walletAddress: '',
      active: true,
      sortOrder: -1,
    },
    ...methods,
  ]
}
