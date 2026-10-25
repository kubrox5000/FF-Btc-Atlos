import fs from 'node:fs'
import path from 'node:path'

/**
 * يكشف تلقائياً إعدادات SSL المناسبة بناءً على مزود قاعدة البيانات.
 *
 * Neon     — neon.tech / ep-*.aws  → ssl: 'require'
 * Supabase — supabase.com / supabase.co / pooler.supabase → ssl: 'require'
 * Railway  — railway.app / railway.internal               → ssl: 'require'
 * localhost / 127.0.0.1                                   → ssl: false
 * sslmode=require في URL                                  → ssl: 'require'
 * أي مزود آخر                                             → ssl: 'prefer'
 */
export function detectSsl(databaseUrl: string): 'require' | 'prefer' | false {
  const url = databaseUrl.toLowerCase()

  // إذا كان الـ URL نفسه يحتوي على sslmode=require أو sslmode=verify-full
  if (url.includes('sslmode=require') || url.includes('sslmode=verify-full')) return 'require'

  // بيئة محلية — بدون SSL
  if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('@db:')) return false

  // مزودون يشترطون SSL
  const sslRequired = [
    'neon.tech',
    '.aws.neon',          // Neon pooler: ep-*.aws.neon.tech
    'supabase.com',
    'supabase.co',
    'pooler.supabase',
    'railway.app',
    'railway.internal',
    'render.com',
    'cockroachlabs.cloud',
    'planetscale.com',
    'upstash.io',
    'aiven.io',
    'tembo.io',
  ]
  if (sslRequired.some((host) => url.includes(host))) return 'require'

  // الافتراضي: حاول SSL إن أمكن
  return 'prefer'
}

function isValidDbUrl(url?: string | null): boolean {
  if (!url) return false
  const trimmed = url.trim()
  if (
    trimmed.length === 0 ||
    trimmed.startsWith('postgres://USER') ||
    trimmed.startsWith('postgresql://USER') ||
    trimmed.includes('@HOST:PORT')
  ) {
    return false
  }
  try {
    const parsed = new URL(trimmed)
    return Boolean(parsed.hostname && parsed.hostname !== 'HOST')
  } catch {
    return false
  }
}

export function getActiveDatabaseUrl(): string | null {
  const envUrl = process.env.DATABASE_URL
  if (isValidDbUrl(envUrl)) {
    return envUrl!.trim()
  }
  try {
    const envPath = path.join(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8')
      const match = content.match(/^DATABASE_URL=(.+)$/m)
      if (match && isValidDbUrl(match[1])) {
        const found = match[1].trim()
        process.env.DATABASE_URL = found
        return found
      }
    }
  } catch {
    // ignore
  }
  return null
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getActiveDatabaseUrl())
}


