import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'
import { handleApiError } from '@/lib/api-error'
import { authOptions } from '@/lib/auth'
import { effectiveRole, ROLES } from '@/lib/roles'

export const dynamic = 'force-dynamic'

const str = (v: unknown) => (v != null ? String(v).trim() || null : null)

export async function GET() {
  try {
    const unauth = await requireSection('programs')
    if (unauth) return unauth

    const list = await prisma.program.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json(list)
  } catch (e) {
    return handleApiError('admin/programs GET', e, 'Failed to fetch programs')
  }
}

export async function POST(req: NextRequest) {
  try {
    const unauth = await requireSection('programs')
    if (unauth) return unauth

    const session = await getServerSession(authOptions)
    const role = effectiveRole((session?.user as { role?: string } | undefined)?.role)
    if (role !== ROLES.SUPER_ADMIN && role !== ROLES.CO_FOUNDER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const contentType = req.headers.get('content-type') || ''
    let title: string | null = null
    let slugNorm: string | null = null
    let description: string | null = null
    let imageUrl: string | null = null
    let sortOrder = 0

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      title = str(formData.get('title')) || null
      const slugRaw = str(formData.get('slug'))
      slugNorm = slugRaw ? slugRaw.toLowerCase().replace(/\s+/g, '-') : null
      description = str(formData.get('description'))
      const image = formData.get('image')
      imageUrl = await saveImageFile(image instanceof File ? image : null)
      const so = formData.get('sortOrder')
      if (so != null) sortOrder = Number(so) || 0
    } else {
      const body = await req.json().catch(() => ({}))
      title = body.title ? String(body.title).trim() : null
      const slugRaw = body.slug ? String(body.slug).trim() : null
      slugNorm = slugRaw ? slugRaw.toLowerCase().replace(/\s+/g, '-') : null
      description = str(body.description)
      imageUrl = body.imageUrl ? String(body.imageUrl).trim() || null : null
      sortOrder = body.sortOrder != null ? Number(body.sortOrder) : 0
    }

    if (!title || !slugNorm) {
      return NextResponse.json({ error: 'title and slug are required' }, { status: 400 })
    }

    const p = await prisma.program.create({
      data: {
        title,
        slug: slugNorm,
        description: description ?? null,
        imageUrl: imageUrl ?? null,
        sortOrder,
      },
    })
    revalidatePath('/', 'layout')
    revalidatePath('/programs', 'layout')
    return NextResponse.json(p)
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }
    return handleApiError('admin/programs POST', e, 'Create failed')
  }
}
