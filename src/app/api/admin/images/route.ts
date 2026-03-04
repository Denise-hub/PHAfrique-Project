import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'
import { handleApiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
// Match /api/upload limit and Cloudinary defaults so larger hero/gallery images don't fail unexpectedly.
const MAX = 10 * 1024 * 1024 // 10MB

export async function GET(req: NextRequest) {
  try {
    const unauth = await requireSection('gallery')
    if (unauth) return unauth

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const list = await prisma.image.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(list)
  } catch (e) {
    return handleApiError('admin/images GET', e, 'Failed to fetch images')
  }
}

export async function POST(req: NextRequest) {
  try {
    const unauth = await requireSection('gallery')
    if (unauth) return unauth
    
    const form = await req.formData()
    const file = (form.get('file') || form.get('image')) as File | null
    const alt = (form.get('alt') as string) || null
    const caption = (form.get('caption') as string) || null
    const category = (form.get('category') as string) || 'gallery'
    const sortOrder = parseInt(String(form.get('sortOrder') || '0'), 10)

    if (!file || typeof file.size !== 'number' || file.size === 0) {
      return NextResponse.json({ error: 'File is required. Choose an image from your device.' }, { status: 400 })
    }
    if (!ALLOWED.includes(file.type as (typeof ALLOWED)[number])) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' }, { status: 400 })
    }
    if (file.size > MAX) {
      return NextResponse.json({ error: `File too large. Max ${MAX / 1024 / 1024}MB.` }, { status: 400 })
    }

    let url: string | null = null
    try {
      url = await saveImageFile(file)
    } catch (e) {
      console.error('admin/images POST saveImageFile:', e)
      const msg = (e as Error).message || 'Upload failed'
      return NextResponse.json({ error: msg.startsWith('Upload failed') ? msg : `Upload failed: ${msg}` }, { status: 500 })
    }
    if (!url) {
      return NextResponse.json({ error: 'Upload failed. Check Cloudinary config or try a smaller image.' }, { status: 500 })
    }

    const img = await prisma.image.create({
      data: { url, alt, caption, category, sortOrder },
    })
    revalidatePath('/gallery')
    return NextResponse.json(img)
  } catch (e) {
    return handleApiError('admin/images POST', e, 'Upload or create failed')
  }
}
