'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

const ConditionalFlagsStrip = dynamic(() => import('./ConditionalFlagsStrip'), { ssr: true })

export default function ConditionalHeaderFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  if (isAdminPage) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <ConditionalFlagsStrip />
      <Footer />
    </>
  )
}
