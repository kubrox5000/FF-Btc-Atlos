import 'server-only'
import { getSettings } from '@/lib/settings'
import type { Order } from '@/db/schemas'

export async function notifyTelegramPayment(order: Order, gateway: string): Promise<boolean> {
  const settings = await getSettings()
  const token = settings.telegramBotToken.trim()
  const chatId = settings.telegramChatId.trim()
  if (!token || !chatId) return false

  const text = [
    '✅ Payment completed',
    `Order: ${order.orderNumber}`,
    `Package: ${order.diamonds.toLocaleString()} diamonds`,
    `Amount: $${order.amountUsd}`,
    `Gateway: ${gateway}`,
    `Player UID: ${order.playerUid}`,
    order.nickname ? `Nickname: ${order.nickname}` : null,
    order.txId ? `Transaction: ${order.txId}` : null,
  ].filter(Boolean).join('\n')

  const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Telegram returned HTTP ${response.status}`)
  const result = await response.json() as { ok?: boolean }
  if (!result.ok) throw new Error('Telegram rejected the message')
  return true
}
