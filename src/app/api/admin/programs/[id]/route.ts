import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'
import { authOptions } from '@/lib/auth'
import { effectiveRole, ROLES } from '@/lib/roles'

const str = (v: unknown) => (v != null ? String(v).trim() || null : null)

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauth = await requireSection('programs')
    if (unauth) return unauth

    const session = await getServerSession(authOptions)
    const role = effectiveRole((session?.user as { role?: string } | undefined)?.role)
    if (role !== ROLES.SUPER_ADMIN && role !== ROLES.CO_FOUNDER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const contentType = req.headers.get('content-type') || ''
    const data: { title?: string; slug?: string; description?: string | null; imageUrl?: string | null; sortOrder?: number } = {}
    let imageUrlFromFile: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const titleVal = formData.get('title')
      if (titleVal != null) data.title = str(titleVal) ?? undefined
      const slugVal = formData.get('slug')
      if (slugVal != null) data.slug = str(slugVal) ? String(slugVal).trim().toLowerCase().replace(/\s+/g, '-') : undefined
      const descVal = formData.get('description')
      if (descVal !== undefined) data.description = str(descVal)
      const so = formData.get('sortOrder')
      if (so != null) data.sortOrder = Number(so) || 0
      const image = formData.get('image')
      imageUrlFromFile = await saveImageFile(image instanceof File ? image : null)
    } else {
      const body = await req.json().catch(() => ({}))
      if (body.title != null) data.title = body.title
      if (body.slug != null) data.slug = String(body.slug).trim().toLowerCase().replace(/\s+/g, '-')
      if (body.description !== undefined) data.description = body.description
      if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl
      if (body.sortOrder != null) data.sortOrder = Number(body.sortOrder)
    }

    if (imageUrlFromFile !== null) data.imageUrl = imageUrlFromFile

    const p = await prisma.program.update({ where: { id }, data })
    revalidatePath('/', 'layout')
    revalidatePath('/programs', 'layout')
    if (p.slug) revalidatePath(`/programs/${p.slug}`, 'layout')
    return NextResponse.json(p)
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }
    console.error('Error updating program:', e)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauth = await requireSection('programs')
    if (unauth) return unauth

    const session = await getServerSession(authOptions)
    const role = effectiveRole((session?.user as { role?: string } | undefined)?.role)
    if (role !== ROLES.SUPER_ADMIN && role !== ROLES.CO_FOUNDER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await prisma.program.delete({ where: { id } })
    revalidatePath('/', 'layout')
    revalidatePath('/programs', 'layout')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting program:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
