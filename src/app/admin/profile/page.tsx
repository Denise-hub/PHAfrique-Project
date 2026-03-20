'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { imageSrc } from '@/lib/image-url'

export default function AdminProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const [form, setForm] = useState({ displayName: '', imageUrl: '', password: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [avatarBroken, setAvatarBroken] = useState(false)

  const displayImageUrl = imageFile
    ? URL.createObjectURL(imageFile)
    : form.imageUrl
      ? imageSrc(form.imageUrl)
      : (session?.user?.image ?? null)

  useEffect(() => {
    setAvatarBroken(false)
  }, [displayImageUrl])

  useEffect(() => {
    fetch('/api/admin/users/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setForm({
            displayName: data.displayName || '',
            imageUrl: data.imageUrl || '',
            password: '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function startEditing() {
    setMessage(null)
    setImageFile(null)
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
    setMessage(null)
    setImageFile(null)
    setForm((f) => ({ ...f, password: '' }))
    fetch('/api/admin/users/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setForm({
            displayName: data.displayName || '',
            imageUrl: data.imageUrl || '',
            password: '',
          })
        }
      })
      .catch(() => {})
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    try {
      const hasImage = imageFile && imageFile.size > 0
      const r = hasImage
        ? await fetch('/api/admin/users/me', {
            method: 'PATCH',
            credentials: 'include',
            body: (() => {
              const fd = new FormData()
              fd.set('displayName', form.displayName.trim())
              if (form.password.trim().length >= 8) fd.set('password', form.password.trim())
              fd.set('image', imageFile!)
              return fd
            })(),
          })
        : await fetch('/api/admin/users/me', {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              displayName: form.displayName.trim() || null,
              imageUrl: form.imageUrl.trim() || null,
              ...(form.password.trim().length >= 8 ? { password: form.password.trim() } : {}),
            }),
          })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) {
        setMessage({ type: 'error', text: j.error || 'Failed to update profile.' })
        setBusy(false)
        return
      }
      setMessage({ type: 'success', text: 'Profile updated.' })
      setForm((f) => ({ ...f, password: '' }))
      setImageFile(null)
      if (j.imageUrl != null) setForm((f) => ({ ...f, imageUrl: j.imageUrl || '' }))
      await updateSession()
      setIsEditing(false)
    } catch {
      setMessage({ type: 'error', text: 'Network error.' })
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#044444] dark:text-[#44AAAA] mb-2">Profile</h1>
          <p className="text-neutral-500 text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center pt-1 pb-6 px-4 bg-neutral-50/60 dark:bg-neutral-950/40 min-h-0">
      {/* Compact header row: title + subtitle inline, no big gap */}
      <div className="w-full min-w-[320px] max-w-md mb-3 flex items-baseline justify-between gap-4">
        <h1 className="text-xl font-bold text-[#044444] dark:text-[#44AAAA]">Profile</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0">
          Display name & image show in the sidebar
        </p>
      </div>

      {/* Card with clear depth: layered shadow + accent bar */}
      <div className="w-full min-w-[320px] max-w-md rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-700/80 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.06),_0_6px_16px_-2px_rgb(0_0_0_/_0.08),_0_12px_32px_-4px_rgb(0_0_0_/_0.06)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)]">
        {/* Accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#044444] to-[#066666] dark:from-[#44AAAA] dark:to-[#66CCCC]" />
        {!isEditing ? (
          /* View mode: two-column row (avatar left, password + button right) to reduce height */
          <div className="p-5 space-y-4">
            <div>
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                Display name
              </div>
              <div className="text-neutral-900 dark:text-neutral-100 font-medium">
                {form.displayName || session?.user?.email || '—'}
              </div>
            </div>
            <div className="flex flex-wrap items-start gap-6">
              <div>
                <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                  Profile image
                </div>
                {displayImageUrl && !avatarBroken && (displayImageUrl.startsWith('blob:') || !!imageSrc(displayImageUrl)) ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800">
                    <Image
                      src={displayImageUrl.startsWith('blob:') ? displayImageUrl : imageSrc(displayImageUrl)}
                      alt="Profile"
                      fill
                      className="object-cover"
                      unoptimized={displayImageUrl.startsWith('blob:')}
                      sizes="80px"
                      onError={() => setAvatarBroken(true)}
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 text-lg font-semibold text-[#044444] dark:text-[#44AAAA]">
                    {(form.displayName || session?.user?.email || 'A')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-[140px] flex flex-col gap-3">
                <div>
                  <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                    Password
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-400 text-sm">
                    ••••••••
                  </div>
                </div>
                <button
                  type="button"
                  onClick={startEditing}
                  className="w-full sm:w-auto self-start px-4 py-2.5 bg-[#044444] dark:bg-[#44AAAA] text-white text-sm font-medium rounded-lg hover:opacity-90 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  Edit profile
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Edit mode */
          <form onSubmit={onSubmit} className="p-5 space-y-4">
            <div>
              <label
                htmlFor="profile-displayName"
                className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1.5"
              >
                Display name
              </label>
              <input
                id="profile-displayName"
                type="text"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-[#044444]/20 focus:border-[#044444] dark:focus:ring-[#44AAAA]/20 dark:focus:border-[#44AAAA] outline-none"
                placeholder={session?.user?.email || 'Admin'}
              />
            </div>
            <div>
              <label
                htmlFor="profile-image"
                className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1.5"
              >
                Profile image
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                Leave empty to keep your current image.
              </p>
              {displayImageUrl && (
                <div className="mb-2 relative w-16 h-16 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={displayImageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized={displayImageUrl.startsWith('blob:')}
                    sizes="64px"
                  />
                </div>
              )}
              <input
                id="profile-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-neutral-600 dark:text-neutral-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#044444] file:text-white file:cursor-pointer hover:file:opacity-90"
              />
            </div>
            <div>
              <label
                htmlFor="profile-password"
                className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1.5"
              >
                New password
              </label>
              <input
                id="profile-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-[#044444]/20 focus:border-[#044444] dark:focus:ring-[#44AAAA]/20 dark:focus:border-[#44AAAA] outline-none"
                placeholder="Min 8 characters (leave blank to keep current)"
              />
            </div>
            {message && (
              <p
                className={
                  message.type === 'error'
                    ? 'text-sm text-red-600 dark:text-red-400'
                    : 'text-sm text-green-600 dark:text-green-400'
                }
              >
                {message.text}
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2.5 bg-[#044444] dark:bg-[#44AAAA] text-white text-sm font-medium rounded-lg hover:opacity-90 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200"
              >
                {busy ? 'Saving…' : 'Save profile'}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={busy}
                className="px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
