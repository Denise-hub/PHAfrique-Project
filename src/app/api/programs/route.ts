import { NextResponse } from 'next/server'
import { unstable_noStore } from 'next/cache'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    unstable_noStore()
    const list = await prisma.program.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
    const res = NextResponse.json(list)
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    return res
  } catch (e) {
    console.error('[api/programs]', e)
    return NextResponse.json([], {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' },
    })
  }
}
