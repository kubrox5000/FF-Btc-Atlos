import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { orders } from '@/db/schemas'
import { eq, or, desc } from 'drizzle-orm'

// Track by order number OR player UID
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

  const rows = await db
    .select()
    .from(orders)
    .where(or(eq(orders.orderNumber, q), eq(orders.playerUid, q)))
    .orderBy(desc(orders.createdAt))
    .limit(20)

  return NextResponse.json({ orders: rows })
}
