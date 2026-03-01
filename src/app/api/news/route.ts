import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/** Public: list news items (events) for the News page, newest first. */
export async function GET() {
  const list = await prisma.event.findMany({
    orderBy: { startDate: 'desc' },
  })
  return NextResponse.json(list)
}
