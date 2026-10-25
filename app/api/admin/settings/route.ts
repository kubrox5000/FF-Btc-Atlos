import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { getSettings, saveSettings } from '@/lib/settings'

const STRING_FIELDS = [
  'siteName', 'logo', 'freeGift', 'walletTrc20', 'walletBep20', 'binancePayId', 'walletBtc',
  'walletEth', 'walletBnb', 'walletUsdc', 'walletSol', 'paymentWise', 'paymentPayoneer',
  'paymentSkrill', 'paymentNeteller', 'paymentRedotpay', 'paymentBybit',
  'paymentRevolut', 'whatsapp', 'telegram', 'discord',
  'announcementAr', 'announcementEn', 'announcementFr', 'announcementEs',
  'supportEmail', 'phone', 'address', 'hours', 'instagram', 'facebook',
  'twitter', 'youtube', 'tiktok', 'facebookPixelId',
  'googleAdsPixelId', 'tiktokPixelId', 'snapchatPixelId',
  'telegramBotToken', 'telegramChatId',
  'atlosMerchantId', 'atlosApiSecret',
] as const

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const settings = await getSettings()
  return NextResponse.json({ settings })
}

export async function PUT(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const patch: Record<string, unknown> = {}
  for (const key of STRING_FIELDS) {
    if (typeof body[key] === 'string') patch[key] = body[key]
  }
  if (typeof body.maintenance === 'boolean') patch.maintenance = body.maintenance

  try {
    const saved = await saveSettings(patch)
    return NextResponse.json({ settings: saved })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Failed to save settings: ${msg}` }, { status: 500 })
  }
}

// PATCH — for quick single-field updates
export async function PATCH(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const patch: Record<string, unknown> = {}
  for (const key of STRING_FIELDS) {
    if (typeof body[key] === 'string') patch[key] = body[key]
  }
  if (typeof body.maintenance === 'boolean') patch.maintenance = body.maintenance

  try {
    const saved = await saveSettings(patch)
    return NextResponse.json({ settings: saved })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Failed to save settings: ${msg}` }, { status: 500 })
  }
}
