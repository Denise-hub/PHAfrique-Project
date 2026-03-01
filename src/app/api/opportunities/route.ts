import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const list = await prisma.opportunity.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(list)
  } catch (e) {
    console.error('[api/opportunities]', e)
    return NextResponse.json([], { status: 200 })
  }
}
