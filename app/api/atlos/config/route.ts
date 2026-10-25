import { NextResponse } from 'next/server'
import { getAtlosCredentials } from '@/lib/atlos'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { merchantId } = await getAtlosCredentials()
  const activeMerchantId = merchantId || null
  return NextResponse.json({
    configured: Boolean(activeMerchantId),
    merchantId: activeMerchantId,
  })
}
