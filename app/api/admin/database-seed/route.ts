import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { seedDatabase } from '@/lib/db-seed'
import { getActiveDatabaseUrl } from '@/lib/db-ssl'

export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = getActiveDatabaseUrl()
  if (!url) return NextResponse.json({ error: 'No DATABASE_URL configured' }, { status: 400 })

  try {
    await seedDatabase(url)
    return NextResponse.json({ ok: true, message: 'Database seeded with default data (packages, reviews, coupons, admin & settings).' })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
