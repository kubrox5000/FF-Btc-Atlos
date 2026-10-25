import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveAtlosCredentials } from './atlos-config'

test('Atlos configured only in admin settings is available to payment consumers', async () => {
  const credentials = await resolveAtlosCredentials({}, async () => ({
    atlosMerchantId: ' test-merchant ',
  }))
  assert.equal(credentials.merchantId, 'test-merchant')
})

test('environment configuration takes precedence over admin settings', async () => {
  const credentials = await resolveAtlosCredentials({
    ATLOS_MERCHANT_ID: 'test-server-merchant',
    NEXT_PUBLIC_ATLOS_MERCHANT_ID: 'test-public-merchant',
  }, async () => ({ atlosMerchantId: 'test-admin-merchant' }))
  assert.equal(credentials.merchantId, 'test-server-merchant')
})

test('legacy public environment configuration remains supported', async () => {
  const credentials = await resolveAtlosCredentials({
    NEXT_PUBLIC_ATLOS_MERCHANT_ID: ' test-public-merchant ',
  }, async () => ({}))
  assert.equal(credentials.merchantId, 'test-public-merchant')
})

test('blank environment values fall back to saved settings', async () => {
  const credentials = await resolveAtlosCredentials({ ATLOS_MERCHANT_ID: '  ' },
    async () => ({ atlosMerchantId: 'test-admin-merchant' }))
  assert.equal(credentials.merchantId, 'test-admin-merchant')
})

test('missing or blank configuration leaves Atlos unavailable', async () => {
  const credentials = await resolveAtlosCredentials({}, async () => ({ atlosMerchantId: '  ' }))
  assert.equal(Boolean(credentials.merchantId), false)
})

test('subsequent resolutions reflect saved settings changes and removal', async () => {
  let merchantId = 'test-first-merchant'
  const loadSettings = async () => ({ atlosMerchantId: merchantId })
  assert.equal((await resolveAtlosCredentials({}, loadSettings)).merchantId, merchantId)
  merchantId = 'test-updated-merchant'
  assert.equal((await resolveAtlosCredentials({}, loadSettings)).merchantId, merchantId)
  merchantId = ''
  assert.equal((await resolveAtlosCredentials({}, loadSettings)).merchantId, undefined)
})
