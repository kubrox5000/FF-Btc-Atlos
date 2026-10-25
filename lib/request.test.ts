import assert from 'node:assert/strict'
import test from 'node:test'

import { apiClient } from './request'

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    statusText: status >= 400 ? 'Request failed' : 'OK',
    headers: { 'Content-Type': 'application/json' },
  })
}

test('apiClient.get unwraps a success envelope', async (t) => {
  const originalFetch = globalThis.fetch
  t.after(() => {
    globalThis.fetch = originalFetch
  })
  globalThis.fetch = async () => jsonResponse({ token: 'token-123' })

  const result = await apiClient.get<{ token: string }>('https://example.test/api/me')

  assert.equal(result.success, true)
  assert.equal(result.data?.token, 'token-123')
})

test('apiClient.post sends a JSON body and exposes response data', async (t) => {
  const originalFetch = globalThis.fetch
  t.after(() => {
    globalThis.fetch = originalFetch
  })
  let sentBody: string | null = null
  globalThis.fetch = async (_input, init) => {
    sentBody = init?.body as string
    return jsonResponse({ success: true, data: { token: 'login-token' } })
  }

  const result = await apiClient.post<{ token: string }>(
    'https://example.test/api/login',
    { email: 'user@example.test' }
  )

  assert.equal(sentBody, JSON.stringify({ email: 'user@example.test' }))
  assert.equal(result.success && result.data?.token, 'login-token')
})

test('apiClient preserves every supported HeaderInit representation', async (t) => {
  const originalFetch = globalThis.fetch
  t.after(() => {
    globalThis.fetch = originalFetch
  })
  const observed: Array<{ authorization: string | null; csrf: string | null }> = []
  globalThis.fetch = async (_input, init) => {
    const headers = new Headers(init?.headers)
    observed.push({
      authorization: headers.get('authorization'),
      csrf: headers.get('x-csrf-token'),
    })
    return jsonResponse({ success: true, data: { ok: true } })
  }

  const headerForms: HeadersInit[] = [
    {
      Authorization: 'Bearer object-token',
      'X-CSRF-Token': 'object-csrf',
    },
    new Headers({
      Authorization: 'Bearer headers-token',
      'X-CSRF-Token': 'headers-csrf',
    }),
    [
      ['Authorization', 'Bearer tuple-token'],
      ['X-CSRF-Token', 'tuple-csrf'],
    ],
  ]

  for (const headers of headerForms) {
    await apiClient.get('https://example.test/api/me', { headers })
  }

  assert.deepEqual(observed, [
    { authorization: 'Bearer object-token', csrf: 'object-csrf' },
    { authorization: 'Bearer headers-token', csrf: 'headers-csrf' },
    { authorization: 'Bearer tuple-token', csrf: 'tuple-csrf' },
  ])
})

test('apiClient surfaces a business failure returned with HTTP 200', async (t) => {
  const originalFetch = globalThis.fetch
  t.after(() => {
    globalThis.fetch = originalFetch
  })
  globalThis.fetch = async () =>
    jsonResponse({ success: false, error: 'Invalid password' })

  const result = await apiClient.post('https://example.test/api/login', {})

  assert.equal(result.success, false)
  assert.equal(result.error, 'Invalid password')
})

test('apiClient normalizes a non-envelope HTTP error', async (t) => {
  const originalFetch = globalThis.fetch
  t.after(() => {
    globalThis.fetch = originalFetch
  })
  globalThis.fetch = async () => jsonResponse({ error: 'Time slot unavailable' }, 409)

  const result = await apiClient.get<never>('https://example.test/api/busy')

  assert.equal(result.success, false)
  assert.equal(result.error, 'Time slot unavailable')
})