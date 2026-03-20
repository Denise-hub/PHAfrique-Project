import { NextRequest, NextResponse } from 'next/server'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const unauth = await requireSection('applications')
    if (unauth) return unauth
    
    const { searchParams } = new URL(req.url)
    const opportunityId = searchParams.get('opportunityId')
    const type = (searchParams.get('type') || '').toUpperCase()
    const where: {
      opportunityId?: string
      opportunity?: { type: string }
    } = {}
    if (opportunityId) where.opportunityId = opportunityId
    if (type === 'VOLUNTEER' || type === 'INTERNSHIP') where.opportunity = { type }
    const list = await prisma.application.findMany({
      where,
      include: { opportunity: { select: { title: true, slug: true, type: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
