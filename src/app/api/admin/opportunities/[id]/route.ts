import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'
import { authOptions } from '@/lib/auth'
import { effectiveRole, ROLES } from '@/lib/roles'

function normalizeOpportunityType(t: string): string {
  const v = String(t).toLowerCase()
  if (v === 'internship') return 'INTERNSHIP'
  if (v === 'volunteering' || v === 'volunteer') return 'VOLUNTEER'
  return v
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauth = await requireSection('opportunities')
    if (unauth) return unauth

    const session = await getServerSession(authOptions)
    const role = effectiveRole((session?.user as { role?: string } | undefined)?.role)
    if (role !== ROLES.SUPER_ADMIN && role !== ROLES.CO_FOUNDER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const contentType = req.headers.get('content-type') || ''
    let body: any = {}
    let imageUrlFromFile: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const str = (v: FormDataEntryValue | null) => (v != null ? String(v).trim() || null : null)
      body = {
        title: formData.get('title'),
        type: formData.get('type'),
        description: formData.get('description'),
        location: str(formData.get('location')),
        duration: str(formData.get('duration')),
        roleOverview: str(formData.get('roleOverview')),
        requirements: str(formData.get('requirements')),
        whatYouGain: str(formData.get('whatYouGain')),
        startDate: formData.get('startDate'),
        expiryDate: formData.get('expiryDate'),
      }
      const image = formData.get('image')
      imageUrlFromFile = await saveImageFile(image instanceof File ? image : null)
    } else {
      body = await req.json().catch(() => ({}))
    }
    const data: {
      title?: string
      type?: string
      description?: string | null
      location?: string | null
      duration?: string | null
      roleOverview?: string | null
      requirements?: string | null
      whatYouGain?: string | null
      imageUrl?: string | null
      startDate?: Date | null
      expiryDate?: Date | null
    } = {}
    if (body.title != null) data.title = body.title
    if (body.type != null) {
      const t = normalizeOpportunityType(body.type)
      if (t !== 'INTERNSHIP' && t !== 'VOLUNTEER') {
        return NextResponse.json({ error: 'type must be INTERNSHIP or VOLUNTEER' }, { status: 400 })
      }
      data.type = t
    }
    if (body.description !== undefined) data.description = body.description != null ? String(body.description).trim() || null : null
    if (body.location !== undefined) data.location = body.location != null ? String(body.location).trim() || null : null
    if (body.duration !== undefined) data.duration = body.duration != null ? String(body.duration).trim() || null : null
    if (body.roleOverview !== undefined) data.roleOverview = body.roleOverview != null ? String(body.roleOverview).trim() || null : null
    if (body.requirements !== undefined) data.requirements = body.requirements != null ? String(body.requirements).trim() || null : null
    if (body.whatYouGain !== undefined) data.whatYouGain = body.whatYouGain != null ? String(body.whatYouGain).trim() || null : null
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null
    if (body.expiryDate !== undefined) data.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null
    if (imageUrlFromFile !== null) data.imageUrl = imageUrlFromFile

    const o = await prisma.opportunity.update({ where: { id }, data })
    revalidatePath('/opportunities')
    return NextResponse.json(o)
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }
    const message = e instanceof Error ? e.message : 'Update failed'
    console.error('Error updating opportunity:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauth = await requireSection('opportunities')
    if (unauth) return unauth

    const session = await getServerSession(authOptions)
    const role = effectiveRole((session?.user as { role?: string } | undefined)?.role)
    if (role !== ROLES.SUPER_ADMIN && role !== ROLES.CO_FOUNDER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    await prisma.opportunity.delete({ where: { id } })
    revalidatePath('/opportunities')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting opportunity:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
