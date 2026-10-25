import { db } from '@/db'
import { paymentMethods } from '@/db/schemas'
import { eq } from 'drizzle-orm'

async function main() {
  const rows = await db.select({ key: paymentMethods.key, cat: paymentMethods.cat }).from(paymentMethods)
  console.log(JSON.stringify(rows))
  // Update BINANCE_PAY to wallet if it's crypto
  const bp = rows.find(r => r.key === 'BINANCE_PAY')
  console.log('BINANCE_PAY cat:', bp?.cat)
  process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
