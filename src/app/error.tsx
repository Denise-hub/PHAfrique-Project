'use client'

import React from 'react'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    console.error('Route error:', error)
    // Auto-redirect admin errors to dashboard
    if (isAdmin && pathname !== '/admin') {
      const timer = setTimeout(() => {
        router.push('/admin')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [error, isAdmin, pathname, router])

  if (isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Something went wrong
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Redirecting you back to the dashboard...
          </p>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#044444] hover:bg-[#033333] text-white font-semibold rounded-lg transition-all"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        Something went wrong
      </h1>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#044444] hover:bg-[#033333] text-white font-semibold rounded-lg transition-all mt-4"
      >
        Go to Homepage
      </a>
    </div>
  )
}
