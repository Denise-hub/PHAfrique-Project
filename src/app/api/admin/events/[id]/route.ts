import { NextRequest, NextResponse } from 'next/server'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'

export const dynamic = 'force-dynamic'

const str = (v: unknown) => (v != null ? String(v).trim() || null : null)

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauth = await requireSection('news')
    if (unauth) return unauth

    const { id } = await params
    const contentType = req.headers.get('content-type') || ''
    const data: {
      title?: string
      description?: string | null
      location?: string | null
      startDate?: Date
      endDate?: Date | null
      imageUrl?: string | null
      link?: string | null
    } = {}

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const titleVal = str(formData.get('title'))
      if (titleVal != null) data.title = titleVal
      if (formData.has('description')) data.description = str(formData.get('description'))
      if (formData.has('location')) data.location = str(formData.get('location'))
      const startVal = str(formData.get('startDate'))
      if (startVal != null) data.startDate = new Date(startVal)
      if (formData.has('endDate')) data.endDate = str(formData.get('endDate')) ? new Date(str(formData.get('endDate'))!) : null
      if (formData.has('link')) data.link = str(formData.get('link'))
      const image = formData.get('image')
      if (image instanceof File && image.size > 0) {
        data.imageUrl = await saveImageFile(image)
      } else if (formData.has('imageUrl')) {
        const urlVal = str(formData.get('imageUrl'))
        data.imageUrl = urlVal === '' ? null : urlVal
      }
    } else {
      const body = await req.json().catch(() => ({}))
      if (body.title != null) data.title = body.title
      if (body.description !== undefined) data.description = body.description
      if (body.location !== undefined) data.location = body.location
      if (body.startDate != null) data.startDate = new Date(body.startDate)
      if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null
      if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl
      if (body.link !== undefined) data.link = body.link
    }

    const ev = await prisma.event.update({ where: { id }, data })
    return NextResponse.json(ev)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauth = await requireSection('news')
    if (unauth) return unauth
    
    const { id } = await params
    await prisma.event.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
