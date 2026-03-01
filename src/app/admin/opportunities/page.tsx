'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { effectiveRole, ROLES } from '@/lib/roles'

type O = {
  id: string
  title: string
  slug: string
  type: string
  description: string | null
  imageUrl?: string | null
  location?: string | null
  duration?: string | null
  roleOverview?: string | null
  requirements?: string | null
  whatYouGain?: string | null
  startDate: string | null
  expiryDate: string | null
  isActive: boolean
}

export default function AdminOpportunitiesPage() {
  const { data: session } = useSession()
  const rawRole = (session?.user as { role?: string } | undefined)?.role
  const role = effectiveRole(rawRole)
  const canManage = role === ROLES.SUPER_ADMIN || role === ROLES.CO_FOUNDER

  const [list, setList] = useState<O[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [edit, setEdit] = useState<O | null>(null)
  const [form, setForm] = useState({
    title: '',
    type: 'INTERNSHIP',
    description: '',
    location: '',
    duration: '',
    roleOverview: '',
    requirements: '',
    whatYouGain: '',
    startDate: '',
    expiryDate: '',
    imageFile: null as File | null,
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  function load() {
    setErr('')
    fetch('/api/admin/opportunities', { credentials: 'include' })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}))
        if (!r.ok) {
          setErr(typeof j?.error === 'string' ? j.error : r.statusText || 'Failed to load opportunities')
          setList([])
          return
        }
        setList(Array.isArray(j) ? j : [])
      })
      .catch((e) => {
        setErr(e instanceof Error ? e.message : 'Failed to load opportunities')
        setList([])
      })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  // Force light mode on this admin page and debug dark class
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.remove('dark')
    const theme = typeof localStorage !== 'undefined' ? localStorage.getItem('ph-theme') : null
    console.log('[Admin Opportunities] document.documentElement.classList:', document.documentElement.classList.toString(), 'localStorage ph-theme:', theme)
  }, [])

  function openAdd() {
    if (!canManage) return
    setForm({
      title: '', type: 'INTERNSHIP', description: '', location: '', duration: '',
      roleOverview: '', requirements: '', whatYouGain: '', startDate: '', expiryDate: '', imageFile: null,
    })
    setEdit(null)
    setErr('')
    setFormOpen(true)
  }
  function openEdit(o: O) {
    if (!canManage) return
    const toDatetimeLocal = (s: string | null) => {
      if (s == null || String(s).trim() === '') return ''
      const d = new Date(String(s).trim())
      if (Number.isNaN(d.getTime())) return ''
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const min = String(d.getMinutes()).padStart(2, '0')
      return `${y}-${m}-${day}T${h}:${min}`.trim()
    }
      setForm({
      title: o.title ?? '',
      type: String(o.type ?? 'INTERNSHIP').toUpperCase() === 'VOLUNTEER' ? 'VOLUNTEER' : 'INTERNSHIP',
      description: o.description ?? '',
      location: o.location ?? '',
      duration: o.duration ?? '',
      roleOverview: o.roleOverview ?? '',
      requirements: o.requirements ?? '',
      whatYouGain: o.whatYouGain ?? '',
      startDate: toDatetimeLocal(o.startDate ?? null),
      expiryDate: toDatetimeLocal(o.expiryDate ?? null),
      imageFile: null,
    })
    setEdit(o)
    setErr('')
    setFormOpen(true)
  }
  function close() { setFormOpen(false); setEdit(null) }

  function toISO8601Local(value: string): string | null {
    const trimmed = (value ?? '').trim()
    if (!trimmed) return null
    const d = new Date(trimmed)
    if (Number.isNaN(d.getTime())) return null
    return d.toISOString()
  }

  async function onSubmit(e: React.FormEvent) {
    if (!canManage) return
    e?.preventDefault()
    e?.stopPropagation()
    console.log('Submit triggered. Current busy state:', busy)
    if (busy) {
      console.log('Submit ignored: already in progress')
      return
    }
    const title = (form?.title ?? '').trim()
    if (!title) {
      setErr('Title required')
      return
    }
    setBusy(true)
    setErr('')

    const url = edit ? `/api/admin/opportunities/${edit.id}` : '/api/admin/opportunities'
    const method = edit ? 'PUT' : 'POST'

    const data = new FormData()
    data.append('title', title)
    data.append('type', form?.type ?? 'INTERNSHIP')
    const desc = (form?.description ?? '').trim()
    if (desc) data.append('description', desc)
    const loc = (form?.location ?? '').trim()
    if (loc) data.append('location', loc)
    const dur = (form?.duration ?? '').trim()
    if (dur) data.append('duration', dur)
    const role = (form?.roleOverview ?? '').trim()
    if (role) data.append('roleOverview', role)
    const req = (form?.requirements ?? '').trim()
    if (req) data.append('requirements', req)
    const gain = (form?.whatYouGain ?? '').trim()
    if (gain) data.append('whatYouGain', gain)
    const startISO = toISO8601Local(form?.startDate ?? '')
    const expiryISO = toISO8601Local(form?.expiryDate ?? '')
    if (startISO) data.append('startDate', startISO)
    if (expiryISO) data.append('expiryDate', expiryISO)
    if (form?.imageFile) data.append('image', form.imageFile)

    const payloadLog: Record<string, unknown> = {
      title,
      type: form?.type ?? 'INTERNSHIP',
      description: desc || null,
      location: loc || null,
      duration: dur || null,
      roleOverview: role || null,
      requirements: req || null,
      whatYouGain: gain || null,
      startDate: startISO,
      expiryDate: expiryISO,
      hasImage: !!form?.imageFile,
    }
    console.log('Submitting form...', payloadLog)

    try {
      const r = await fetch(url, { method, body: data })
      let j: { error?: string } = {}
      try {
        j = await r.json()
      } catch {
        // Response may not be JSON (e.g. 500 HTML)
        j = { error: `Request failed: ${r.status} ${r.statusText}` }
      }
      console.log('API Response:', { ok: r.ok, status: r.status, body: j })

      if (!r.ok) {
        setErr(j.error || 'Failed')
        return
      }
      load()
      close()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed'
      console.error('Submit error:', err)
      setErr(message)
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id: string) {
    if (!canManage) return
    if (!confirm('Delete this opportunity?')) return
    setBusy(true)
    const r = await fetch(`/api/admin/opportunities/${id}`, { method: 'DELETE' })
    setBusy(false)
    if (r.ok) load()
  }

  const inp = 'w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2.5 text-sm shadow-sm focus:border-[#044444] focus:ring-2 focus:ring-[#044444]/20 focus:outline-none transition-all'
  const labelCl = 'block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5'

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
        <h1 className="heading-2">Opportunities</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/opportunities/participants" className="text-sm font-medium text-[#044444] dark:text-[#44AAAA] hover:underline">
            Interns & Volunteers
          </Link>
          {canManage && (
            <button type="button" onClick={openAdd} className="btn-primary">
              Add opportunity
            </button>
          )}
        </div>
      </div>

      {err && !formOpen && (
        <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm shrink-0" role="alert">
          {err}
        </div>
      )}

      {formOpen && canManage && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/50 pointer-events-none" aria-hidden />
          <div className="fixed inset-y-0 right-0 z-[101] w-full max-w-2xl bg-white dark:bg-neutral-800 shadow-2xl border-l border-neutral-200 dark:border-neutral-700 flex flex-col overflow-hidden pointer-events-auto">
            <form id="opportunity-form" key={`opportunity-form-${edit?.id ?? 'new'}`} onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{edit ? 'Edit opportunity' : 'Add opportunity'}</h2>
                <button type="button" onClick={close} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer" aria-label="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {err && <p className="text-sm text-[#FF0000] bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">{err}</p>}

                {/* Image upload - prominent at top */}
                <div>
                  <label className={labelCl}>Image (card / hero)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm((f) => ({ ...f, imageFile: e.target.files?.[0] ?? null }))}
                    className={inp}
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Upload a high-quality image for the opportunity card. Leave empty to keep existing image when editing.</p>
                </div>

                <div>
                  <label className={labelCl}>Title *</label>
                  <input
                    placeholder="e.g. Data Science Internship"
                    value={form.title ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className={inp}
                    required
                  />
                </div>
                <div>
                  <label className={labelCl}>Type</label>
                  <select value={form.type ?? 'INTERNSHIP'} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inp}>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="VOLUNTEER">Volunteer</option>
                  </select>
                </div>
                {/* Metadata: Location, Duration, Dates - compact grid */}
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-3">Metadata</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Location</label>
                      <input
                        placeholder="e.g. Nairobi / Remote"
                        value={form.location ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Duration</label>
                      <input
                        placeholder="e.g. 3–6 months"
                        value={form.duration ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Application starts</label>
                      <input
                        type="datetime-local"
                        key={`start-${edit?.id ?? 'new'}`}
                        defaultValue={form.startDate ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, startDate: (e.target.value ?? '').trim() }))}
                        className={inp}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">Application expires</label>
                      <input
                        type="datetime-local"
                        key={`expiry-${edit?.id ?? 'new'}`}
                        defaultValue={form.expiryDate ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, expiryDate: (e.target.value ?? '').trim() }))}
                        className={inp}
                      />
                    </div>
                  </div>
                </div>

                {/* Full-width textareas */}
                <div>
                  <label className={labelCl}>Short description</label>
                  <textarea
                    placeholder="Brief summary for cards and listings (1–2 sentences)."
                    value={form.description ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className={inp}
                    rows={2}
                  />
                </div>
                <div>
                  <label className={labelCl}>Role overview</label>
                  <textarea
                    placeholder="Describe the role: key responsibilities, day-to-day activities, and what the intern/volunteer will do."
                    value={form.roleOverview ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, roleOverview: e.target.value }))}
                    className={inp}
                    rows={4}
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Enter each point on a new line.</p>
                </div>
                <div>
                  <label className={labelCl}>Requirements</label>
                  <textarea
                    placeholder="Describe the technical requirements, skills, qualifications, and background expected."
                    value={form.requirements ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                    className={inp}
                    rows={4}
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Enter each point on a new line.</p>
                </div>
                <div>
                  <label className={labelCl}>What you&apos;ll gain</label>
                  <textarea
                    placeholder="List benefits, learning outcomes, and what the candidate will gain from this opportunity."
                    value={form.whatYouGain ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, whatYouGain: e.target.value }))}
                    className={inp}
                    rows={4}
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Enter each point on a new line.</p>
                </div>
              </div>

              {/* Fixed footer with Save / Cancel - high z-index so button is on top */}
              <div className="relative z-[200] shrink-0 flex gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
                <button
                  type="submit"
                  disabled={busy}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onSubmit(e as unknown as React.FormEvent)
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#044444] to-[#033333] hover:from-[#033333] hover:to-[#022222] text-white font-semibold px-6 py-3 text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {busy ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={close} className="px-6 py-3 rounded-xl border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {loading ? <p className="text-neutral-500">Loading…</p> : (
            <div className="space-y-4">
          {list.map((o) => {
            const isClosed = o.expiryDate ? new Date(o.expiryDate) < new Date() : false
            return (
            <div key={o.id} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 flex justify-between items-start gap-4">
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {o.title}{isClosed && <span className="ml-2 text-xs font-semibold text-[#FF0000]">(Closed)</span>}
                </div>
                <div className="text-sm text-neutral-500">
                  {o.type}
                  {o.startDate && ` · Starts ${new Date(o.startDate).toLocaleDateString()}`}
                  {o.expiryDate && ` · Expires ${new Date(o.expiryDate).toLocaleDateString()}`}
                </div>
                {o.description && <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{o.description}</div>}
              </div>
              {canManage && (
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(o)}
                    className="text-sm px-3 py-1.5 rounded-lg bg-[#044444] text-white hover:bg-[#033333] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(o.id)}
                    disabled={busy}
                    className="text-sm px-3 py-1.5 rounded-lg bg-[#FF0000] text-white hover:bg-[#cc0000] transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            )})}
          {list.length === 0 && <p className="py-8 text-neutral-500 text-center">No opportunities yet.</p>}
        </div>
      )}
    </div>
  )
}
