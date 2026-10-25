import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { ADMIN_COOKIE } from '@/lib/admin-session'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Try cookie
  const cookieToken = req.cookies.get(ADMIN_COOKIE)?.value

  // Try Authorization header
  const authHeader = req.headers.get('authorization') || ''
  const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  // Try custom header
  const xToken = req.headers.get('x-admin-token') || ''

  const token = cookieToken || headerToken || xToken

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ username: String(payload.username), id: Number(payload.sub) })
}
