'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { imageSrc } from '@/lib/image-url'

type Newsletter = { 
  id: string 
  title: string 
  content: string | null 
  link: string | null 
  imageUrl: string | null 
  publishedAt: string 
}

export default function AdminNewslettersPage() {
  const [list, setList] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [edit, setEdit] = useState<Newsletter | null>(null)
  
  const [form, setForm] = useState({ 
    title: '', 
    content: '', 
    link: '', 
    imageUrl: '',
    publishedAt: '' 
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  function load() {
    fetch('/api/newsletters', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  function openAdd() {
    setForm({ 
      title: '', 
      content: '', 
      link: '', 
      imageUrl: '', 
      publishedAt: new Date().toISOString().slice(0, 16) 
    })
    setImageFile(null)
    setEdit(null)
    setErr('')
    setFormOpen(true)
  }
  
  function openEdit(item: Newsletter) {
    setForm({
      title: item.title,
      content: item.content || '',
      link: item.link || '',
      imageUrl: item.imageUrl || '',
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    })
    setImageFile(null)
    setEdit(item)
    setErr('')
    setFormOpen(true)
  }
  function close() { setFormOpen(false); setEdit(null); setImageFile(null) }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setErr('Title is required'); return }
    setBusy(true)
    setErr('')
    
    const url = edit ? `/api/newsletters/${edit.id}` : '/api/newsletters'
    const method = edit ? 'PUT' : 'POST'
    
    const fd = new FormData()
    fd.set('title', form.title.trim())
    fd.set('content', form.content)
    fd.set('link', form.link)
    fd.set('publishedAt', form.publishedAt)
    if (imageFile) fd.set('image', imageFile)
    fd.set('imageUrl', form.imageUrl)
    
    const r = await fetch(url, { method, body: fd })
    const j = await r.json()
    
    setBusy(false)
    if (!r.ok) { setErr(j.error || 'Failed to save newsletter'); return }
    load()
    close()
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this newsletter?')) return
    setBusy(true)
    const r = await fetch(`/api/newsletters/${id}`, { method: 'DELETE' })
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
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="heading-2">Newsletters</h1>
          <p className="text-sm text-neutral-500">Manage published newsletters and links.</p>
        </div>
        <button type="button" onClick={openAdd} className="btn-primary whitespace-nowrap">Add Newsletter</button>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{edit ? 'Edit Newsletter' : 'Add Newsletter'}</h2>
            <form onSubmit={onSubmit} className="space-y-4">
              {err && <p className="text-sm text-[#FF0000] p-2 bg-[#FF0000]/10 rounded">{err}</p>}
              
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input placeholder="Newsletter Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inp} required />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Date Published *</label>
                <input type="datetime-local" value={form.publishedAt} onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))} className={inp} required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content Summary</label>
                <textarea placeholder="Write a summary or message..." value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} className={inp} rows={4} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">External Link</label>
                <input type="url" placeholder="https://..." value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} className={inp} />
                <p className="text-xs text-neutral-500 mt-1">If provided, users clicking &quot;Read More&quot; will be redirected to this link.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Featured Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-neutral-600 dark:text-neutral-400 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#044444] file:text-white dark:file:bg-[#44AAAA] dark:file:text-neutral-900 file:cursor-pointer mb-2"
                />
                
                {edit?.imageUrl && !imageFile && (
                  <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-900 p-2 rounded">
                    <div className="relative w-16 h-16 rounded overflow-hidden">
                      <Image src={imageSrc(form.imageUrl)} alt="Preview" fill className="object-cover" unoptimized />
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                      className="text-xs text-[#FF0000] hover:underline font-medium"
                    >
                      Remove image
                    </button>
                  </div>
                )}
                {imageFile && (
                  <p className="text-xs text-neutral-500">Selected file: {imageFile.name}</p>
                )}
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? 'Saving...' : 'Save Newsletter'}</button>
                <button type="button" onClick={close} className="px-5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#044444]"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((item) => (
            <div key={item.id} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 flex flex-col sm:flex-row justify-between items-start gap-4 bg-white dark:bg-neutral-800/50 hover:border-[#044444]/30 transition-colors">
              <div className="flex gap-4 items-start w-full">
                {item.imageUrl && (
                  <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-700 hidden sm:block">
                    <Image src={imageSrc(item.imageUrl)} alt="" fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 truncate">{item.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 mb-2">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                    {item.link && (
                       <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[#044444] dark:text-[#44AAAA] hover:underline flex items-center gap-1">
                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                         Link attached
                       </a>
                    )}
                  </div>
                  {item.content && <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{item.content}</p>}
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto pt-4 sm:pt-0 border-t border-neutral-100 sm:border-0 dark:border-neutral-700">
                <button type="button" onClick={() => openEdit(item)} className="px-3 py-1.5 rounded bg-neutral-100 dark:bg-neutral-700 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors w-full text-center">Edit</button>
                <button type="button" onClick={() => onDelete(item.id)} disabled={busy} className="px-3 py-1.5 rounded bg-[#FF0000]/10 text-[#FF0000] text-sm font-medium hover:bg-[#FF0000]/20 transition-colors w-full text-center">Delete</button>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <div className="text-center py-12 rounded-xl border border-neutral-200 border-dashed dark:border-neutral-700">
              <svg className="mx-auto h-12 w-12 text-neutral-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6m4 4h.01M17 16h.01M17 8h.01M7 12h.01M17 12h.01M12 16h.01M12 8h.01" /></svg>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No newsletters</h3>
              <p className="mt-1 text-sm text-neutral-500">Get started by creating a new newsletter.</p>
              <button type="button" onClick={openAdd} className="mt-4 btn-primary">Add Newsletter</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
