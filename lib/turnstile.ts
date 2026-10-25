/**
 * Verifies a Cloudflare Turnstile token server-side.
 * Returns true if the token is valid; false otherwise.
 */
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // dev: skip if no secret configured

  const form = new URLSearchParams()
  form.append('secret', secret)
  form.append('response', token)

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    const data = (await res.json()) as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}
