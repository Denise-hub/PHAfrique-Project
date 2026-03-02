import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'
import { ROLES, type Role } from '@/lib/roles'

export const dynamic = 'force-dynamic'

const ALLOWED_CREATE_ROLES: Role[] = [
  ROLES.CO_FOUNDER,
  ROLES.SOCIAL_MEDIA_MANAGER,
  ROLES.NEWSLETTER_MANAGER,
]

export async function GET() {
  const unauth = await requireSection('users')
  if (unauth) return unauth

  try {
    const users = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, role: true, displayName: true, imageUrl: true, createdAt: true },
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

function parseCreateBody(
  body: Record<string, unknown>
): { email: string; role: string; password?: string; displayName?: string | null; imageUrl?: string | null } {
  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''
  const role = typeof body.role === 'string' ? body.role.trim() : ''
  const password = typeof body.password === 'string' ? body.password : undefined
  const displayName = typeof body.displayName === 'string' ? body.displayName.trim() || null : null
  const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() || null : null
  return { email, role, password, displayName, imageUrl }
}

export async function POST(req: NextRequest) {
  const unauth = await requireSection('users')
  if (unauth) return unauth

  try {
    const contentType = req.headers.get('content-type') || ''
    let email: string
    let role: string
    let password: string | undefined
    let displayName: string | null = null
    let imageUrl: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      email = (formData.get('email') as string)?.toLowerCase?.()?.trim() || ''
      role = (formData.get('role') as string)?.trim() || ''
      const pw = formData.get('password') as string
      password = typeof pw === 'string' && pw.length >= 8 ? pw : undefined
      const dn = formData.get('displayName') as string
      displayName = typeof dn === 'string' && dn.trim() ? dn.trim() : null
      const imgUrl = formData.get('imageUrl') as string
      if (typeof imgUrl === 'string' && imgUrl.trim()) imageUrl = imgUrl.trim()
      const imageFile = formData.get('image') as File | null
      if (imageFile && imageFile.size > 0) {
        const saved = await saveImageFile(imageFile)
        if (saved) imageUrl = saved
      }
    } else {
      const body = await req.json().catch(() => ({}))
      const parsed = parseCreateBody(body)
      email = parsed.email
      role = parsed.role
      password = parsed.password
      displayName = parsed.displayName ?? null
      imageUrl = parsed.imageUrl ?? null
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (!ALLOWED_CREATE_ROLES.includes(role as Role)) {
      return NextResponse.json(
        { error: 'Role must be one of: CO_FOUNDER, SOCIAL_MEDIA_MANAGER, NEWSLETTER_MANAGER' },
        { status: 400 }
      )
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password is required and must be at least 8 characters so the user can log in.' },
        { status: 400 }
      )
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 409 })
    }

    const passwordHash = await hash(password!, 10)

    const user = await prisma.adminUser.create({
      data: { email, role, passwordHash, displayName, imageUrl },
      select: { id: true, email: true, role: true, displayName: true, imageUrl: true, createdAt: true },
    })
    return NextResponse.json(user)
  } catch (error) {
    const err = error as { code?: string; message?: string }
    console.error('Error creating admin user:', error)
    const msg = String(err.message ?? '')
    const schemaOutOfDate =
      err.code === 'P2022' ||
      msg.includes('no such column') ||
      msg.includes('displayName') ||
      msg.includes('imageUrl')
    if (schemaOutOfDate) {
      return NextResponse.json(
        {
          error:
            'Database schema is out of date. From the project root run: node prisma/sync-admin-user-schema.js then try again.',
        },
        { status: 500 }
      )
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
