import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/** Public: list images for the Gallery page (all categories, ordered). */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const list = await prisma.image.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(list)
}
