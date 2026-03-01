'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Ev = { id: string; title: string; description: string | null; location: string | null; startDate: string; endDate: string | null; imageUrl: string | null; link: string | null }

export default function AdminEventsPage() {
  const [list, setList] = useState<Ev[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [edit, setEdit] = useState<Ev | null>(null)
  const [form, setForm] = useState({ title: '', description: '', location: '', startDate: '', endDate: '', imageUrl: '', link: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  function load() {
    fetch('/api/admin/events', { credentials: 'include' }).then((r) => r.json()).then(setList).catch(() => setList([])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  function openAdd() {
    setForm({ title: '', description: '', location: '', startDate: new Date().toISOString().slice(0, 16), endDate: '', imageUrl: '', link: '' })
    setImageFile(null)
    setEdit(null)
    setErr('')
    setFormOpen(true)
  }
  function openEdit(e: Ev) {
    setForm({
      title: e.title,
      description: e.description || '',
      location: e.location || '',
      startDate: e.startDate.slice(0, 16),
      endDate: e.endDate ? e.endDate.slice(0, 16) : '',
      imageUrl: e.imageUrl || '',
      link: e.link || '',
    })
    setImageFile(null)
    setEdit(e)
    setErr('')
    setFormOpen(true)
  }
  function close() { setFormOpen(false); setEdit(null); setImageFile(null) }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.startDate) { setErr('Title and start date required'); return }
    setBusy(true)
    setErr('')
    const url = edit ? `/api/admin/events/${edit.id}` : '/api/admin/events'
    const method = edit ? 'PUT' : 'POST'
    const fd = new FormData()
    fd.set('title', form.title.trim())
    fd.set('description', form.description)
    fd.set('location', form.location)
    fd.set('startDate', form.startDate)
    if (form.endDate) fd.set('endDate', form.endDate)
    fd.set('link', form.link)
    if (imageFile) fd.set('image', imageFile)
    fd.set('imageUrl', form.imageUrl)
    const r = await fetch(url, { method, body: fd })
    const j = await r.json()
    setBusy(false)
    if (!r.ok) { setErr(j.error || 'Failed'); return }
    load()
    close()
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this news item?')) return
    setBusy(true)
    const r = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
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
        <h1 className="heading-2">News</h1>
        <button type="button" onClick={openAdd} className="btn-primary">Add news item</button>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{edit ? 'Edit news item' : 'Add news item'}</h2>
            <form onSubmit={onSubmit} className="space-y-3">
              {err && <p className="text-sm text-[#FF0000]">{err}</p>}
              <input placeholder="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inp} required />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inp} rows={2} />
              <input placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className={inp} />
              <input type="datetime-local" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className={inp} required />
              <input type="datetime-local" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className={inp} />
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-neutral-600 dark:text-neutral-400 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#044444] file:text-white dark:file:bg-[#44AAAA] dark:file:text-neutral-900 file:cursor-pointer"
                />
                {edit?.imageUrl && !imageFile && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="relative w-20 h-20 rounded border border-neutral-200 dark:border-neutral-600 overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                      <Image src={form.imageUrl.startsWith('/') ? form.imageUrl : `/${form.imageUrl}`} alt="" fill className="object-cover" unoptimized />
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                      className="text-sm text-[#FF0000] hover:underline"
                    >
                      Remove image
                    </button>
                  </div>
                )}
                {imageFile && (
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    New file: {imageFile.name}
                  </p>
                )}
              </div>
              <input placeholder="Link" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} className={inp} />
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
          {list.map((ev) => (
            <div key={ev.id} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 flex justify-between items-start gap-4">
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">{ev.title}</div>
                <div className="text-sm text-neutral-500">{new Date(ev.startDate).toLocaleString()}{ev.location ? ` · ${ev.location}` : ''}</div>
                {ev.description && <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{ev.description}</div>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => openEdit(ev)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Edit</button>
                <button type="button" onClick={() => onDelete(ev.id)} disabled={busy} className="text-sm text-[#FF0000] dark:text-[#FF6666] hover:underline">Delete</button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="py-8 text-neutral-500 text-center">No news items yet.</p>}
        </div>
      )}
    </div>
  )
}
