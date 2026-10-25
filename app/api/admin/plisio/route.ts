import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { getAdminSession } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

const ENV_PATH = path.join(process.cwd(), '.env')
const KEY = 'PLISIO_API_KEY'

async function readEnv() {
  try { return await readFile(ENV_PATH, 'utf8') } catch { return '' }
}

function getValue(content: string) {
  return content.match(/^PLISIO_API_KEY=(.*)$/m)?.[1]?.trim() ?? process.env.PLISIO_API_KEY ?? ''
}

export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const value = getValue(await readEnv())
  return NextResponse.json({ configured: Boolean(value), masked: value ? `${value.slice(0, 4)}••••${value.slice(-4)}` : '' })
}

export async function PUT(req: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json() as { apiKey?: unknown }
  const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : ''
  if (!apiKey || apiKey.length < 10 || /\s/.test(apiKey)) return NextResponse.json({ error: 'Enter a valid Plisio API key' }, { status: 400 })

  const content = await readEnv()
  const next = /^PLISIO_API_KEY=.*$/m.test(content)
    ? content.replace(/^PLISIO_API_KEY=.*$/m, `${KEY}=${apiKey}`)
    : `${content.trimEnd()}${content.trim() ? '\n' : ''}${KEY}=${apiKey}\n`
  await writeFile(ENV_PATH, next, 'utf8')
  process.env.PLISIO_API_KEY = apiKey
  return NextResponse.json({ ok: true, configured: true, masked: `${apiKey.slice(0, 4)}••••${apiKey.slice(-4)}` })
}
