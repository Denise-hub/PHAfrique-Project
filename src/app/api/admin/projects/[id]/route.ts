import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'

const str = (v: unknown) => (v != null ? String(v).trim() || null : null)

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauth = await requireSection('projects')
    if (unauth) return unauth

    const { id } = await params
    const contentType = (req.headers.get('content-type') || '').toLowerCase()
    const isMultipart = contentType.includes('multipart/form-data')
    const data: { title?: string; description?: string | null; imageUrl?: string | null } = {}
    let imageUrlFromFile: string | null = null

    if (isMultipart) {
      const formData = await req.formData()
      const titleVal = formData.get('title')
      if (titleVal != null && typeof titleVal === 'string') {
        const t = titleVal.trim()
        if (t) data.title = t
      }
      const descVal = formData.get('description')
      if (descVal !== undefined && descVal !== null) data.description = descVal === '' ? null : str(descVal)
      const image = formData.get('image')
      if (image instanceof File && image.size > 0) {
        imageUrlFromFile = await saveImageFile(image)
      }
    } else {
      const body = await req.json().catch(() => ({}))
      if (body.title != null) data.title = String(body.title).trim() || undefined
      if (body.description !== undefined) data.description = body.description === null || body.description === '' ? null : body.description
      if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl
    }

    if (imageUrlFromFile !== null) data.imageUrl = imageUrlFromFile

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const p = await prisma.project.update({ where: { id }, data })
    if (process.env.NODE_ENV === 'development') {
      console.log('[admin/projects PUT] updated id=%s keys=%s title=%s imageUrl=%s', id, Object.keys(data).join(','), p.title, p.imageUrl ?? '(null)')
    }
    revalidatePath('/')
    revalidatePath('/portfolios')
    revalidatePath('/', 'layout')
    revalidatePath('/portfolios', 'layout')
    return NextResponse.json(p)
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }
    console.error('Error updating project:', e)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauth = await requireSection('projects')
    if (unauth) return unauth

    const { id } = await params
    await prisma.project.delete({ where: { id } })
    revalidatePath('/')
    revalidatePath('/portfolios')
    revalidatePath('/', 'layout')
    revalidatePath('/portfolios', 'layout')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
