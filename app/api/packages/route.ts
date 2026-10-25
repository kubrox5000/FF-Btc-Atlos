import { NextResponse } from 'next/server'
import { db } from '@/db'
import { packages } from '@/db/schemas'
import { eq, asc } from 'drizzle-orm'
import { SEED_PACKAGES } from '@/lib/seed-data'

import { isDatabaseConfigured } from '@/lib/db-ssl'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!isDatabaseConfigured()) throw new Error('No DB')
    const rows = await db
      .select()
      .from(packages)
      .where(eq(packages.active, true))
      .orderBy(asc(packages.sortOrder))
    return NextResponse.json({ packages: rows })
  } catch {
    return NextResponse.json({ packages: SEED_PACKAGES })
  }
}

