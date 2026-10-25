import { NextResponse } from 'next/server'
import { db } from '@/db'
import { orders } from '@/db/schemas'
import { desc } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin-session'

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5000)

  const header = [
    'Order Number', 'Status', 'UID', 'Nickname', 'Server', 'Diamonds',
    'Amount USD', 'Amount USDT', 'Payment', 'TX ID', 'Coupon', 'Created At',
  ]
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = rows.map((o) =>
    [
      o.orderNumber, o.status, o.playerUid, o.nickname, o.server, o.diamonds,
      o.amountUsd, o.amountUsdt, o.paymentMethod, o.txId, o.couponCode,
      o.createdAt?.toISOString(),
    ].map(escape).join(','),
  )
  const csv = [header.map(escape).join(','), ...lines].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="orders-${Date.now()}.csv"`,
    },
  })
}
