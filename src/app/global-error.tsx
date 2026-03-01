'use client'

import React from 'react'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
  const message = error?.message || 'An unexpected error occurred.'

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui', padding: '2rem', background: '#0a0a0a', color: '#fafafa', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Internal Server Error</h1>
        {isDev && (
          <pre style={{ marginBottom: '1rem', padding: '1rem', background: '#262626', borderRadius: '0.5rem', fontSize: '0.75rem', overflow: 'auto', maxWidth: '100%' }}>
            {message}
          </pre>
        )}
        <p style={{ marginBottom: '1.5rem', color: '#a3a3a3' }}>
          {isDev ? 'Fix the error above and try again.' : 'Please refresh the page.'}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{ padding: '0.5rem 1rem', background: '#044444', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', textDecoration: 'none' }}
          >
            Go to Homepage
          </a>
        </div>
      </body>
    </html>
  )
}
