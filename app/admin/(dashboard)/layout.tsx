'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [username, setUsername] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
    const headers: Record<string, string> = {}
    if (storedToken) headers['x-admin-token'] = storedToken

    fetch('/api/admin/me', { headers })
      .then(r => r.json())
      .then((d: { username?: string; error?: string }) => {
        if (d.username) {
          setUsername(d.username)
        } else {
          router.replace('/admin')
        }
      })
      .catch(() => router.replace('/admin'))
      .finally(() => setChecking(false))
  }, [pathname])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-2xl diamond-float">💎</span>
      </div>
    )
  }

  if (!username) return null

  return <AdminShell username={username}>{children}</AdminShell>
}
