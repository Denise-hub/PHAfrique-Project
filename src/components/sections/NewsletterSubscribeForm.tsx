'use client'

import React, { useState } from 'react'

export default function NewsletterSubscribeForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccess(false)

    try {
      const res = await fetch('/api/newsletters/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setSuccess(true)
        setMessage('Thank you for subscribing!')
        setEmail('')
      } else {
        setMessage(data.error || 'Failed to subscribe')
      }
    } catch (err) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-[#044444]/10 to-[#033333]/10 dark:from-[#044444]/20 dark:to-[#033333]/20 rounded-2xl p-6 md:p-8 border border-[#044444]/20 shadow-sm max-w-3xl mx-auto mb-12 flex flex-col md:flex-row items-center gap-6">
      <div className="flex-1">
        <h3 className="text-xl md:text-2xl font-bold text-[#044444] dark:text-[#44AAAA] mb-2">
          Subscribe to our Newsletter
        </h3>
        <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-300">
          Get the latest updates, stories, and public health insights delivered directly to your inbox.
        </p>
      </div>
      <div className="w-full md:w-auto min-w-[300px]">
        {success ? (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-xl text-center font-medium">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-2 relative">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-3 text-sm shadow-sm focus:border-[#FF0000] focus:ring-2 focus:ring-[#FF0000]/20 focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#FF0000] hover:bg-[#cc0000] disabled:bg-[#FF0000]/50 text-white font-semibold px-6 py-3 text-sm shadow-md transition-colors shrink-0"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            {message && <p className="text-sm text-red-500 mt-1">{message}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
