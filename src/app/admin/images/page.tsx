'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Img = { id: string; url: string; alt: string | null; caption: string | null; category: string; sortOrder: number }

const GALLERY_CATEGORY = 'gallery'

export default function AdminImagesPage() {
  const [list, setList] = useState<Img[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [edit, setEdit] = useState<Img | null>(null)
  const [form, setForm] = useState({ description: '', sortOrder: 0 })
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  function load() {
    fetch('/api/admin/images', { credentials: 'include' })
      .then((r) => r.json())
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  function openAdd() {
    setForm({ description: '', sortOrder: 0 })
    setFile(null)
    setErr('')
    setAddOpen(true)
  }
  function openEdit(i: Img) {
    setForm({ description: i.caption || '', sortOrder: i.sortOrder })
    setEdit(i)
    setErr('')
  }
  function close() {
    setAddOpen(false)
    setEdit(null)
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setErr('Choose a file'); return }
    setBusy(true)
    setErr('')
    const fd = new FormData()
    fd.set('file', file)
    fd.set('caption', form.description)
    fd.set('category', GALLERY_CATEGORY)
    fd.set('sortOrder', String(form.sortOrder))
    const r = await fetch('/api/admin/images', { method: 'POST', credentials: 'include', body: fd })
    const j = await r.json()
    setBusy(false)
    if (!r.ok) { setErr(j.error || 'Failed'); return }
    load()
    close()
  }

  async function onEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!edit) return
    setBusy(true)
    setErr('')
    const r = await fetch(`/api/admin/images/${edit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption: form.description, sortOrder: form.sortOrder, category: GALLERY_CATEGORY }),
    })
    const j = await r.json()
    setBusy(false)
    if (!r.ok) { setErr(j.error || 'Failed'); return }
    load()
    close()
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this image?')) return
    setBusy(true)
    const r = await fetch(`/api/admin/images/${id}`, { method: 'DELETE' })
    setBusy(false)
    if (r.ok) load()
  }

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
        <h1 className="heading-2">Gallery</h1>
        <button
          type="button"
          onClick={openAdd}
          className="btn-primary"
        >
          Upload image
        </button>
      </div>

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Add image</h2>
            <form onSubmit={onAdd} className="space-y-3">
              {err && <p className="text-sm text-[#FF0000]">{err}</p>}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Image</label>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" required onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm rounded border border-neutral-300 dark:border-neutral-600 px-3 py-2 dark:bg-neutral-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
                <input placeholder="Short description of the image" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded border border-neutral-300 dark:border-neutral-600 px-3 py-2 dark:bg-neutral-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Sort order (optional)</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))} className="w-full rounded border border-neutral-300 dark:border-neutral-600 px-3 py-2 dark:bg-neutral-700" placeholder="0" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={busy} className="btn-primary flex-1">Upload</button>
                <button type="button" onClick={close} className="px-4 py-2 rounded border dark:border-neutral-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Edit image</h2>
            <form onSubmit={onEdit} className="space-y-3">
              {err && <p className="text-sm text-[#FF0000]">{err}</p>}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
                <input placeholder="Short description of the image" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded border border-neutral-300 dark:border-neutral-600 px-3 py-2 dark:bg-neutral-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Sort order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))} className="w-full rounded border border-neutral-300 dark:border-neutral-600 px-3 py-2 dark:bg-neutral-700" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={busy} className="btn-primary flex-1">Save</button>
                <button type="button" onClick={close} className="px-4 py-2 rounded border dark:border-neutral-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="text-left py-2 pr-4">Preview</th>
                <th className="text-left py-2 pr-4">Description</th>
                <th className="text-left py-2 pr-4">Order</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((i) => (
                <tr key={i.id} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="py-2 pr-4">
                    <div className="relative h-12 w-16 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                      <Image src={i.url.startsWith('/') ? i.url : `/${i.url}`} alt={i.caption || i.alt || 'Gallery image'} fill className="object-cover" sizes="64px" unoptimized />
                    </div>
                  </td>
                  <td className="py-2 pr-4 text-sm max-w-xs">{i.caption || '—'}</td>
                  <td className="py-2 pr-4 text-sm">{i.sortOrder}</td>
                  <td className="py-2">
                    <button type="button" onClick={() => openEdit(i)} className="text-primary-600 dark:text-primary-400 text-sm mr-2 hover:underline">Edit</button>
                    <button type="button" onClick={() => onDelete(i.id)} disabled={busy} className="text-[#FF0000] dark:text-[#FF6666] text-sm hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="py-8 text-neutral-500 text-center">No images yet. Add one to get started.</p>}
        </div>
      )}
    </div>
  )
}
