'use client'

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import AdminShell from '@/components/admin/AdminShell'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  return (
    <SessionProvider>
      {isLoginPage ? (
        <div className="min-h-screen">{children}</div>
      ) : (
        <div className="min-h-screen flex flex-col">
          <AdminShell>{children}</AdminShell>
        </div>
      )}
    </SessionProvider>
  )
}
