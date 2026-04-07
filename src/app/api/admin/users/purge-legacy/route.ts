import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
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
] as const

function normalize(list: readonly string[]) {
  return Array.from(new Set(list.map((v) => v.toLowerCase().trim())))
}

export async function POST() {
  const session = await getServerSession(authOptions)
  const role = effectiveRole((session?.user as { role?: string } | undefined)?.role)
  if (!session?.user?.email || role !== ROLES.SUPER_ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const emails = normalize(LEGACY_EMAILS)

  try {
    const existing = await prisma.adminUser.findMany({
      where: { email: { in: emails } },
      select: { id: true, email: true },
    })
    if (!existing.length) {
      return NextResponse.json({ ok: true, deleted: 0, emails })
    }

    const ids = existing.map((u) => u.id)
    await prisma.adminUser.deleteMany({ where: { id: { in: ids } } })

    return NextResponse.json({
      ok: true,
      deleted: ids.length,
      emails: existing.map((u) => u.email),
    })
  } catch (error) {
    console.error('[admin/users/purge-legacy]', error)
    return NextResponse.json({ error: 'Failed to purge legacy admin users' }, { status: 500 })
  }
}

