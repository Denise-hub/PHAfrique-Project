import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Public: list events, optionally future-only. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const future = searchParams.get('future') === '1'
  const list = await prisma.event.findMany({
    orderBy: { startDate: 'desc' },
    where: future ? { startDate: { gte: new Date() } } : undefined,
  })
  return NextResponse.json(list)
}
