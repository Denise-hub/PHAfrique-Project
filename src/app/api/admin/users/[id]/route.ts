import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'
import { ROLES, effectiveRole, type Role } from '@/lib/roles'

export const dynamic = 'force-dynamic'

const ALLOWED_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.CO_FOUNDER,
  ROLES.SOCIAL_MEDIA_MANAGER,
  ROLES.NEWSLETTER_MANAGER,
]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireSection('users')
  if (unauth) return unauth

  const { id } = await params
  const session = await getServerSession(authOptions)
  const currentEmail = session?.user?.email?.toLowerCase().trim()
  const currentRole = effectiveRole((session?.user as { role?: string })?.role)

  try {
    const admin = await prisma.adminUser.findUnique({ where: { id } })
    if (!admin) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const isSelf = currentEmail === admin.email
    const canEditOthers = currentRole === ROLES.SUPER_ADMIN

    if (!isSelf && !canEditOthers) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const contentType = req.headers.get('content-type') || ''
    const updates: { role?: string; displayName?: string | null; imageUrl?: string | null; passwordHash?: string | null } = {}

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const displayNameVal = form.get('displayName')
      if (typeof displayNameVal === 'string') updates.displayName = displayNameVal.trim() || null
      const roleVal = form.get('role')
      if (canEditOthers && typeof roleVal === 'string' && ALLOWED_ROLES.includes(roleVal as Role)) {
        updates.role = roleVal
      }
      const passwordVal = form.get('password')
      if (typeof passwordVal === 'string' && passwordVal.length >= 8) {
        updates.passwordHash = await hash(passwordVal, 10)
      } else if (passwordVal === null || passwordVal === '') {
        updates.passwordHash = null
      }
      const imageFile = form.get('image') as File | null
      if (imageFile && imageFile.size > 0) {
        const saved = await saveImageFile(imageFile)
        if (saved) updates.imageUrl = saved
      }
    } else {
      const body = await req.json()
      if (typeof body.displayName === 'string') {
        updates.displayName = body.displayName.trim() || null
      }
      if (typeof body.imageUrl === 'string') {
        updates.imageUrl = body.imageUrl.trim() || null
      }
      if (canEditOthers && typeof body.role === 'string' && ALLOWED_ROLES.includes(body.role as Role)) {
        updates.role = body.role
      }
      if (typeof body.password === 'string' && body.password.length >= 8) {
        updates.passwordHash = await hash(body.password, 10)
      } else if (body.password === null || body.password === '') {
        updates.passwordHash = null
      }
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data: updates,
      select: { id: true, email: true, role: true, displayName: true, imageUrl: true, createdAt: true },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating admin user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireSection('users')
  if (unauth) return unauth

  const { id } = await params
  const session = await getServerSession(authOptions)
  const currentEmail = session?.user?.email?.toLowerCase().trim()

  try {
    const admin = await prisma.adminUser.findUnique({ where: { id } })
    if (!admin) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (admin.email === currentEmail) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
    }

    await prisma.adminUser.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting admin user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
