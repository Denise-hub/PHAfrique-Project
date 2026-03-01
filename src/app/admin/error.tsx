'use client'

import React from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Admin error:', error)
    // Auto-redirect to dashboard after a short delay
    const timer = setTimeout(() => {
      router.push('/admin')
    }, 2000)
    return () => clearTimeout(timer)
  }, [error, router])

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
