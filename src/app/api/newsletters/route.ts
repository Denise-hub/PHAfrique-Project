import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'
import { handleApiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'
const str = (v: unknown) => (v != null ? String(v).trim() || null : null)

export async function GET() {
  const newsletters = await prisma.newsletter.findMany({
    orderBy: { publishedAt: 'desc' },
  })
  return NextResponse.json(newsletters)
}

export async function POST(req: NextRequest) {
  try {
    const unauth = await requireSection('newsletters')
    if (unauth) return unauth

    const formData = await req.formData()
    const title = str(formData.get('title'))
    const content = str(formData.get('content'))
    const link = str(formData.get('link'))
    const publishedAtStr = str(formData.get('publishedAt'))
    let imageUrl = str(formData.get('imageUrl'))

    const image = formData.get('image')
    if (image instanceof File && image.size > 0) {
      imageUrl = await saveImageFile(image)
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const newsletter = await prisma.newsletter.create({
      data: {
        title,
        content,
        link,
        imageUrl,
        publishedAt: publishedAtStr ? new Date(publishedAtStr) : new Date(),
      },
    })
    
    revalidatePath('/news')
    return NextResponse.json(newsletter)
  } catch (e) {
    return handleApiError('admin/newsletters POST', e, 'Create failed')
  }
}

