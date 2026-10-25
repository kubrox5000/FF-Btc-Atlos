/**
 * Rate limiter بسيط في الذاكرة لمنع البوتات والطلبات المتكررة.
 * يعمل على مستوى Edge/Node بدون Redis.
 */

interface RateLimitEntry {
  count: number
  firstRequest: number
  lastRequest: number
}

const store = new Map<string, RateLimitEntry>()

// تنظيف الإدخالات القديمة كل دقيقة
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (now - entry.firstRequest > 60_000) store.delete(key)
    }
  }, 60_000)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetIn: number   // milliseconds
}

/**
 * يتحقق من عدد الطلبات لكل IP ضمن نافزة زمنية.
 * @param ip      — عنوان IP
 * @param limit   — الحد الأقصى للطلبات (افتراضي 5)
 * @param windowMs — النافذة الزمنية بالمللي ثانية (افتراضي 60 ثانية)
 */
export function rateLimit(
  ip: string,
  limit = 5,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now - entry.firstRequest > windowMs) {
    // طلب جديد أو انتهت النافذة الزمنية
    store.set(ip, { count: 1, firstRequest: now, lastRequest: now })
    return { allowed: true, remaining: limit - 1, resetIn: windowMs }
  }

  entry.count++
  entry.lastRequest = now

  if (entry.count > limit) {
    const resetIn = windowMs - (now - entry.firstRequest)
    return { allowed: false, remaining: 0, resetIn: Math.max(0, resetIn) }
  }

  return { allowed: true, remaining: limit - entry.count, resetIn: windowMs - (now - entry.firstRequest) }
}

/**
 * يتحقق من User-Agent — البوتات غالباً ترسل بدون UA أو بـ UA مشبوه.
 */
export function isSuspiciousUserAgent(ua: string | null): boolean {
  if (!ua || ua.trim().length < 10) return true
  const lc = ua.toLowerCase()
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'python-requests',
    'curl/', 'wget/', 'postman', 'insomnia', 'httpie',
    'java/', 'go-http', 'axios/', 'node-fetch', 'undici',
  ]
  return botPatterns.some((p) => lc.includes(p))
}
