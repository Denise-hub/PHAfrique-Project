/**
 * One-time fix: ensure SUPER_ADMIN row exists in the database.
 * GET /api/debug/ensure-super-admin?key=YOUR_NEXTAUTH_SECRET
 * Creates denmaombi@gmail.com if missing and sets password from ADMIN_PASSWORD. Safe to call multiple times.
 */
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'

const SUPER_ADMIN_EMAIL = 'denmaombi@gmail.com'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production'
  if (isProduction) {
    const key = req.nextUrl.searchParams.get('key')
    if (key !== process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const envPassword = (process.env.ADMIN_PASSWORD || '')
    .replace(/\r\n?|\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  try {
    const email = SUPER_ADMIN_EMAIL.toLowerCase().trim()
    const existing = await prisma.adminUser.findUnique({ where: { email } })
    if (existing) {
      if (envPassword.length >= 8 && existing.passwordHash) {
        return NextResponse.json({
          ok: true,
          message: 'SUPER_ADMIN already exists. Sign in with email/password.',
          email: SUPER_ADMIN_EMAIL,
        })
      }
      if (envPassword.length >= 8) {
        const passwordHash = await hash(envPassword, 10)
        await prisma.adminUser.update({ where: { email }, data: { passwordHash } })
        return NextResponse.json({
          ok: true,
          message: 'SUPER_ADMIN password set from ADMIN_PASSWORD. Sign in with email/password.',
          email: SUPER_ADMIN_EMAIL,
        })
      }
      return NextResponse.json({
        ok: true,
        message: 'SUPER_ADMIN exists. Set ADMIN_PASSWORD (min 8 chars) in env and call again to set password.',
        email: SUPER_ADMIN_EMAIL,
      })
    }

    const passwordHash = envPassword.length >= 8 ? await hash(envPassword, 10) : null
    await prisma.adminUser.upsert({
      where: { email },
      create: { email, role: 'SUPER_ADMIN', passwordHash },
      update: { role: 'SUPER_ADMIN', ...(passwordHash ? { passwordHash } : {}) },
    })
    return NextResponse.json({
      ok: true,
      message: 'SUPER_ADMIN created. Sign in with ' + SUPER_ADMIN_EMAIL + ' and your ADMIN_PASSWORD.',
      email: SUPER_ADMIN_EMAIL,
    })
  } catch (e) {
    console.error('[ensure-super-admin]', e)
    return NextResponse.json(
      { error: 'Failed to ensure super admin', detail: (e as Error).message },
      { status: 500 }
    )
  }
}
