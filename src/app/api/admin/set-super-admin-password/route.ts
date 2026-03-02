/**
 * One-time setup: set password for denmaombi@gmail.com from ADMIN_PASSWORD in .env.
 * Call once: POST /api/admin/set-super-admin-password with header x-setup-secret matching NEXTAUTH_SECRET.
 * Then sign in with email/password. Disable by removing this route or the secret check.
 */
import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'

const SUPER_ADMIN_EMAIL = 'denmaombi@gmail.com'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-setup-secret') || req.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rawPassword = (process.env.ADMIN_PASSWORD || '').trim()
  if (!rawPassword || rawPassword.length < 8) {
    return NextResponse.json(
      { error: 'Set ADMIN_PASSWORD in .env (min 8 characters) and try again.' },
      { status: 400 }
    )
  }

  try {
    const email = SUPER_ADMIN_EMAIL.toLowerCase().trim()
    const user = await prisma.adminUser.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: 'Admin user not found. Run: npm run db:seed' },
        { status: 404 }
      )
    }

    const passwordHash = await hash(rawPassword, 10)
    await prisma.adminUser.update({
      where: { email },
      data: { passwordHash },
    })
    return NextResponse.json({
      ok: true,
      message: 'Password set for ' + SUPER_ADMIN_EMAIL + '. You can now sign in with email/password.',
    })
  } catch (e) {
    console.error('[set-super-admin-password]', e)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}
