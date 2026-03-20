'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type ContactMessage = {
  id: string
  name: string
  email: string
  phone: string | null
  need: string | null
  message: string
  createdAt: string
}

export default function AdminContactMessagesPage() {
  const [list, setList] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/contact-messages', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin" className="text-sm text-[#044444] dark:text-[#44AAAA] hover:underline inline-flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="heading-2">Contact Messages</h1>
        <p className="text-sm text-neutral-500">Messages submitted from the Contact Us page.</p>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : list.length === 0 ? (
        <p className="py-8 text-neutral-500 text-center">No contact messages yet.</p>
      ) : (
        <div className="space-y-4">
          {list.map((m) => (
            <article key={m.id} className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">{m.name}</h2>
                <span className="text-xs text-neutral-500">{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                <a href={`mailto:${m.email}`} className="text-[#044444] dark:text-[#44AAAA] hover:underline">{m.email}</a>
                {m.phone ? ` · ${m.phone}` : ''}
                {m.need ? ` · ${m.need}` : ''}
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre-wrap mt-3">{m.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

