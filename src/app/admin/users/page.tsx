'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { imageSrc } from '@/lib/image-url'

type AdminUser = {
  id: string
  email: string
  role: string
  displayName: string | null
  imageUrl: string | null
  createdAt: string
}

const ROLES_CREATE = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'CO_FOUNDER', label: 'Co-Founder' },
  { value: 'SOCIAL_MEDIA_MANAGER', label: 'Social Media Manager' },
  { value: 'NEWSLETTER_MANAGER', label: 'Newsletter Manager' },
]

const ROLES_ALL = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  ...ROLES_CREATE,
]

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const currentEmail = session?.user?.email?.toLowerCase().trim()
  const role = (session?.user as { role?: string })?.role
  const isSuperAdmin = role === 'SUPER_ADMIN'
  const isAdmin = role === 'ADMIN'
  const canManageUsers = isSuperAdmin || isAdmin

  const [list, setList] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({
    email: '',
    role: 'CO_FOUNDER',
    password: '',
    displayName: '',
    imageFile: null as File | null,
  })
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState({ email: '', displayName: '', imageUrl: '', role: '', password: '' })
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})

  function load() {
    setLoading(true)
    fetch('/api/admin/users', { credentials: 'include', cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.error(e)
        setList([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function openForm() {
    setForm({
      email: '',
      role: 'CO_FOUNDER',
      password: '',
      displayName: '',
      imageFile: null,
    })
    setMessage(null)
    setEditUser(null)
    setFormOpen(true)
  }

  function openEdit(u: AdminUser) {
    setEditUser(u)
    setEditForm({
      email: u.email,
      displayName: u.displayName || '',
      imageUrl: u.imageUrl || '',
      role: u.role,
      password: '',
    })
    setEditImageFile(null)
    setMessage(null)
    setFormOpen(false)
  }

  function closeEdit() {
    setEditUser(null)
    setMessage(null)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const email = form.email.trim()
    if (!email) {
      setMessage({ type: 'error', text: 'Email is required.' })
      return
    }
    if (!form.password || form.password.length < 8) {
      setMessage({ type: 'error', text: 'Password is required (min 8 characters) so the user can log in.' })
      return
    }
    setBusy(true)
    setMessage(null)
    try {
      const hasFile = form.imageFile && form.imageFile.size > 0
      let r: Response
      if (hasFile) {
        const fd = new FormData()
        fd.set('email', email)
        fd.set('role', form.role)
        if (form.password.trim()) fd.set('password', form.password.trim())
        if (form.displayName.trim()) fd.set('displayName', form.displayName.trim())
        fd.set('image', form.imageFile!)
        r = await fetch('/api/admin/users', {
          method: 'POST',
          credentials: 'include',
          body: fd,
        })
      } else {
        r = await fetch('/api/admin/users', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            role: form.role,
            password: form.password.trim() || undefined,
            displayName: form.displayName.trim() || undefined,
          }),
        })
      }
      const j = await r.json().catch(() => ({}))
      if (!r.ok) {
        setMessage({ type: 'error', text: j.error || 'Failed to create user.' })
        setBusy(false)
        return
      }
      setMessage({ type: 'success', text: 'Account created. They can sign in with email/password or Google (if no password set).' })
      setFormOpen(false)
      setForm({
        email: '',
        role: 'CO_FOUNDER',
        password: '',
        displayName: '',
        imageFile: null,
      })
      load()
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error.' })
    } finally {
      setBusy(false)
    }
  }

  async function onEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    setBusy(true)
    setMessage(null)
    try {
      const hasEditImage = editImageFile && editImageFile.size > 0
      const r = hasEditImage
        ? await (() => {
            const fd = new FormData()
            fd.set('displayName', editForm.displayName.trim())
            if (canManageUsers && currentEmail !== editUser.email) fd.set('role', editForm.role)
            if (canManageUsers && currentEmail !== editUser.email) fd.set('email', editForm.email.trim())
            if (editForm.password.trim().length >= 8) fd.set('password', editForm.password.trim())
            fd.set('image', editImageFile!)
            return fetch(`/api/admin/users/${editUser.id}`, {
              method: 'PATCH',
              credentials: 'include',
              body: fd,
            })
          })()
        : await fetch(`/api/admin/users/${editUser.id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              displayName: editForm.displayName.trim() || null,
              imageUrl: editForm.imageUrl.trim() || null,
              ...(canManageUsers && currentEmail !== editUser.email ? { email: editForm.email.trim() } : {}),
              ...(canManageUsers && currentEmail !== editUser.email ? { role: editForm.role } : {}),
              ...(editForm.password.trim().length >= 8 ? { password: editForm.password.trim() } : {}),
            }),
          })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) {
        setMessage({ type: 'error', text: j.error || 'Failed to update user.' })
        setBusy(false)
        return
      }
      setMessage({ type: 'success', text: 'User updated.' })
      setEditForm((f) => ({
        ...f,
        password: '',
        ...(typeof j.imageUrl === 'string' ? { imageUrl: j.imageUrl } : {}),
        ...(typeof j.email === 'string' ? { email: j.email } : {}),
      }))
      setEditImageFile(null)
      load()
      setTimeout(closeEdit, 1500)
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error.' })
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id: string, email: string) {
    if (email === currentEmail) return
    setBusy(true)
    setMessage(null)
    try {
      const r = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) {
        setMessage({ type: 'error', text: j.error || 'Failed to delete user.' })
        setBusy(false)
        setDeleteConfirm(null)
        return
      }
      setMessage({ type: 'success', text: 'User removed.' })
      setDeleteConfirm(null)
      load()
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#044444] dark:text-[#44AAAA] mb-2">Users</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Create and manage admin accounts. Set display name and profile image; they appear in the sidebar.
        </p>
      </div>

      <div className="mb-6">
        <button
          type="button"
          onClick={openForm}
          className="px-4 py-2 bg-[#044444] dark:bg-[#44AAAA] text-white rounded-lg hover:opacity-90"
        >
          + Add admin
        </button>
      </div>

      {formOpen && (
        <div className="mb-8 p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
          <h2 className="text-lg font-semibold text-[#044444] dark:text-[#44AAAA] mb-4">Create admin account</h2>
          <form onSubmit={onSubmit} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="users-email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <input
                id="users-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="users-role" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Role
              </label>
              <select
                id="users-role"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              >
                {ROLES_CREATE.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="users-displayName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Display name (optional)
              </label>
              <input
                id="users-displayName"
                type="text"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                placeholder="Name shown in admin panel"
              />
            </div>
            <div>
              <label htmlFor="users-image" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Profile image (optional)
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                Upload an image file. JPEG, PNG, WebP, or GIF.
              </p>
              {form.imageFile && (
                <div className="mb-2 relative w-16 h-16 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={URL.createObjectURL(form.imageFile)}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <input
                id="users-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setForm((f) => ({ ...f, imageFile: e.target.files?.[0] ?? null }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-[#044444] file:text-white"
              />
            </div>
            <div>
              <label htmlFor="users-password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Password (required, min 8 characters)
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                The user will log in with this password and can change it later in Profile.
              </p>
              <input
                id="users-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>
            {message && (
              <p className={message.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                {message.text}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 bg-[#044444] dark:bg-[#44AAAA] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {busy ? 'Creating…' : 'Create account'}
              </button>
              <button
                type="button"
                onClick={() => { setFormOpen(false); setMessage(null) }}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {editUser && (
        <div className="mb-8 p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
          <h2 className="text-lg font-semibold text-[#044444] dark:text-[#44AAAA] mb-4">Edit user</h2>
          <form onSubmit={onEditSubmit} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <input
                id="edit-email"
                type="email"
                value={editForm.email}
                disabled={!canManageUsers || currentEmail === editUser.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="edit-displayName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Display name
              </label>
              <input
                id="edit-displayName"
                type="text"
                value={editForm.displayName}
                onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label htmlFor="edit-image" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Profile image
              </label>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                Upload a new image to replace the current one. Leave empty to keep current.
              </p>
              {(editImageFile || editForm.imageUrl) && (
                <div className="mb-2 relative w-16 h-16 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={editImageFile ? URL.createObjectURL(editImageFile) : imageSrc(editForm.imageUrl)}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized={!!editImageFile}
                  />
                </div>
              )}
              <input
                id="edit-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setEditImageFile(e.target.files?.[0] ?? null)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-[#044444] file:text-white"
              />
            </div>
            {canManageUsers && currentEmail !== editUser.email && (
              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Role
                </label>
                <select
                  id="edit-role"
                  value={editForm.role}
                  onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                >
                  {ROLES_ALL.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="edit-password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                New password (leave blank to keep current)
              </label>
              <input
                id="edit-password"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                placeholder="Min 8 characters"
              />
            </div>
            {message && (
              <p className={message.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                {message.text}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 bg-[#044444] dark:bg-[#44AAAA] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {busy ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={closeEdit}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {message && !formOpen && (
        <p className={`mb-4 text-sm ${message.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {message.text}
        </p>
      )}

      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-500">Loading…</div>
        ) : list.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No admin users yet.</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-neutral-100 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-300">User</th>
                <th className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-300">Email</th>
                <th className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-300">Role</th>
                <th className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-300">Created</th>
                <th className="px-4 py-3 font-semibold text-neutral-700 dark:text-neutral-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => {
                const isSelf = u.email === currentEmail
                return (
                  <tr key={u.id} className="border-t border-neutral-200 dark:border-neutral-700">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.imageUrl && !brokenImages[u.id] && imageSrc(u.imageUrl) ? (
                          <Image
                            src={imageSrc(u.imageUrl)}
                            alt=""
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-600 object-contain bg-white p-0.5"
                            unoptimized
                            onError={() => setBrokenImages((prev) => ({ ...prev, [u.id]: true }))}
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#044444]/20 dark:bg-[#44AAAA]/20 text-sm font-semibold text-[#044444] dark:text-[#44AAAA]">
                            {(u.displayName || u.email)[0].toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {u.displayName || u.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{u.email}</td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{u.role}</td>
                    <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="text-sm text-[#044444] dark:text-[#44AAAA] hover:underline"
                        >
                          Edit
                        </button>
                        {!isSelf && canManageUsers && (
                          deleteConfirm === u.id ? (
                            <>
                              <span className="text-neutral-500">Remove?</span>
                              <button
                                type="button"
                                onClick={() => onDelete(u.id, u.email)}
                                disabled={busy}
                                className="text-sm text-red-600 dark:text-red-400 hover:underline"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirm(null)}
                                className="text-sm text-neutral-500 hover:underline"
                              >
                                No
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(u.id)}
                              className="text-sm text-red-600 dark:text-red-400 hover:underline"
                            >
                              Delete
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  )
}
