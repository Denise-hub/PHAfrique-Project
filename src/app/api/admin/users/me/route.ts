import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'
import { imageSrc } from '@/lib/image-url'

export const dynamic = 'force-dynamic'

export async function GET() {
  const unauth = await requireAdmin()
  if (unauth) return unauth

  const session = await getServerSession(authOptions)
  const email = session?.user?.email?.toLowerCase().trim()
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, displayName: true, imageUrl: true },
    })
    if (!admin) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({
      ...admin,
      imageUrl: admin.imageUrl ? imageSrc(admin.imageUrl) || null : null,
    })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const unauth = await requireAdmin()
  if (unauth) return unauth

  const session = await getServerSession(authOptions)
  const email = session?.user?.email?.toLowerCase().trim()
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const updates: { displayName?: string | null; imageUrl?: string | null; passwordHash?: string | null } = {}
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const displayNameVal = form.get('displayName')
      if (typeof displayNameVal === 'string') updates.displayName = displayNameVal.trim() || null
      const passwordVal = form.get('password')
      if (typeof passwordVal === 'string' && passwordVal.length >= 8) {
        updates.passwordHash = await hash(passwordVal, 10)
      }
      const imageFile = form.get('image') as File | null
      if (imageFile && imageFile.size > 0) {
        const saved = await saveImageFile(imageFile)
        if (saved) updates.imageUrl = saved
      }
    } else {
      const body = await req.json()
      if (typeof body.displayName === 'string') {
        updates.displayName = body.displayName.trim() || null
      }
      if (typeof body.imageUrl === 'string') {
        updates.imageUrl = body.imageUrl.trim() || null
      }
      if (typeof body.password === 'string' && body.password.length >= 8) {
        updates.passwordHash = await hash(body.password, 10)
      }
    }

    const updated = await prisma.adminUser.update({
      where: { email },
      data: updates,
      select: { id: true, email: true, role: true, displayName: true, imageUrl: true },
    })
    return NextResponse.json({
      ...updated,
      imageUrl: updated.imageUrl ? imageSrc(updated.imageUrl) || null : null,
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
