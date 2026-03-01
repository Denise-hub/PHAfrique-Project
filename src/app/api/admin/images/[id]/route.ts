import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauth = await requireSection('gallery')
    if (unauth) return unauth
    
    const { id } = await params
    const body = await req.json().catch(() => ({}))
  const { alt, caption, category, sortOrder } = body
  const data: { alt?: string; caption?: string; category?: string; sortOrder?: number } = {}
  if (alt !== undefined) data.alt = alt
  if (caption !== undefined) data.caption = caption
  if (category !== undefined) data.category = category
    if (typeof sortOrder === 'number') data.sortOrder = sortOrder
    
    const img = await prisma.image.update({ where: { id }, data })
    revalidatePath('/gallery')
    return NextResponse.json(img)
  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauth = await requireSection('gallery')
    if (unauth) return unauth
    
    const { id } = await params
    await prisma.image.delete({ where: { id } })
    revalidatePath('/gallery')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
