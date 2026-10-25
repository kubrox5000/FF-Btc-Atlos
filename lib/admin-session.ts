import 'server-only'
import { cookies, headers } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export const ADMIN_COOKIE = 'db_admin_token'

export async function getAdminSession(): Promise<{ id: number; username: string } | null> {
  // 1. Try cookie first
  const store = await cookies()
  const cookieToken = store.get(ADMIN_COOKIE)?.value

  // 2. Try Authorization header (sent by client when cookie is blocked)
  const headerStore = await headers()
  const authHeader = headerStore.get('x-admin-token') || ''

  const token = cookieToken || authHeader

  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') return null
  return { id: Number(payload.sub), username: String(payload.username) }
}

export async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) throw new Error('UNAUTHORIZED')
  return session
}
