import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'
import { handleApiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'
const str = (v: unknown) => (v != null ? String(v).trim() || null : null)

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    const newsletter = await prisma.newsletter.update({
      where: { id: params.id },
      data: {
        title,
        content,
        link,
        imageUrl,
        publishedAt: publishedAtStr ? new Date(publishedAtStr) : undefined,
      },
    })
    
    revalidatePath('/news')
    return NextResponse.json(newsletter)
  } catch (e) {
    return handleApiError('admin/newsletters PUT', e, 'Update failed')
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const unauth = await requireSection('newsletters')
    if (unauth) return unauth

    await prisma.newsletter.delete({
      where: { id: params.id },
    })
    
    revalidatePath('/news')
    return NextResponse.json({ success: true })
  } catch (e) {
    return handleApiError('admin/newsletters DELETE', e, 'Delete failed')
  }
}
