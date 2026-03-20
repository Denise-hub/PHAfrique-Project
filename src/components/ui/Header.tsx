'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

type NavLink = { href: string; label: string }
type NavDropdown = { label: string; items: NavLink[] }

const TOP_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/portfolios', label: 'Portfolios' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/contact', label: 'Contact' },
]

const DROPDOWNS: NavDropdown[] = []

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  return pathname === href || (href !== '/' && pathname.startsWith(href))
}

function isDropdownActive(pathname: string | null, items: NavLink[]): boolean {
  return items.some((item) => isActive(pathname, item.href))
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpenDropdown(null)
    setOpenMobileDropdown(null)
  }, [pathname])

  useEffect(() => {
    if (!openDropdown) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const navStyle = isScrolled
    ? 'bg-[#044444] shadow-xl border-[#044444]'
    : 'bg-white/80 dark:bg-neutral-900/80 shadow-lg border-neutral-200/50 dark:border-neutral-700/50'

  // Brand red in all states: default, scrolled (green bar), and dark mode
  const linkClass = (active: boolean) =>
    `text-base md:text-lg font-bold tracking-tight transition-all text-[#FF0000] dark:text-[#FF0000] ${
      active
        ? 'underline decoration-2 decoration-[#FF0000] underline-offset-4'
        : 'hover:underline decoration-2 decoration-transparent hover:decoration-[#FF0000] underline-offset-4'
    }`

  const borderClass = isScrolled ? 'border-white/20' : 'border-neutral-200 dark:border-neutral-700'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="h-1 w-full flex-shrink-0 bg-gradient-to-r from-primary-600 to-[#FF0000]" aria-hidden />
      <div className="px-4 pt-3">
        <nav
          className={`pointer-events-auto max-w-5xl sm:max-w-6xl mx-auto rounded-3xl md:rounded-full border backdrop-blur-md transition-all duration-300 ${navStyle}`}
          aria-label="Main"
        >
          <div className="flex h-20 md:h-[80px] items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <Image
                src="/assets/logos/TRANSPARENT-MAIN-LOGO-ico.png"
                alt="Public Health Corps Africa"
                width={260}
                height={84}
                className="h-16 md:h-20 w-auto object-contain"
                priority
                unoptimized
              />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-2 md:gap-5">
              {TOP_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={linkClass(isActive(pathname, l.href))}>
                  {l.label}
                </Link>
              ))}
              {DROPDOWNS.map((dd) => {
                const isOpen = openDropdown === dd.label
                const active = isDropdownActive(pathname, dd.items)
                return (
                  <div key={dd.label} className="relative" ref={isOpen ? dropdownRef : undefined}>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(isOpen ? null : dd.label)}
                      className={`${linkClass(active)} cursor-pointer bg-transparent border-0`}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      aria-label={`${dd.label} menu`}
                    >
                      {dd.label}
                    </button>
                    {isOpen && (
                      <div
                        className="absolute top-full left-0 mt-2 py-2 min-w-[180px] rounded-xl bg-white dark:bg-neutral-800 shadow-xl z-50 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden"
                        role="menu"
                      >
                        <div className="border-l-4 border-[#044444] dark:border-[#44AAAA] bg-gradient-to-b from-[#044444]/5 to-transparent dark:from-[#44AAAA]/10 dark:to-transparent py-1">
                          {dd.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              role="menuitem"
                              className={`block px-4 py-2.5 text-base font-bold text-[#FF0000] dark:text-[#FF0000] transition-all duration-200 ${
                                isActive(pathname, item.href)
                                  ? 'bg-[#FF0000]/10 dark:bg-[#FF0000]/20'
                                  : 'hover:bg-[#FF0000]/10 dark:hover:bg-[#FF0000]/15'
                              }`}
                              onClick={() => setOpenDropdown(null)}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              <button
                type="button"
                onClick={() => toggleTheme()}
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled
                    ? 'text-white hover:text-white hover:bg-white/10'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-[#044444] dark:hover:text-[#FF0000] hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
            </div>

            {/* Mobile: theme + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => toggleTheme()}
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled ? 'text-white hover:text-white hover:bg-white/10' : 'text-neutral-600 dark:text-neutral-400 hover:text-[#FF0000]'
                }`}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen((o) => !o)}
                className={`p-2 transition-colors ${isScrolled ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'}`}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu with expandable dropdowns */}
          {isMobileMenuOpen && (
            <div className={`md:hidden px-4 pb-5 pt-2 border-t ${borderClass}`}>
              <div className="flex flex-col gap-1">
                {TOP_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`py-3 px-3 rounded-lg text-base sm:text-lg font-bold text-[#FF0000] dark:text-[#FF0000] transition-all ${
                      isActive(pathname, l.href)
                        ? 'bg-white/10 dark:bg-neutral-800/50 underline decoration-2 decoration-[#FF0000] underline-offset-4'
                        : isScrolled
                        ? 'hover:bg-white/10'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {l.label}
                  </Link>
                ))}
                {DROPDOWNS.map((dd) => {
                  const isExpanded = openMobileDropdown === dd.label
                  return (
                    <div key={dd.label}>
                      <button
                        type="button"
                        onClick={() => setOpenMobileDropdown(isExpanded ? null : dd.label)}
                        className={`w-full text-left py-3 px-3 rounded-lg text-base sm:text-lg font-bold text-[#FF0000] dark:text-[#FF0000] transition-all ${
                          isDropdownActive(pathname, dd.items)
                            ? 'bg-white/10 dark:bg-neutral-800/50'
                            : isScrolled ? 'hover:bg-white/10' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                        aria-expanded={isExpanded}
                      >
                        {dd.label}
                      </button>
                      {isExpanded && (
                        <div className="mt-1 ml-2 pl-3 pb-1 flex flex-col gap-0.5 border-l-2 border-[#044444]/30 dark:border-[#44AAAA]/40 rounded-b-lg">
                          {dd.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`py-2.5 px-3 rounded-lg text-base font-bold text-[#FF0000] dark:text-[#FF0000] transition-all ${
                                isActive(pathname, item.href)
                                  ? 'bg-[#FF0000]/15 dark:bg-[#FF0000]/25'
                                  : 'hover:bg-[#FF0000]/10 dark:hover:bg-[#FF0000]/15'
                              }`}
                              onClick={() => { setIsMobileMenuOpen(false); setOpenMobileDropdown(null); }}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
