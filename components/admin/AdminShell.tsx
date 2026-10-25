'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, ShoppingCart, Package, Wallet, Settings, LogOut, Menu, X, ExternalLink, Download, Database, Star, FileCode } from 'lucide-react'
import { cn } from '@/utils/cn'
import { adminFetch } from '@/lib/admin-fetch'

const nav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/packages', label: 'Packages', icon: Package },
  { href: '/admin/most-requested', label: 'Most Requested', icon: Star },
  { href: '/admin/payment-methods', label: 'Payment Methods', icon: Wallet },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/database', label: 'Database', icon: Database },
]

export function AdminShell({ username, children }: { username: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  async function logout() {
    await adminFetch('/api/admin/logout', { method: 'POST' })
    localStorage.removeItem('admin_token')
    router.push('/admin')
    router.refresh()
  }

  async function downloadProject() {
    setDownloading(true)
    try {
      const res = await adminFetch('/api/admin/download-project')
      if (!res.ok) throw new Error('download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'ff-diamond-project.zip'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <Link href="/admin/dashboard" className="flex items-center gap-2 px-2 py-4" translate="no">
        <span className="text-xl diamond-float leading-none">💎</span>
        <span className="font-extrabold text-gradient">FF Diamond</span>
      </Link>

      <nav className="mt-4 flex-1 space-y-1">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === n.href
                ? 'bg-primary/15 text-foreground'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border pt-3">
        <button
          onClick={downloadProject}
          disabled={downloading}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground disabled:opacity-60"
        >
          <Download className="h-4 w-4" /> {downloading ? 'Preparing…' : 'Download Project'}
        </button>
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground">
          <ExternalLink className="h-4 w-4" /> View Store
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-border bg-card/40 px-3 lg:block">
        <div className="sticky top-0 h-screen">{SidebarContent}</div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card/40 px-4 py-3 lg:hidden">
        <span className="font-extrabold" translate="no">FF Diamond Admin</span>
        <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg border border-border">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-card px-3">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-4 grid h-8 w-8 place-items-center rounded-lg">
              <X className="h-5 w-5" />
            </button>
            {SidebarContent}
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-6">
        <div className="mb-6 hidden items-center justify-between lg:flex">
          <span className="text-sm text-muted-foreground">
            Signed in as <span className="font-semibold text-foreground" translate="no">{username}</span>
          </span>
        </div>
        {children}
      </main>
    </div>
  )
}
