'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleAvailable, setGoogleAvailable] = useState(false)
  const [callbackUrl, setCallbackUrl] = useState('/admin')
  const [showDebugLink, setShowDebugLink] = useState(false)
  const router = useRouter()

  // Show troubleshoot link only after mount to avoid server/client HTML mismatch (hydration error)
  useEffect(() => { setShowDebugLink(true) }, [])

  // Initialize callbackUrl and check for errors
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location) {
      try {
        const search = window.location.search || ''
        const params = new URLSearchParams(search)
        const url = params.get('callbackUrl')
        if (url) {
          setCallbackUrl(url)
        }

        const urlError = params.get('error')
        if (urlError === 'AccessDenied' || urlError === 'Unauthorized' || urlError === 'CredentialsSignin') {
          setError('You are not allowed to log in because you are not a registered admin.')
        } else if (urlError === 'Configuration') {
          setError('Auth is misconfigured. Set NEXTAUTH_SECRET, NEXTAUTH_URL, and ADMIN_PASSWORD in Vercel Environment Variables, then redeploy.')
        } else if (urlError) {
          setError('Authentication failed.')
        }
      } catch (err) {
        console.error('Error parsing URL:', err)
      }
    }
  }, [])
  
  // Check if Google OAuth is available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('/api/auth/providers')
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch providers')
          }
          return res.json()
        })
        .then(providers => {
          if (providers && typeof providers === 'object') {
            setGoogleAvailable(!!providers.google)
          } else {
            setGoogleAvailable(false)
          }
        })
        .catch((err) => {
          console.error('Error checking Google OAuth:', err)
          setGoogleAvailable(false)
        })
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // Use redirect: true so the server sets the session cookie and the browser
      // follows the redirect to callbackUrl on success (or to login?error=... on failure).
      // This avoids client-side parsing bugs with redirect: false and ensures the cookie is sent.
      await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: true,
        callbackUrl,
      })
      setLoading(false)
    } catch (err) {
      console.error('Login exception:', err)
      setLoading(false)
      setError('An error occurred. Please try again.')
    }
  }

  async function handleGoogleSignIn() {
    setError('')
    setGoogleLoading(true)
    try {
      await signIn('google', {
        callbackUrl,
        redirect: true,
      })
    } catch (err) {
      console.error('Google sign-in exception:', err)
      setGoogleLoading(false)
      setError('Google sign-in failed. Please check your Google OAuth configuration or use email/password login.')
    }
  }

  return (
    <div className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 overflow-hidden">
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div className="grid lg:grid-cols-2 h-[600px] max-h-[90vh]">
          {/* Left Panel - Branding */}
          <div className="hidden lg:flex flex-col justify-between p-6 bg-gradient-to-br from-[#044444] via-[#033333] to-[#022222] text-white">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <Image
                  src="/assets/logos/TRANSPARENT-MAIN-LOGO-ico.png"
                  alt="PHAfrique Project"
                  width={80}
                  height={26}
                  className="h-7 w-auto object-contain"
                  unoptimized
                />
              </Link>
              <h2 className="text-xl font-bold mb-2">Welcome to PHAfrique Admin</h2>
              <p className="text-white/90 text-sm leading-relaxed">
                Manage your content, events, programs, and applications. Access your dashboard to oversee all aspects of PHAfrique Project&apos;s digital presence.
              </p>
            </div>
            <div className="rounded-lg bg-[#044444]/40 backdrop-blur-sm border border-white/20 p-3">
              <p className="text-white/90 italic text-xs leading-relaxed">
                &quot;Advancing public health in Africa through innovative programs and community engagement.&quot;
              </p>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="flex items-center justify-center p-4 sm:p-6 lg:p-6 overflow-y-auto">
            <div className="w-full max-w-md">
              <div className="lg:hidden mb-4 text-center">
                <Link href="/" className="inline-flex items-center gap-2 mb-3">
                <Image
                  src="/assets/logos/TRANSPARENT-MAIN-LOGO-ico.png"
                  alt="PHAfrique Project"
                  width={80}
                  height={26}
                  className="h-7 w-auto object-contain"
                  unoptimized
                />
                </Link>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Admin Login</h2>
              </div>
              <div className="hidden lg:block mb-4">
                <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  Sign in to your account
                </h1>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Access your dashboard and manage your PHAfrique content
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 p-4 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-3">
                  {error && (
                    <div className="rounded-lg bg-[#FFE5E5] dark:bg-[#FF0000]/20 border border-[#FF0000]/30 px-3 py-2 text-xs text-[#CC0000] dark:text-[#FF6666]">
                      {error}
                    </div>
                  )}
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="denmaombi@gmail.com"
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-[#044444] focus:ring-2 focus:ring-[#044444]/20 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 pr-10 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-[#044444] focus:ring-2 focus:ring-[#044444]/20 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#044444]/20"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full rounded-lg bg-[#044444] hover:bg-[#033333] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#044444] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-300 dark:border-neutral-600"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-neutral-800/50 px-2 text-neutral-500">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign-In Button */}
                {googleAvailable ? (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading || googleLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#044444]/20 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {googleLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent"></div>
                        <span>Signing in with Google…</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Sign in with Google</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/30 px-4 py-3 text-center">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Google Sign-In not configured. Use email/password login.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 text-center space-y-1">
                <Link href="/" className="text-xs text-neutral-500 hover:text-[#044444] dark:hover:text-[#FF0000] transition-colors block">
                  ← Back to website
                </Link>
                {showDebugLink && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                  <a href="/api/debug/auth-diagnostic" target="_blank" rel="noopener noreferrer" className="text-xs text-neutral-400 hover:text-[#044444] dark:hover:text-neutral-400 block">
                    Troubleshoot: check auth state
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
