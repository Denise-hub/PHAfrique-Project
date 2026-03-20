'use client'

import React from 'react'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

type App = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  resumeUrl: string | null
  country: string | null
  qualification: string | null
  publicHealthIssues: string | null
  internshipInterest: string | null
  status: string
  adminNotes: string | null
  createdAt: string
  opportunity: { title: string; slug: string; type: string }
}

type Opp = { id: string; title: string; slug: string; type: string }

export default function AdminApplicationsPage() {
  const [list, setList] = useState<App[]>([])
  const [opportunities, setOpportunities] = useState<Opp[]>([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<App | null>(null)
  const [detailNotes, setDetailNotes] = useState('')
  const [detailStatus, setDetailStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'VOLUNTEER' | 'INTERNSHIP'>('ALL')
  const [saveError, setSaveError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/opportunities', { credentials: 'include' }).then((r) => r.json()).then(setOpportunities).catch(() => setOpportunities([]))
  }, [])

  const load = useCallback(() => {
    const qs = new URLSearchParams()
    if (filter) qs.set('opportunityId', filter)
    if (typeFilter !== 'ALL') qs.set('type', typeFilter)
    const u = `/api/admin/applications${qs.toString() ? `?${qs.toString()}` : ''}`
    fetch(u, { credentials: 'include' }).then((r) => r.json()).then(setList).catch(() => setList([])).finally(() => setLoading(false))
  }, [filter, typeFilter])

  useEffect(() => { load() }, [load])

  function openDetail(a: App) {
    setDetail(a)
    setDetailNotes(a.adminNotes || '')
    setDetailStatus(a.status)
    setSaveError('')
    setSavedMessage('')
  }
  function closeDetail() {
    setDetail(null)
    setSaveError('')
    setSavedMessage('')
  }

  async function saveDetail(statusOverride?: string) {
    if (!detail) return
    const currentStatus = (statusOverride ?? detailStatus).trim().toLowerCase() || 'pending'
    const currentNotes = detailNotes.trim() || null
    setBusy(true)
    setSaveError('')
    setSavedMessage('')
    try {
      const r = await fetch(`/api/admin/applications/${detail.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus, adminNotes: currentNotes }),
      })
      const resBody = await r.json().catch(() => ({}))
      if (!r.ok) {
        setSaveError(typeof resBody?.error === 'string' ? resBody.error : r.statusText || 'Update failed')
        return
      }
      setDetailStatus(currentStatus)
      setDetail((d) => (d ? { ...d, status: currentStatus, adminNotes: currentNotes } : null))
      setSavedMessage('Changes saved')
      load()
    } finally {
      setBusy(false)
    }
  }

  const statuses = ['pending', 'reviewed', 'accepted', 'rejected']

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
        <h1 className="heading-2">Applications</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <button type="button" onClick={() => setTypeFilter('ALL')} className={`px-3 py-2 text-sm ${typeFilter === 'ALL' ? 'bg-[#044444] text-white' : 'bg-white dark:bg-neutral-800'}`}>All</button>
            <button type="button" onClick={() => setTypeFilter('VOLUNTEER')} className={`px-3 py-2 text-sm ${typeFilter === 'VOLUNTEER' ? 'bg-[#044444] text-white' : 'bg-white dark:bg-neutral-800'}`}>Volunteering</button>
            <button type="button" onClick={() => setTypeFilter('INTERNSHIP')} className={`px-3 py-2 text-sm ${typeFilter === 'INTERNSHIP' ? 'bg-[#044444] text-white' : 'bg-white dark:bg-neutral-800'}`}>Interns</button>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm w-56"
          >
            <option value="">All opportunities</option>
            {opportunities.map((o) => (
              <option key={o.id} value={o.id}>{o.title}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? <p className="text-neutral-500">Loading…</p> : (
        <div className="space-y-4">
          {list.map((a) => (
            <div key={a.id} className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 flex justify-between items-start gap-4">
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">{a.name}</div>
                <div className="text-sm text-neutral-500">{a.email}{a.phone ? ` · ${a.phone}` : ''}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{a.opportunity.title} ({a.opportunity.type})</div>
                <div className="text-xs text-neutral-400 mt-1">{new Date(a.createdAt).toLocaleString()} · <span className={a.status === 'accepted' ? 'text-primary-600' : a.status === 'rejected' ? 'text-[#FF0000]' : ''}>{a.status}</span></div>
              </div>
              <button type="button" onClick={() => openDetail(a)} className="text-sm px-3 py-1.5 rounded-lg bg-[#044444] text-white hover:bg-[#033333] transition-colors shrink-0">View / Edit</button>
            </div>
          ))}
          {list.length === 0 && <p className="py-8 text-neutral-500 text-center">No applications yet.</p>}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-800 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Application from {detail.name}</h2>
            <div className="space-y-2 text-sm mb-4">
              <p><span className="text-neutral-500">Email:</span> {detail.email}</p>
              {detail.phone && <p><span className="text-neutral-500">Phone:</span> {detail.phone}</p>}
              {detail.country && <p><span className="text-neutral-500">Country:</span> {detail.country}</p>}
              <p><span className="text-neutral-500">Opportunity:</span> {detail.opportunity.title} ({detail.opportunity.type})</p>
              <p><span className="text-neutral-500">Applied:</span> {new Date(detail.createdAt).toLocaleString()}</p>

              {String(detail.opportunity.type).toUpperCase() === 'INTERNSHIP' ? (
                <>
                  {detail.qualification && (
                    <p>
                      <span className="text-neutral-500">School / University:</span> {detail.qualification}
                    </p>
                  )}
                  {detail.publicHealthIssues && (
                    <p>
                      <span className="text-neutral-500">Major / Field of study:</span> {detail.publicHealthIssues}
                    </p>
                  )}
                  {detail.internshipInterest && (
                    <p>
                      <span className="text-neutral-500">Year of study:</span> {detail.internshipInterest}
                    </p>
                  )}
                </>
              ) : (
                <>
                  {(detail.message || detail.publicHealthIssues) && (
                    <p>
                      <span className="text-neutral-500">Message / Notes:</span>
                      <br />
                      <span className="whitespace-pre-wrap">{detail.message || detail.publicHealthIssues}</span>
                    </p>
                  )}
                </>
              )}

              {detail.resumeUrl && (
                <div className="mt-3">
                  <p className="text-neutral-500 mb-2">CV</p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={detail.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#044444] text-white hover:bg-[#033333] transition-colors text-sm"
                    >
                      View CV
                    </a>
                    <a
                      href={detail.resumeUrl}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-sm"
                      download
                    >
                      Download CV
                    </a>
                  </div>
                </div>
              )}
            </div>
            {saveError && (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300 mb-3">
                {saveError}
              </div>
            )}
            {savedMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 px-3 py-2 text-sm text-green-700 dark:text-green-300 mb-3">
                {savedMessage}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">Status</label>
                <select value={detailStatus} onChange={(e) => { setDetailStatus(e.target.value); setSavedMessage('') }} className="w-full rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm">
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">Admin notes</label>
                <textarea value={detailNotes} onChange={(e) => { setDetailNotes(e.target.value); setSavedMessage('') }} className="w-full rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm" rows={3} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button type="button" onClick={() => saveDetail('accepted')} disabled={busy} className="px-4 py-2 rounded-lg bg-[#044444] text-white hover:bg-[#033333] transition-colors disabled:opacity-50">Accept</button>
              <button type="button" onClick={() => saveDetail('rejected')} disabled={busy} className="px-4 py-2 rounded-lg bg-[#FF0000] text-white hover:bg-[#cc0000] transition-colors disabled:opacity-50">Reject</button>
              <button type="button" onClick={() => saveDetail()} disabled={busy} className="btn-primary flex-1">
                {busy ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={closeDetail} disabled={busy} className="px-4 py-2 rounded border dark:border-neutral-600 disabled:opacity-50">Close</button>
            </div>
            {detailStatus === 'accepted' && (
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Add this person to the website as an intern or volunteer:</p>
                <Link
                  href={`/admin/opportunities/participants?fromApplication=${detail.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#044444]/10 dark:bg-[#44AAAA]/20 text-[#044444] dark:text-[#44AAAA] font-medium text-sm hover:bg-[#044444]/20 dark:hover:bg-[#44AAAA]/30 transition-colors"
                >
                  Add as {detail.opportunity.type === 'VOLUNTEER' ? 'Volunteer' : 'Intern'} on website →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
