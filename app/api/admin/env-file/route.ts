import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { readFile, writeFile, stat } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const ENV_PATH = path.join(process.cwd(), '.env')

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const content = await readFile(ENV_PATH, 'utf-8')
    const stats = await stat(ENV_PATH)
    return NextResponse.json({ content, size: stats.size, mtime: stats.mtime.toISOString() })
  } catch {
    return NextResponse.json({ content: '', size: 0, mtime: null })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await req.json() as { content: string }
  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
  }

  await writeFile(ENV_PATH, content, 'utf-8')
  const stats = await stat(ENV_PATH)
  return NextResponse.json({ ok: true, size: stats.size })
}
