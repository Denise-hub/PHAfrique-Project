'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type ContentRow = { id: string; key: string; value: string }

export default function AdminContentPage() {
  const [list, setList] = useState<ContentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editKey, setEditKey] = useState<string | null>(null)
  const [form, setForm] = useState({ key: '', value: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  function load() {
    fetch('/api/admin/content', { credentials: 'include' }).then((r) => r.json()).then(setList).catch(() => setList([])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  function openAdd() {
    setForm({ key: '', value: '' })
    setEditKey(null)
    setErr('')
    setFormOpen(true)
  }
  function openEdit(r: ContentRow) {
    setForm({ key: r.key, value: r.value })
    setEditKey(r.key)
    setErr('')
    setFormOpen(true)
  }
  function close() { setFormOpen(false); setEditKey(null) }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.key.trim()) { setErr('Key required'); return }
    setBusy(true)
    setErr('')
    const r = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: form.key.trim(), value: form.value }),
    })
    const j = await r.json()
    setBusy(false)
    if (!r.ok) { setErr(j.error || 'Failed'); return }
    load()
    close()
  }

  async function onDelete(key: string) {
    if (!confirm(`Delete content key "${key}"?`)) return
    setBusy(true)
    const r = await fetch(`/api/admin/content/${encodeURIComponent(key)}`, { method: 'DELETE' })
    setBusy(false)
    if (r.ok) load()
  }

  const inp = 'w-full rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm'

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading-2">Content</h1>
        <button type="button" onClick={openAdd} className="btn-primary">Add key</button>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">{editKey ? 'Edit content' : 'Add content key'}</h2>
            <form onSubmit={onSubmit} className="space-y-3">
              {err && <p className="text-sm text-[#FF0000]">{err}</p>}
              <input placeholder="Key (e.g. hero_subtitle, contact_email)" value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} className={inp} required disabled={!!editKey} />
              <textarea placeholder="Value (text or JSON)" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} className={inp} rows={4} />
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={busy} className="btn-primary flex-1">Save</button>
                <button type="button" onClick={close} className="px-4 py-2 rounded border dark:border-neutral-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <p className="text-neutral-500">Loading…</p> : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 flex justify-between items-start gap-4">
              <div className="min-w-0">
                <div className="font-mono font-medium text-neutral-900 dark:text-neutral-100">{r.key}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 break-words line-clamp-2">{r.value}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => openEdit(r)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Edit</button>
                <button type="button" onClick={() => onDelete(r.key)} disabled={busy} className="text-sm text-[#FF0000] dark:text-[#FF6666] hover:underline">Delete</button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="py-8 text-neutral-500 text-center">No content keys yet. Add keys such as hero_subtitle, mission, contact_email to reuse in the site.</p>}
        </div>
      )}
    </div>
  )
}
