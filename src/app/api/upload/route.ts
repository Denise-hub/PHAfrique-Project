import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { uploadImageToCloudinary } from '@/lib/upload'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * POST /api/upload
 * Multipart form-data with field "file" (image).
 * Uploads to Cloudinary (signed, server-side secret), returns { url } (secure_url).
 * Store only this URL in Neon (Prisma); do not store file or base64.
 * Admin auth required.
 */
export async function POST(req: NextRequest) {
  const unauth = await requireAdmin()
  if (unauth) return unauth

  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json(
      { error: 'Content-Type must be multipart/form-data' },
      { status: 400 }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch (e) {
    console.error('[api/upload] formData parse:', e)
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = (formData.get('file') || formData.get('image')) as File | null
  if (!file || typeof file.size !== 'number' || file.size === 0) {
    return NextResponse.json(
      { error: 'No file provided. Use form field "file" or "image".' },
      { status: 400 }
    )
  }

  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return NextResponse.json(
      { error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File too large. Max ${MAX_SIZE / 1024 / 1024}MB.` },
      { status: 400 }
    )
  }

  try {
    const url = await uploadImageToCloudinary(file)
    return NextResponse.json({ url })
  } catch (e) {
    const msg = (e as Error).message
    console.error('[api/upload]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
