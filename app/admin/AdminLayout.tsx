'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Package as PackageIcon,
  Gift,
  Star,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Menu,
  X,
  LogOut,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/auth'
import { SITE_NAME } from '@/lib/constants'

const navItems = [
  { icon: LayoutDashboard, label: 'דשבורד', href: '/admin' },
  { icon: Users, label: 'לידים', href: '/admin/leads' },
  { icon: PackageIcon, label: 'מוצרים', href: '/admin/products' },
  { icon: Gift, label: 'חבילות', href: '/admin/packages' },
  { icon: Star, label: 'ביקורות', href: '/admin/reviews' },
  { icon: ImageIcon, label: 'תמונות', href: '/admin/images' },
  { icon: SettingsIcon, label: 'הגדרות', href: '/admin/settings' },
]

function getPageTitle(pathname: string): string {
  if (pathname === '/admin') return 'דשבורד'
  for (const item of navItems) {
    if (item.href !== '/admin' && pathname.startsWith(item.href)) return item.label
  }
  if (pathname === '/admin/login') return 'כניסה'
  return 'אדמין'
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, isAdmin, isDemo } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-soft" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Login page or unauthenticated → render children only (so /admin/login is reachable)
  if (!user || !isAdmin) {
    return <>{children}</>
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace('/admin/login')
  }

  const title = getPageTitle(pathname || '/admin')

  return (
    <div className="min-h-screen bg-bg-soft" dir="rtl">
      {isDemo && (
        <div className="bg-yellow-100 border-b-2 border-yellow-400 text-yellow-900 text-sm py-2 px-4 text-center font-medium">
          מצב Demo (לוקאלי בלבד) — Firebase לא מחובר. שינויים לא יישמרו.
        </div>
      )}
      <header className="bg-white border-b border-primary-soft sticky top-0 z-40">
        <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="פתח תפריט"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-text-dark truncate">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" rel="noopener">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                <ExternalLink className="w-4 h-4 ml-1" />
                לאתר
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-accent hover:bg-primary-soft"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 sm:ml-2" />
              <span className="hidden sm:inline">התנתק</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`fixed lg:sticky top-0 right-0 h-screen bg-white border-l border-primary-soft transition-transform duration-300 z-50 lg:translate-x-0 w-64 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 border-b border-primary-soft flex justify-between items-center">
            <div className="min-w-0">
              <p className="font-bold text-lg text-text-dark truncate">{SITE_NAME}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="סגור תפריט"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-160px)]">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                    isActive
                      ? 'bg-primary-soft text-text-dark font-semibold'
                      : 'text-gray-700 hover:bg-primary-soft/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-0 right-0 left-0 p-3 border-t border-primary-soft bg-white">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 ml-2" />
              התנתק
            </Button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
