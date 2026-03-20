import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { canAccessSection, effectiveRole, type AdminSection } from './roles'
import { prisma } from '@/lib/db'

function getAdminUserModel() {
  return (prisma as {
    adminUser?: {
      findUnique: (args: unknown) => Promise<unknown>
      findFirst: (args: unknown) => Promise<unknown>
    }
  }).adminUser ?? null
}

async function findAdminByEmail(adminUser: NonNullable<ReturnType<typeof getAdminUserModel>>, email: string) {
  try {
    return await adminUser.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
  } catch {
    return await adminUser.findUnique({ where: { email } })
  }
}

/**
 * Requires admin authentication. Returns null if authorized. Resolves role from DB when session has no role (legacy JWT).
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  let session
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    console.error('Error in requireAdmin (getServerSession):', err)
    return NextResponse.json({ error: 'Please log in again.' }, { status: 401 })
  }
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let role = (session.user as { role?: string }).role
  if (!role) {
    const adminUser = getAdminUserModel()
    if (!adminUser) {
      return NextResponse.json({ error: 'Server configuration error. Run: npx prisma generate' }, { status: 500 })
    }
    try {
      const email = session.user.email.toLowerCase().trim()
      const admin = await findAdminByEmail(adminUser, email) as { role?: string } | null
      if (!admin) return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      role = admin.role
    } catch (err) {
      console.error('Error in requireAdmin (prisma):', err)
      return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 })
    }
  }
  return null
}

/**
 * Requires admin auth and permission for the given section. Uses effectiveRole so legacy sessions (no role in JWT) get SUPER_ADMIN access.
 */
export async function requireSection(section: AdminSection): Promise<NextResponse | null> {
  const auth = await requireAdmin()
  if (auth) return auth
  let session
  try {
    session = await getServerSession(authOptions)
  } catch {
    return NextResponse.json({ error: 'Please log in again.' }, { status: 401 })
  }
  let role = (session?.user as { role?: string } | undefined)?.role
  if (!role && session?.user?.email) {
    const adminUser = getAdminUserModel()
    if (!adminUser) {
      return NextResponse.json({ error: 'Server configuration error. Run: npx prisma generate' }, { status: 500 })
    }
    try {
      const admin = await findAdminByEmail(
        adminUser,
        session.user.email!.toLowerCase().trim()
      ) as { role?: string } | null
      role = admin?.role ?? undefined
    } catch {
      return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 })
    }
  }
  const effective = effectiveRole(role)
  if (!canAccessSection(effective, section)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

/**
 * Get current session with role (for use in server components or when you need role after requireAdmin).
 */
export async function getAdminSession() {
  return getServerSession(authOptions)
}
