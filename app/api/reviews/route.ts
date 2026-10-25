import { NextResponse } from 'next/server'
import { db } from '@/db'
import { reviews } from '@/db/schemas'
import { desc } from 'drizzle-orm'
import { SEED_REVIEWS } from '@/lib/seed-data'

import { isDatabaseConfigured } from '@/lib/db-ssl'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!isDatabaseConfigured()) throw new Error('No DB')
    const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(60)
    return NextResponse.json({ reviews: rows })
  } catch {
    return NextResponse.json({ reviews: SEED_REVIEWS })
  }
}

