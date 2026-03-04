import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'
import { handleApiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

const str = (v: unknown) => (v != null ? String(v).trim() || null : null)

function slugFromTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export async function GET() {
  try {
    const unauth = await requireSection('projects')
    if (unauth) return unauth

    const list = await prisma.project.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(list)
  } catch (e) {
    return handleApiError('admin/projects GET', e, 'Failed to fetch projects')
  }
}

export async function POST(req: NextRequest) {
  try {
    const unauth = await requireSection('projects')
    if (unauth) return unauth

    const contentType = req.headers.get('content-type') || ''
    let title: string | null = null
    let description: string | null = null
    let imageUrl: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      title = str(formData.get('title')) || null
      description = str(formData.get('description'))
      const image = formData.get('image')
      imageUrl = await saveImageFile(image instanceof File ? image : null)
    } else {
      const body = await req.json().catch(() => ({}))
      title = body.title ? String(body.title).trim() : null
      description = str(body.description)
      imageUrl = body.imageUrl ? String(body.imageUrl).trim() || null : null
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const slugNorm = slugFromTitle(title)

    const p = await prisma.project.create({
      data: {
        title,
        slug: slugNorm,
        description: description ?? null,
        imageUrl: imageUrl ?? null,
        link: null,
        publishedAt: null,
        sortOrder: 0,
      },
    })
    revalidatePath('/')
    revalidatePath('/portfolios')
    revalidatePath('/', 'layout')
    revalidatePath('/portfolios', 'layout')
    return NextResponse.json(p)
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'A portfolio with that title already exists. Try a different title.' }, { status: 400 })
    }
    return handleApiError('admin/projects POST', e, 'Create failed')
  }
}
