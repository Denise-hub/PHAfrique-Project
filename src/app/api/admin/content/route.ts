import { NextRequest, NextResponse } from 'next/server'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const unauth = await requireSection('content')
    if (unauth) return unauth
    
    const list = await prisma.content.findMany({ orderBy: { key: 'asc' } })
    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const unauth = await requireSection('content')
    if (unauth) return unauth
    
    const body = await req.json().catch(() => ({}))
    const { key, value } = body
    if (!key || typeof key !== 'string' || key.trim() === '') {
      return NextResponse.json({ error: 'key is required' }, { status: 400 })
    }
    const k = key.trim()
    const v = value != null ? String(value) : ''
    
    const c = await prisma.content.upsert({
      where: { key: k },
      create: { key: k, value: v },
      update: { value: v },
    })
    return NextResponse.json(c)
  } catch (e) {
    console.error('admin/content POST', e)
    return NextResponse.json({ error: 'Upsert failed' }, { status: 500 })
  }
}
