'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { effectiveRole, ROLES } from '@/lib/roles'

type P = { id: string; title: string; slug: string; description: string | null; imageUrl: string | null; sortOrder: number }

export default function AdminProgramsPage() {
  const { data: session } = useSession()
  const rawRole = (session?.user as { role?: string } | undefined)?.role
  const role = effectiveRole(rawRole)
  const canManage = role === ROLES.SUPER_ADMIN || role === ROLES.CO_FOUNDER

  const [list, setList] = useState<P[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [edit, setEdit] = useState<P | null>(null)
  const [form, setForm] = useState({ title: '', slug: '', description: '', imageFile: null as File | null, sortOrder: 0 })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  function load() {
    setLoading(true)
    fetch('/api/admin/programs', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`)
        }
        return r.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setList(data)
        } else {
          setList([])
        }
      })
      .catch((err) => {
        console.error('Error loading programs:', err)
        setList([])
      })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  function openAdd() {
    if (!canManage) return
    setForm({ title: '', slug: '', description: '', imageFile: null, sortOrder: 0 })
    setEdit(null)
    setErr('')
    setFormOpen(true)
  }
  function openEdit(p: P) {
    if (!canManage) return
    setForm({ title: p.title, slug: p.slug, description: p.description || '', imageFile: null, sortOrder: p.sortOrder })
    setEdit(p)
    setErr('')
    setFormOpen(true)
  }
  function close() { setFormOpen(false); setEdit(null) }

  function slugFromTitle(t: string) {
    return t.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setErr('Title required'); return }
    const slug = form.slug.trim() || slugFromTitle(form.title)
    setBusy(true)
    setErr('')
    try {
      const url = edit ? `/api/admin/programs/${edit.id}` : '/api/admin/programs'
      const method = edit ? 'PUT' : 'POST'
      const data = new FormData()
      data.append('title', form.title.trim())
      data.append('slug', slug)
      if (form.description.trim()) data.append('description', form.description.trim())
      data.append('sortOrder', String(form.sortOrder))
      if (form.imageFile) data.append('image', form.imageFile)
      const r = await fetch(url, { method, body: data })
      const j = await r.json().catch(() => ({ error: 'Invalid response' }))
      if (!r.ok) {
        setErr(j.error || 'Failed')
        setBusy(false)
        return
      }
      load()
      close()
    } catch (err) {
      console.error('Error submitting form:', err)
      setErr('An error occurred. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id: string) {
    if (!canManage) return
    if (!confirm('Delete this program?')) return
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/programs/${id}`, { method: 'DELETE' })
      if (r.ok) {
        load()
      } else {
        const j = await r.json().catch(() => ({}))
        alert(j.error || 'Failed to delete')
      }
    } catch (err) {
      console.error('Error deleting program:', err)
      alert('An error occurred. Please try again.')
    } finally {
      setBusy(false)
    }
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
        <h1 className="heading-2">Programs</h1>
        {canManage && (
          <button type="button" onClick={openAdd} className="btn-primary">
            Add program
          </button>
        )}
      </div>

      {formOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{edit ? 'Edit program' : 'Add program'}</h2>
            <form onSubmit={onSubmit} className="space-y-3">
              {err && <p className="text-sm text-[#FF0000]">{err}</p>}
              <input placeholder="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || slugFromTitle(e.target.value) }))} className={inp} required />
              <input placeholder="Slug (auto from title if empty)" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={inp} />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inp} rows={2} />
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm((f) => ({ ...f, imageFile: e.target.files?.[0] ?? null }))}
                  className={inp}
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Upload a high-quality image for the program card. Leave empty to keep existing image when editing.</p>
              </div>
              <input type="number" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))} className={inp} />
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={busy} className="btn-primary flex-1">Save</button>
                <button type="button" onClick={close} className="px-4 py-2 rounded border dark:border-neutral-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <p className="text-neutral-500">Loading…</p> : (
        <div className="space-y-4">
          {list.map((p) => (
            <div key={p.id} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 flex justify-between items-start gap-4">
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">{p.title}</div>
                <div className="text-sm text-neutral-500">{p.slug}</div>
                {p.description && <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{p.description}</div>}
              </div>
              {canManage && (
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(p.id)}
                    disabled={busy}
                    className="text-sm text-[#FF0000] dark:text-[#FF6666] hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {list.length === 0 && <p className="py-8 text-neutral-500 text-center">No programs yet.</p>}
        </div>
      )}
    </div>
  )
}
