import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
const EXT: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' }
const MAX = 5 * 1024 * 1024 // 5MB

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
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const unauth = await requireSection('gallery')
    if (unauth) return unauth
    
    const form = await req.formData()
    const file = form.get('file') as File | null
    const alt = (form.get('alt') as string) || null
    const caption = (form.get('caption') as string) || null
    const category = (form.get('category') as string) || 'gallery'
    const sortOrder = parseInt(String(form.get('sortOrder') || '0'), 10)

    if (!file || !file.size) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }
    if (!ALLOWED.includes(file.type as (typeof ALLOWED)[number])) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' }, { status: 400 })
    }
    if (file.size > MAX) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })
    }

    const year = new Date().getFullYear().toString()
    const dir = path.join(process.cwd(), 'public', 'uploads', year)
    await mkdir(dir, { recursive: true })
    const ext = EXT[file.type] || '.jpg'
    const name = `${randomUUID()}${ext}`
    const filepath = path.join(dir, name)
    const buf = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buf)

    const url = `/uploads/${year}/${name}`
    const img = await prisma.image.create({
      data: { url, alt, caption, category, sortOrder },
    })
    revalidatePath('/gallery')
    return NextResponse.json(img)
  } catch (e) {
    console.error('admin/images POST', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
