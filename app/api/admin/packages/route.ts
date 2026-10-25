import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { packages } from '@/db/schemas'
import { asc } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { getAdminSession } from '@/lib/admin-session'

const schema = z.object({
  diamonds: z.number().int().positive(),
  bonusDiamonds: z.number().int().min(0).default(0),
  priceUsd: z.number().positive(),
  priceUsdt: z.number().positive(),
  discountPct: z.number().int().min(0).max(90).default(0),
  popular: z.boolean().default(false),
  flashSale: z.boolean().default(false),
  deliveryEta: z.string().min(1).default('1-5 minutes'),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.select().from(packages).orderBy(asc(packages.sortOrder))
  return NextResponse.json({ packages: rows })
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  const d = parsed.data
  const inserted = (
    await db
      .insert(packages)
      .values({
        diamonds: d.diamonds,
        bonusDiamonds: d.bonusDiamonds,
        priceUsd: d.priceUsd.toFixed(2),
        priceUsdt: d.priceUsdt.toFixed(2),
        discountPct: d.discountPct,
        popular: d.popular,
        flashSale: d.flashSale,
        deliveryEta: d.deliveryEta,
        active: d.active,
        sortOrder: d.sortOrder,
      })
      .returning()
  )[0]
  revalidateTag('home', 'seconds')
  return NextResponse.json({ package: inserted })
}
