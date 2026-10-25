import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { orders } from '@/db/schemas'

const paidStatuses = new Set(['completed', 'mismatch'])

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null) as Record<string, unknown> | null
  const orderNumber = typeof payload?.order_number === 'string' ? payload.order_number : ''
  const status = typeof payload?.status === 'string' ? payload.status : ''
  const txnId = typeof payload?.txn_id === 'string' ? payload.txn_id : null
  if (!orderNumber || !status) return NextResponse.json({ error: 'Invalid callback' }, { status: 400 })

  const nextStatus = paidStatuses.has(status) ? 'paid' : status === 'cancelled' || status === 'expired' ? 'cancelled' : 'pending_payment'
  await db.update(orders).set({ status: nextStatus, txId: txnId, updatedAt: new Date() }).where(eq(orders.orderNumber, orderNumber))
  return NextResponse.json({ ok: true })
}
