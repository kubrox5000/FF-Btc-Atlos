import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

// Public: advertising pixel / tracking IDs used by the client-side trackers.
export async function GET() {
  const s = await getSettings()
  return NextResponse.json({
    facebookPixelId: s.facebookPixelId || '',
    googleAdsPixelId: s.googleAdsPixelId || '',
    tiktokPixelId: s.tiktokPixelId || '',
    snapchatPixelId: s.snapchatPixelId || '',
  })
}
