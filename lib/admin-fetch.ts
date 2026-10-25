// Authenticated fetch — attaches the admin token from localStorage
// so API routes work even when cookies are blocked by the browser.
export function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') ?? '' : ''
  const headers = new Headers(init.headers)
  if (token) headers.set('x-admin-token', token)
  return fetch(input, { ...init, headers })
}
