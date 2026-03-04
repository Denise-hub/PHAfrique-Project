import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Public: list images for the Gallery page (all categories, ordered). */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const list = await prisma.image.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(list)
  } catch (e) {
    console.error('[api/gallery GET]', e)
    return NextResponse.json([])
  }
}
