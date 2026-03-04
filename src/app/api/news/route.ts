import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Public: list news items (events) for the News page, newest first. */
export async function GET() {
  const list = await prisma.event.findMany({
    orderBy: { startDate: 'desc' },
  })
  return NextResponse.json(list)
}
