import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'

export const dynamic = 'force-dynamic'

const str = (v: unknown) => (v != null ? String(v).trim() || null : null)

export async function GET(req: NextRequest) {
  try {
    const unauth = await requireSection('news')
    if (unauth) return unauth

    const list = await prisma.event.findMany({ orderBy: { startDate: 'desc' } })
    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const unauth = await requireSection('news')
    if (unauth) return unauth

    const contentType = req.headers.get('content-type') || ''
    let title: string | null = null
    let description: string | null = null
    let location: string | null = null
    let startDate: string | null = null
    let endDate: string | null = null
    let imageUrl: string | null = null
    let link: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      title = str(formData.get('title')) || null
      description = str(formData.get('description'))
      location = str(formData.get('location'))
      startDate = str(formData.get('startDate')) || null
      endDate = str(formData.get('endDate'))
      link = str(formData.get('link'))
      const image = formData.get('image')
      if (image instanceof File && image.size > 0) {
        try {
          imageUrl = await saveImageFile(image)
        } catch (e) {
          console.error('admin/events POST image upload:', e)
          return NextResponse.json(
            { error: (e as Error).message || 'Image upload failed. Try a smaller file or check Cloudinary.' },
            { status: 500 }
          )
        }
      }
    } else {
      const body = await req.json().catch(() => ({}))
      title = body.title ? String(body.title).trim() : null
      description = str(body.description)
      location = str(body.location)
      startDate = body.startDate ? String(body.startDate).trim() : null
      endDate = body.endDate != null ? String(body.endDate).trim() || null : null
      imageUrl = str(body.imageUrl)
      link = str(body.link)
    }

    if (!title || !startDate) {
      return NextResponse.json({ error: 'title and startDate are required' }, { status: 400 })
    }

    const ev = await prisma.event.create({
      data: {
        title,
        description: description ?? null,
        location: location ?? null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        imageUrl: imageUrl ?? null,
        link: link ?? null,
      },
    })
    revalidatePath('/news')
    return NextResponse.json(ev)
  } catch (e) {
    console.error('admin/events POST', e)
    const msg = (e as Error).message || 'Create failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
