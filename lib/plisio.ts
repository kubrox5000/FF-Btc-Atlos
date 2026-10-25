const PLISIO_API_URL = 'https://api.plisio.net/api/v1/invoices/new'

export const PLISIO_KEY = 'PLISIO'

export function isPlisioConfigured() {
  return Boolean(process.env.PLISIO_API_KEY)
}

export async function createPlisioInvoice(input: {
  orderNumber: string
  amountUsd: string
  callbackUrl: string
  email?: string | null
}) {
  const apiKey = process.env.PLISIO_API_KEY
  if (!apiKey) throw new Error('PLISIO_API_KEY is not configured')

  const params = new URLSearchParams({
    api_key: apiKey,
    source_currency: 'USD',
    source_amount: input.amountUsd,
    order_number: input.orderNumber,
    callback_url: input.callbackUrl,
    currency: 'USDT',
  })
  if (input.email) params.set('email', input.email)

  const response = await fetch(`${PLISIO_API_URL}?${params}`, { method: 'GET', cache: 'no-store' })
  const payload = await response.json().catch(() => null)
  if (!response.ok || payload?.status !== 'success' || !payload?.data?.invoice_url) {
    throw new Error(payload?.data?.message || payload?.message || 'Plisio invoice creation failed')
  }

  return {
    url: String(payload.data.invoice_url),
    txnId: payload.data.txn_id ? String(payload.data.txn_id) : null,
  }
}
