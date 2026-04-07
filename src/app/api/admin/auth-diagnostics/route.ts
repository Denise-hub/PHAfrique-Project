import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import crypto from 'crypto'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { effectiveRole, ROLES } from '@/lib/roles'

export const dynamic = 'force-dynamic'

const LEGACY_EMAILS = [
  'queren.basemenane@phafrique.org',
  'munashe.faranisi@phafrique.org',
  'kabala@phafrique.org',
  'jemima.lotika@phafrique.org',
  'eunice.tshilengu@phafrique.org',
]

function maskEmail(email: string) {
  const [name, domain] = email.split('@')
  if (!name || !domain) return email
  if (name.length <= 2) return `**@${domain}`
  return `${name[0]}${'*'.repeat(Math.max(1, name.length - 2))}${name[name.length - 1]}@${domain}`
}

function dbFingerprint(url: string | undefined) {
  const raw = String(url || '')
  if (!raw) return 'missing'
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 12)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  const role = effectiveRole((session?.user as { role?: string } | undefined)?.role)
  if (!session?.user?.email || role !== ROLES.SUPER_ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const admins = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: { email: true, role: true, passwordHash: true, createdAt: true },
    })
    const emails = new Set(admins.map((a) => a.email.toLowerCase().trim()))
    const legacyPresence = LEGACY_EMAILS.map((email) => ({
      email: maskEmail(email),
      exists: emails.has(email),
    }))

    return NextResponse.json({
      env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
      dbFingerprint: dbFingerprint(process.env.DATABASE_URL),
      nextAuthUrl: process.env.NEXTAUTH_URL || 'missing',
      seedDefaultAdminTeam: process.env.SEED_DEFAULT_ADMIN_TEAM === 'true',
      adminCount: admins.length,
      legacyPresence,
      admins: admins.map((a) => ({
        email: maskEmail(a.email),
        role: a.role,
        hasPasswordHash: !!a.passwordHash,
        createdAt: a.createdAt,
      })),
    })
  } catch (error) {
    console.error('[admin/auth-diagnostics]', error)
    return NextResponse.json({ error: 'Failed to query admin diagnostics' }, { status: 500 })
  }
}
