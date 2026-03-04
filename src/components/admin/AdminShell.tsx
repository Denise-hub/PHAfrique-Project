'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import { canAccessSection, effectiveRole, type AdminSection } from '@/lib/roles'

// Main navigation definition for the admin area. Each entry maps a route
// to a label, an icon name, and the permission "section" it belongs to.
// Permissions are enforced both here (for the visible menu) and on the API.
const navItems: { href: string; label: string; icon: string; section: AdminSection }[] = [
  { href: '/admin', label: 'Dashboard', icon: 'grid', section: 'dashboard' },
  { href: '/admin/programs', label: 'Programs', icon: 'briefcase', section: 'programs' },
  { href: '/admin/projects', label: 'Portfolio', icon: 'folder', section: 'projects' },
  { href: '/admin/opportunities', label: 'Opportunities', icon: 'calendar', section: 'opportunities' },
  { href: '/admin/applications', label: 'Applications', icon: 'users', section: 'applications' },
  { href: '/admin/events', label: 'News', icon: 'newspaper', section: 'news' },
  { href: '/admin/content', label: 'Content', icon: 'file', section: 'content' },
  { href: '/admin/images', label: 'Gallery', icon: 'image', section: 'gallery' },
  { href: '/admin/users', label: 'Users', icon: 'users-cog', section: 'users' },
  { href: '/admin/profile', label: 'Profile', icon: 'user', section: 'profile' },
]

const getIcon = (iconName: string) => {
  const className = 'h-5 w-5'
  switch (iconName) {
    case 'grid':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    case 'briefcase':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    case 'folder':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    case 'calendar':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'users':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    case 'newspaper':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6m4 4h.01M17 16h.01M17 8h.01M7 12h.01M17 12h.01M12 16h.01M12 8h.01" />
        </svg>
      )
    case 'file':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    case 'image':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'users-cog':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    case 'user':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    default:
      return null
  }
}

// Top‑level layout shell for all authenticated admin pages.
// Handles:
// - Role‑based visibility of navigation items
// - Guarding against visiting sections the current role cannot access
// - Responsive layout (fixed sidebar on desktop, slide‑in drawer on mobile)
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const isLogin = pathname === '/admin/login'
  const role = (session?.user as { role?: string } | undefined)?.role
  const effective = effectiveRole(role)
  const allowedNavItems = navItems.filter((item) => canAccessSection(effective, item.section))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentSection = pathname === '/admin' ? 'dashboard' : navItems.find((n) => pathname?.startsWith(n.href))?.section
  useEffect(() => {
    if (isLogin || status !== 'authenticated') return
    if (currentSection && !canAccessSection(effective, currentSection)) {
      router.replace('/admin')
    }
  }, [currentSection, effective, status, isLogin, router])

  if (isLogin) {
    return <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">{children}</div>
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col md:flex-row">
      {/* Sidebar (desktop + slide-in on mobile) */}
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-gradient-to-b from-[#044444] to-[#033333] text-white flex flex-col shadow-xl transform transition-transform duration-200 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/assets/logos/TRANSPARENT-MAIN-LOGO-ico.png"
              alt="PHAfrique"
              width={40}
              height={40}
              className="h-8 w-auto object-contain"
              unoptimized
            />
            <div>
              <div className="font-bold text-lg text-[#FF0000]">Admin Panel</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {allowedNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {getIcon(item.icon)}
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/admin/profile"
            className="mb-3 flex items-center gap-3 rounded-lg px-4 py-2 text-left transition-colors hover:bg-white/10"
          >
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-full border-2 border-white/30 object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-semibold text-white">
                {(session?.user?.name || session?.user?.email || 'A')[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-white">
                {session?.user?.name || session?.user?.email || 'Admin'}
              </div>
              <div className="truncate text-xs text-white/70">{session?.user?.email}</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content - min-w-0 allows flex child to shrink; margin-left only on md+ so mobile gets full width */}
      <div className="flex-1 min-w-0 flex flex-col md:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 shrink-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6">
            <div className="min-w-0 flex items-center gap-3 sm:gap-4">
              {/* Mobile menu button */}
              <button
                type="button"
                className="inline-flex md:hidden items-center justify-center rounded-lg p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#044444]"
                aria-label="Open navigation menu"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
                {pathname === '/admin'
                  ? 'Dashboard'
                  : allowedNavItems
                      .filter((item) => item.href !== '/admin' && pathname?.startsWith(item.href))
                      .sort((a, b) => b.href.length - a.href.length)[0]?.label || 'Admin'}
              </h1>
            </div>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 hidden xs:flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-[#044444] dark:text-[#44AAAA] hover:bg-[#044444]/10 dark:hover:bg-[#044444]/20 rounded-lg transition-all"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="hidden sm:inline">View Site</span>
            </Link>
          </div>
        </header>

        {/* Page Content - scrolls when content is wide, with padding that works on mobile */}
        <main className="flex-1 min-h-0 overflow-x-auto overflow-y-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
