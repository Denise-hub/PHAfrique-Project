'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type P = { id: string; title: string; slug: string; description: string | null; imageUrl: string | null; link: string | null; publishedAt: string | null; sortOrder: number }

export default function AdminProjectsPage() {
  const [list, setList] = useState<P[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [edit, setEdit] = useState<P | null>(null)
  const [form, setForm] = useState({ title: '', description: '', imageFile: null as File | null })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  function load() {
    fetch('/api/admin/projects', { credentials: 'include' }).then((r) => r.json()).then(setList).catch(() => setList([])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  function openAdd() {
    setForm({ title: '', description: '', imageFile: null })
    setEdit(null)
    setErr('')
    setFormOpen(true)
  }
  function openEdit(p: P) {
    setForm({ title: p.title, description: p.description || '', imageFile: null })
    setEdit(p)
    setErr('')
    setFormOpen(true)
  }
  function close() { setFormOpen(false); setEdit(null) }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setErr('Title is required'); return }
    setBusy(true)
    setErr('')
    try {
      const url = edit ? `/api/admin/projects/${edit.id}` : '/api/admin/projects'
      const method = edit ? 'PUT' : 'POST'
      const data = new FormData()
      data.append('title', form.title.trim())
      if (form.description.trim()) data.append('description', form.description.trim())
      if (form.imageFile) data.append('image', form.imageFile)
      const r = await fetch(url, { method, body: data })
      const j = await r.json().catch(() => ({ error: 'Invalid response' }))
      if (!r.ok) { setErr(j.error || 'Failed'); setBusy(false); return }
      load()
      close()
    } catch {
      setErr('An error occurred. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this portfolio item?')) return
    setBusy(true)
    const r = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
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
        <h1 className="heading-2">Portfolio</h1>
        <button type="button" onClick={openAdd} className="btn-primary">Add portfolio item</button>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-800 shadow-xl" data-form-version="simple">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 px-4 py-3 rounded-t-xl">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {edit ? 'Edit portfolio item' : 'Add portfolio item'}
              </h2>
              <button type="button" onClick={close} className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" aria-label="Close">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-4 space-y-3">
              {err && (
                <div className="p-2 rounded-md bg-[#FF0000]/10 border border-[#FF0000]/30">
                  <p className="text-xs text-[#FF0000]">{err}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Title <span className="text-[#FF0000]">*</span>
                </label>
                <input
                  placeholder="e.g. Mental Health Support"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={`${inp} py-1.5`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Brief description for the card."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={`${inp} py-1.5 resize-y min-h-[80px]`}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Image
                </label>
                {edit && edit.imageUrl && !form.imageFile && (
                  <p className="text-xs text-neutral-500 mb-1 truncate">Current: {edit.imageUrl}</p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm((f) => ({ ...f, imageFile: e.target.files?.[0] ?? null }))}
                  className={`${inp} py-1.5 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[#044444] file:text-white`}
                />
                <p className="mt-0.5 text-xs text-neutral-500">
                  {edit ? 'Leave empty to keep current image.' : 'Upload from your device.'}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 px-4 py-2 text-sm rounded-lg bg-[#044444] hover:bg-[#033333] text-white font-medium disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#044444] focus:ring-offset-1"
                >
                  {busy ? 'Saving...' : edit ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="px-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : (
        <div className="space-y-4">
          {list.map((p) => (
            <div key={p.id} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 flex justify-between items-start gap-4">
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">{p.title}</div>
                {p.description && <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{p.description}</div>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => openEdit(p)} className="text-sm text-[#044444] dark:text-[#44AAAA] hover:underline">Edit</button>
                <button type="button" onClick={() => onDelete(p.id)} disabled={busy} className="text-sm text-[#FF0000] dark:text-[#FF6666] hover:underline">Delete</button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="py-8 text-neutral-500 text-center">No portfolio items yet.</p>}
        </div>
      )}
    </div>
  )
}
