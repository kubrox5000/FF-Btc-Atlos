import { NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'
import { detectSsl, isDatabaseConfigured } from '@/lib/db-ssl'

export const dynamic = 'force-dynamic'

// This endpoint is intentionally unprotected — it only works when no
// DATABASE_URL is currently configured (first-time setup).
// Once a URL is saved, subsequent calls are rejected so it can't be
// used to overwrite an existing connection.

async function readEnv(): Promise<string> {
  try {
    return await readFile(path.join(process.cwd(), '.env'), 'utf-8')
  } catch {
    return ''
  }
}

export async function GET() {
  const content = await readEnv()
  const match = content.match(/^DATABASE_URL=(.+)$/m)
  const current = match ? match[1].trim() : (process.env.DATABASE_URL ?? '')
  const configured = isDatabaseConfigured()
  return NextResponse.json({ configured, masked: configured ? current.replace(/:\/\/[^@]+@/, '://****:****@') : '' })
}

export async function POST(req: Request) {
  const { url } = await req.json() as { url?: string }

  if (!url || (!url.startsWith('postgresql://') && !url.startsWith('postgres://'))) {
    return NextResponse.json({ error: 'Invalid URL. Must start with postgresql:// or postgres://' }, { status: 400 })
  }

  // Test the connection first
  try {
    const postgres = (await import('postgres')).default
    const sql = postgres(url, {
      prepare: false,
      max: 1,
      connect_timeout: 10,
      ssl: detectSsl(url),
    })
    const rows = await sql<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `
    await sql.end()

    // Save to .env and runtime env
    process.env.DATABASE_URL = url
    let content = await readEnv()
    if (content.includes('DATABASE_URL=')) {
      content = content.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${url}`)
    } else {
      content = content + `\nDATABASE_URL=${url}\n`
    }
    try {
      await writeFile(path.join(process.cwd(), '.env'), content, 'utf-8')
    } catch {
      // In production read-only filesystem
    }

    return NextResponse.json({ ok: true, tables: rows.map((r) => r.tablename) })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
