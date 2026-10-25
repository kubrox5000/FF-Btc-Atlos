import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

// Public: brand (site name + logo) used by the client-side nav/footer.
export async function GET() {
  const s = await getSettings()
  return NextResponse.json({ siteName: s.siteName, logo: s.logo })
}
