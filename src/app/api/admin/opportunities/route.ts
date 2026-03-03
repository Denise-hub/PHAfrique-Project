import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'
import { authOptions } from '@/lib/auth'
import { effectiveRole, ROLES } from '@/lib/roles'

export const dynamic = 'force-dynamic'

function normalizeOpportunityType(t: string): string {
  const v = String(t).toLowerCase()
  if (v === 'internship') return 'INTERNSHIP'
  if (v === 'volunteering' || v === 'volunteer') return 'VOLUNTEER'
  return v
}

function slugFromTitle(t: string): string {
  return String(t).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export async function GET() {
  try {
    const unauth = await requireSection('opportunities')
    if (unauth) return unauth

    const list = await prisma.opportunity.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const unauth = await requireSection('opportunities')
    if (unauth) return unauth
    const contentType = req.headers.get('content-type') || ''

    const session = await getServerSession(authOptions)
    const role = effectiveRole((session?.user as { role?: string } | undefined)?.role)
    if (role !== ROLES.SUPER_ADMIN && role !== ROLES.CO_FOUNDER && role !== ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let title: string | null = null
    let type: string | null = null
    let description: string | null = null
    let location: string | null = null
    let duration: string | null = null
    let roleOverview: string | null = null
    let requirements: string | null = null
    let whatYouGain: string | null = null
    let startDate: Date | null = null
    let expiryDate: Date | null = null
    let imageUrl: string | null = null

    const str = (v: unknown) => (v != null ? String(v).trim() || null : null)

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      title = str(formData.get('title')) || null
      type = (formData.get('type') ?? '').toString()
      description = str(formData.get('description'))
      location = str(formData.get('location'))
      duration = str(formData.get('duration'))
      roleOverview = str(formData.get('roleOverview'))
      requirements = str(formData.get('requirements'))
      whatYouGain = str(formData.get('whatYouGain'))
      const start = (formData.get('startDate') ?? '').toString().trim()
      const expiry = (formData.get('expiryDate') ?? '').toString().trim()
      startDate = start ? new Date(start) : null
      expiryDate = expiry ? new Date(expiry) : null
      const image = formData.get('image')
      if (image instanceof File && image.size > 0) {
        try {
          const uploaded = await saveImageFile(image)
          if (uploaded) imageUrl = uploaded
        } catch (e) {
          console.error('admin/opportunities POST image upload:', e)
          return NextResponse.json(
            { error: (e as Error).message || 'Image upload failed. Try a smaller file or check Cloudinary.' },
            { status: 500 }
          )
        }
      }
    } else {
      const body = await req.json().catch(() => ({}))
      title = body.title ? String(body.title).trim() : null
      type = body.type ?? null
      description = str(body.description)
      location = str(body.location)
      duration = str(body.duration)
      roleOverview = str(body.roleOverview)
      requirements = str(body.requirements)
      whatYouGain = str(body.whatYouGain)
      startDate = body.startDate ? new Date(body.startDate) : null
      expiryDate = body.expiryDate ? new Date(body.expiryDate) : null
      imageUrl = body.imageUrl ? String(body.imageUrl).trim() || null : null
    }

    if (!title || !type) {
      return NextResponse.json({ error: 'title and type are required' }, { status: 400 })
    }
    const slug = slugFromTitle(title)
    const t = normalizeOpportunityType(type)
    if (t !== 'INTERNSHIP' && t !== 'VOLUNTEER') {
      return NextResponse.json({ error: 'type must be INTERNSHIP or VOLUNTEER' }, { status: 400 })
    }

    const o = await prisma.opportunity.create({
      data: {
        title,
        slug,
        type: t,
        description: description ?? null,
        location: location ?? null,
        duration: duration ?? null,
        roleOverview: roleOverview ?? null,
        requirements: requirements ?? null,
        whatYouGain: whatYouGain ?? null,
        imageUrl: imageUrl ?? null,
        startDate: startDate ?? null,
        expiryDate: expiryDate ?? null,
      },
    })
    revalidatePath('/opportunities')
    return NextResponse.json(o)
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }
    const message = e instanceof Error ? e.message : 'Create failed'
    console.error('admin/opportunities POST', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
