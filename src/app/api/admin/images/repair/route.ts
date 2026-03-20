import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { effectiveRole, ROLES } from '@/lib/roles'
import { imageSrc } from '@/lib/image-url'

export const dynamic = 'force-dynamic'

type RepairRow = { id: string; imageUrl: string | null }

function normalizeStoredImageUrl(value: string | null): string | null {
  if (!value) return null
  const normalized = imageSrc(value)
  return normalized || null
}

async function repairTable(
  rows: RepairRow[],
  updateFn: (id: string, imageUrl: string | null) => Promise<unknown>,
) {
  let updated = 0
  let unchanged = 0
  for (const row of rows) {
    const normalized = normalizeStoredImageUrl(row.imageUrl)
    if ((row.imageUrl ?? null) === normalized) {
      unchanged += 1
      continue
    }
    await updateFn(row.id, normalized)
    updated += 1
  }
  return { updated, unchanged, total: rows.length }
}

export async function POST() {
  const session = await getServerSession(authOptions)
  const role = effectiveRole((session?.user as { role?: string } | undefined)?.role)
  if (!session?.user?.email || (role !== ROLES.SUPER_ADMIN && role !== ROLES.ADMIN)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const [participants, adminUsers] = await Promise.all([
      prisma.participant.findMany({ where: { imageUrl: { not: null } }, select: { id: true, imageUrl: true } }),
      prisma.adminUser.findMany({ where: { imageUrl: { not: null } }, select: { id: true, imageUrl: true } }),
    ])

    const participantResult = await repairTable(participants, (id, imageUrl) =>
      prisma.participant.update({ where: { id }, data: { imageUrl } }),
    )
    const adminResult = await repairTable(adminUsers, (id, imageUrl) =>
      prisma.adminUser.update({ where: { id }, data: { imageUrl } }),
    )

    return NextResponse.json({
      ok: true,
      participants: participantResult,
      adminUsers: adminResult,
    })
  } catch (error) {
    console.error('[admin/images/repair]', error)
    return NextResponse.json({ error: 'Failed to repair image URLs' }, { status: 500 })
  }
}
