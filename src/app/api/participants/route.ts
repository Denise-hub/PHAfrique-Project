import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { imageSrc } from '@/lib/image-url'

export const dynamic = 'force-dynamic'

/** Prisma client can miss participant model if server was started without running generate. */
function ensureParticipantModel() {
  if (typeof (prisma as { participant?: unknown }).participant === 'undefined') {
    return 'Database client is out of sync. Run: npm run dev (it runs Prisma generate automatically). If the problem persists, run npm run db:push then restart the server.'
  }
  return null
}

/**
 * Public API: list interns and/or volunteers for the opportunities page.
 * GET /api/participants
 * Query: type=INTERN | type=VOLUNTEER (optional; if omitted returns all active)
 */
export async function GET(req: NextRequest) {
  try {
    const syncErr = ensureParticipantModel()
    if (syncErr) return NextResponse.json([], { status: 200 })

    const { searchParams } = new URL(req.url)
    const typeParam = searchParams.get('type')?.toUpperCase()
    const typeFilter = typeParam === 'VOLUNTEER' ? 'VOLUNTEER' : typeParam === 'INTERN' ? 'INTERN' : null

    const list = await prisma.participant.findMany({
      where: {
        isActive: true,
        ...(typeFilter ? { type: typeFilter } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        type: true,
        name: true,
        role: true,
        imageUrl: true,
        bio: true,
        linkedInUrl: true,
        sortOrder: true,
        startDate: true,
        endDate: true,
      },
    })
    return NextResponse.json(
      list.map((p) => ({
        ...p,
        imageUrl: p.imageUrl ? imageSrc(p.imageUrl) || null : null,
      })),
    )
  } catch (error) {
    console.error('[api/participants GET]', error)
    return NextResponse.json([])
  }
}
