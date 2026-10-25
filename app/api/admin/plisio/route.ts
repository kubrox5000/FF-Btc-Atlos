import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { getSettings, saveSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'


export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const settings = await getSettings()
  const value = settings.plisioApiKey || process.env.PLISIO_API_KEY || ''
  return NextResponse.json({ configured: Boolean(value), masked: value ? `${value.slice(0, 4)}••••${value.slice(-4)}` : '' })
}

export async function PUT(req: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json() as { apiKey?: unknown }
  const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : ''
  if (!apiKey || apiKey.length < 10 || /\s/.test(apiKey)) return NextResponse.json({ error: 'Enter a valid Plisio API key' }, { status: 400 })

  await saveSettings({ plisioApiKey: apiKey })
  process.env.PLISIO_API_KEY = apiKey
  return NextResponse.json({ ok: true, configured: true, masked: `${apiKey.slice(0, 4)}••••${apiKey.slice(-4)}` })

}
