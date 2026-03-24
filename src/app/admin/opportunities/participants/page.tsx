'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { effectiveRole, ROLES } from '@/lib/roles'
import { imageSrc } from '@/lib/image-url'

type Participant = {
  id: string
  type: string
  name: string
  email: string | null
  role: string
  imageUrl: string | null
  bio: string | null
  linkedInUrl: string | null
  isActive: boolean
  sortOrder: number
  startDate: string | null
  endDate: string | null
  opportunity?: { id: string; title: string; type: string } | null
}

type Opportunity = { id: string; title: string; type: string }

const inp = 'w-full rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm focus:border-[#044444] focus:ring-2 focus:ring-[#044444]/20 outline-none'
const labelCl = 'block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1'

function AdminParticipantsPageInner() {
  const { data: session } = useSession()
  const role = effectiveRole((session?.user as { role?: string })?.role)
  const canManage =
    role === ROLES.SUPER_ADMIN || role === ROLES.CO_FOUNDER || role === ROLES.ADMIN || role === ROLES.SOCIAL_MEDIA_MANAGER

  const [list, setList] = useState<Participant[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [edit, setEdit] = useState<Participant | null>(null)
  const [fromApplicationId, setFromApplicationId] = useState<string | null>(null)
  const [form, setForm] = useState({
    type: 'VOLUNTEER',
    name: '',
    email: '',
    role: '',
    imageFile: null as File | null,
    bio: '',
    linkedInUrl: '',
    opportunityId: '',
    isActive: true,
    sortOrder: 0,
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})
  const errRef = useRef<HTMLParagraphElement>(null)

  function load() {
    setErr('')
    Promise.all([
      fetch('/api/admin/participants', { credentials: 'include' }).then((r) => r.json()).then((d) => (Array.isArray(d) ? d : [])).catch(() => []),
      fetch('/api/admin/opportunities', { credentials: 'include' }).then((r) => r.json()).then((d) => (Array.isArray(d) ? d : [])).catch(() => []),
    ]).then(([participants, opps]) => {
      // Show active website volunteers only (matches user-side workflow).
      setList(
        participants.filter(
          (p) => String(p.type || '').toUpperCase() === 'VOLUNTEER' && Boolean(p.isActive),
        ),
      )
      // Keep all opportunities available for linking (including internships),
      // even though this workflow manages volunteer users only.
      setOpportunities(opps)
    }).catch(() => setErr('Failed to load')).finally(() => setLoading(false))
  }

  // Reload when the active admin role/session changes.
  useEffect(() => { load() }, [role])

  const searchParams = useSearchParams()
  useEffect(() => {
    const fromId = searchParams.get('fromApplication')
    if (!fromId || !canManage) return
    setFromApplicationId(fromId)
    fetch(`/api/admin/applications/${fromId}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((app) => {
        if (!app?.opportunity) return
        setForm({
          // This workflow manages volunteers only.
          type: 'VOLUNTEER',
          name: app.name || '',
          email: app.email || '',
          role: app.opportunity.title ? `${app.opportunity.title} participant` : '',
          imageFile: null,
          bio: '',
          linkedInUrl: '',
          opportunityId: app.opportunity.id || '',
          isActive: true,
          sortOrder: 0,
        })
        setFormOpen(true)
      })
      .catch(() => {})
  }, [searchParams, canManage])

  function openAdd() {
    if (!canManage) return
    setFromApplicationId(null)
    setForm({
      type: 'VOLUNTEER',
      name: '',
      email: '',
      role: '',
      imageFile: null,
      bio: '',
      linkedInUrl: '',
      opportunityId: '',
      isActive: true,
      sortOrder: list.length,
    })
    setEdit(null)
    setErr('')
    setFormOpen(true)
  }

  function openEdit(p: Participant) {
    if (!canManage) return
    setForm({
      type: 'VOLUNTEER',
      name: p.name,
      email: p.email || '',
      role: p.role,
      imageFile: null,
      bio: p.bio || '',
      linkedInUrl: p.linkedInUrl || '',
      opportunityId: p.opportunity?.id || '',
      isActive: p.isActive,
      sortOrder: p.sortOrder,
    })
    setEdit(p)
    setErr('')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEdit(null)
    setFromApplicationId(null)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canManage) {
      setErr('You do not have permission to add or edit participants.')
      errRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      return
    }
    const name = form.name.trim()
    const roleStr = form.role.trim()
    if (!name || !roleStr) {
      setErr('Name and role are required.')
      errRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      return
    }
    if (!edit && !form.imageFile) {
      setErr('Please upload a profile image.')
      errRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      return
    }
    setBusy(true)
    setErr('')
    try {
      const fd = new FormData()
      fd.set('name', name)
      fd.set('type', form.type)
      fd.set('role', roleStr)
      if (form.email.trim()) fd.set('email', form.email.trim())
      if (form.bio.trim()) fd.set('bio', form.bio.trim())
      if (form.linkedInUrl.trim()) fd.set('linkedInUrl', form.linkedInUrl.trim())
      if (form.opportunityId) fd.set('opportunityId', form.opportunityId)
      fd.set('isActive', form.isActive ? 'true' : 'false')
      fd.set('sortOrder', String(form.sortOrder))
      if (form.imageFile && form.imageFile.size > 0) fd.set('image', form.imageFile)
      if (!edit && fromApplicationId) fd.set('applicationId', fromApplicationId)

      const url = edit ? `/api/admin/participants/${edit.id}` : '/api/admin/participants'
      const method = edit ? 'PATCH' : 'POST'
      const r = await fetch(url, { method, credentials: 'include', body: fd })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) {
        setErr(j.error || 'Failed to save')
        setBusy(false)
        errRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        return
      }
      load()
      closeForm()
    } catch {
      setErr('Network error')
      errRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id: string) {
    if (!canManage) return
    if (!confirm('Remove this intern/volunteer from the list? They will no longer appear on the website.')) return
    setBusy(true)
    try {
      const r = await fetch(`/api/admin/participants/${id}`, { method: 'DELETE', credentials: 'include' })
      if (r.ok) load()
      else setErr('Failed to delete')
    } finally {
      setBusy(false)
    }
  }

  const imagePreview = form.imageFile
    ? URL.createObjectURL(form.imageFile)
    : edit?.imageUrl
      ? imageSrc(edit.imageUrl)
      : null

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <Link href="/admin" className="text-sm text-[#044444] dark:text-[#44AAAA] hover:underline inline-flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Dashboard
        </Link>
        <Link href="/admin/opportunities" className="text-sm text-neutral-600 dark:text-neutral-400 hover:underline">Volunteers</Link>
      </div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="heading-2">Volunteers</h1>
        {canManage && (
          <button type="button" onClick={openAdd} className="btn-primary">
            + Add Volunteer
          </button>
        )}
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
        Want to add a new volunteer to the website? Click the Add button.
      </p>

      {err && !formOpen && (
        <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">{err}</div>
      )}

      {formOpen && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-neutral-800 shadow-xl border border-neutral-200 dark:border-neutral-700 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{edit ? 'Edit Volunteer' : 'Add Volunteer'}</h2>
              <button type="button" onClick={closeForm} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-4">
              {err && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{err}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCl}>Type</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inp}>
                    <option value="VOLUNTEER">Volunteer</option>
                  </select>
                </div>
                <div>
                  <label className={labelCl}>Sort order</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))} className={inp} />
                </div>
              </div>
              <div>
                <label className={labelCl}>Name *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inp} placeholder="Full name" aria-required />
              </div>
              <div>
                <label className={labelCl}>Email (optional)</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inp} placeholder="email@example.com" />
              </div>
              <div>
                <label className={labelCl}>Role / title *</label>
                <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className={inp} placeholder="e.g. Public Health Research Intern" aria-required />
              </div>
              <div>
                <label className={labelCl}>Profile image {edit ? '(leave empty to keep current)' : '*'}</label>
                {imagePreview && (
                  <div className="mb-2 relative w-20 h-20 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-600">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized={imagePreview.startsWith('blob:')} sizes="80px" />
                  </div>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setForm((f) => ({ ...f, imageFile: e.target.files?.[0] ?? null }))} className={inp} />
              </div>
              <div>
                <label className={labelCl}>Bio (optional)</label>
                <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} className={inp} rows={2} placeholder="Short bio for the website" />
              </div>
              <div>
                <label className={labelCl}>LinkedIn URL (optional)</label>
                <input type="url" value={form.linkedInUrl} onChange={(e) => setForm((f) => ({ ...f, linkedInUrl: e.target.value }))} className={inp} placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className={labelCl}>Linked opportunity (optional)</label>
                <select value={form.opportunityId} onChange={(e) => setForm((f) => ({ ...f, opportunityId: e.target.value }))} className={inp}>
                  <option value="">— None —</option>
                  {opportunities.map((o) => (
                    <option key={o.id} value={o.id}>{o.title} ({o.type})</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="p-isActive" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-neutral-300" />
                <label htmlFor="p-isActive" className="text-sm text-neutral-700 dark:text-neutral-300">Active (shown on website)</label>
              </div>
              {err && <p ref={errRef} className="text-sm text-red-600 dark:text-red-400" role="alert">{err}</p>}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={busy} className="px-4 py-2 bg-[#044444] dark:bg-[#44AAAA] text-white rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium">
                  {busy ? 'Saving…' : edit ? 'Save changes' : 'Add Volunteer'}
                </button>
                <button type="button" onClick={closeForm} disabled={busy} className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-8 text-center text-neutral-500">
          No volunteers yet. Click &quot;Add Volunteer&quot; to add one; you can also add from an accepted application on the Applications page.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <div key={p.id} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {p.imageUrl && !brokenImages[p.id] && imageSrc(p.imageUrl) ? (
                  <Image
                    src={imageSrc(p.imageUrl)}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-contain bg-white p-0.5 border border-neutral-200 dark:border-neutral-600 shrink-0"
                    unoptimized
                    onError={() => setBrokenImages((prev) => ({ ...prev, [p.id]: true }))}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-[#044444]/20 dark:bg-[#44AAAA]/20 flex items-center justify-center text-lg font-semibold text-[#044444] dark:text-[#44AAAA] shrink-0">
                    {(p.name || '?')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">{p.name}</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">{p.role}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${p.type === 'VOLUNTEER' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-[#044444]/10 text-[#044444] dark:bg-[#44AAAA]/20 dark:text-[#44AAAA]'}`}>
                      {p.type}
                    </span>
                    {!p.isActive && <span className="text-xs text-neutral-500">Inactive</span>}
                    {p.opportunity && <span className="text-xs text-neutral-500 truncate">{p.opportunity.title}</span>}
                  </div>
                </div>
              </div>
              {canManage && (
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => openEdit(p)} className="text-sm px-3 py-1.5 rounded-lg bg-[#044444] dark:bg-[#44AAAA] text-white hover:opacity-90">Edit</button>
                  <button type="button" onClick={() => onDelete(p.id)} disabled={busy} className="text-sm px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">Remove</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminParticipantsPage() {
  return (
    <Suspense fallback={<p className="text-neutral-500 p-4">Loading…</p>}>
      <AdminParticipantsPageInner />
    </Suspense>
  )
}
