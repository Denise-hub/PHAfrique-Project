import { NextRequest, NextResponse } from 'next/server'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const unauth = await requireSection('content')
    if (unauth) return unauth
    
    const { key } = await params
    const k = decodeURIComponent(key)
    await prisma.content.delete({ where: { key: k } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
