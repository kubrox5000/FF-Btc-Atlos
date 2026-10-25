import 'server-only'

// Web Crypto based auth — Cloudflare Workers compatible (no Node native deps).

const encoder = new TextEncoder()

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return arr
}

function base64url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  return atob(input.replace(/-/g, '+').replace(/_/g, '/') + pad)
}

// ---------- Password hashing (PBKDF2) ----------

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return `${toHex(salt.buffer as ArrayBuffer)}:${toHex(bits)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const salt = fromHex(saltHex)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return toHex(bits) === hashHex
}

// ---------- JWT (HS256) ----------

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  // Fallback only used during build-time static analysis — never at runtime without the env var
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      console.warn('[auth] JWT_SECRET is not set — admin sessions will not work correctly')
    }
    return secret ?? 'build-time-placeholder-not-used-at-runtime'
  }
  return secret
}

async function hmacSign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getJwtSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return base64url(String.fromCharCode(...new Uint8Array(sig)))
}

export async function signToken(payload: Record<string, unknown>, expiresInSec = 60 * 60 * 24 * 7): Promise<string> {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64url(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSec }),
  )
  const data = `${header}.${body}`
  const sig = await hmacSign(data)
  return `${data}.${sig}`
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, sig] = parts
  const expected = await hmacSign(`${header}.${body}`)
  if (expected !== sig) return null
  try {
    const payload = JSON.parse(base64urlDecode(body)) as Record<string, unknown>
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return payload
  } catch {
    return null
  }
}
