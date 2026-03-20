import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { requireSection } from '@/lib/admin'
import { authOptions } from '@/lib/auth'
import { effectiveRole, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/db'
import { saveImageFile } from '@/lib/upload'

export const dynamic = 'force-dynamic'

const TYPE_INTERN = 'INTERN'
const TYPE_VOLUNTEER = 'VOLUNTEER'

function normalizeType(t: string): string {
  const v = String(t).toUpperCase()
  return v === TYPE_VOLUNTEER ? TYPE_VOLUNTEER : TYPE_INTERN
}

/** Prisma client can miss participant model if dev server was started without running generate. */
function ensureParticipantModel() {
  if (typeof (prisma as { participant?: unknown }).participant === 'undefined') {
    return 'Database client is out of sync. Restart the dev server with: npm run dev (it runs Prisma generate automatically). If the problem persists, stop all Node processes, run npm run db:push, then npm run dev again.'
  }
  return null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireSection('opportunities')
  if (unauth) return unauth
  const syncErr = ensureParticipantModel()
  if (syncErr) return NextResponse.json({ error: syncErr }, { status: 503 })
  try {
    const { id } = await params
    const p = await prisma.participant.findUnique({
      where: { id },
      include: {
        opportunity: { select: { id: true, title: true, type: true } },
      },
    })
    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(p)
  } catch (error) {
    console.error('Error fetching participant:', error)
    return NextResponse.json({ error: 'Failed to fetch participant' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireSection('opportunities')
  if (unauth) return unauth
  const session = await getServerSession(authOptions)
  const role = effectiveRole((session?.user as { role?: string } | undefined)?.role)
  if (role !== ROLES.SUPER_ADMIN && role !== ROLES.CO_FOUNDER && role !== ROLES.ADMIN && role !== ROLES.SOCIAL_MEDIA_MANAGER) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const syncErr = ensureParticipantModel()
  if (syncErr) return NextResponse.json({ error: syncErr }, { status: 503 })
  try {
    const { id } = await params
    const existing = await prisma.participant.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Use multipart/form-data for image upload' }, { status: 400 })
    }
    const form = await req.formData()
    const name = (form.get('name') ?? '').toString().trim()
    const type = normalizeType((form.get('type') ?? existing.type).toString())
    const roleStr = (form.get('role') ?? '').toString().trim()
    if (!name || !roleStr) {
      return NextResponse.json({ error: 'Name and role are required' }, { status: 400 })
    }
    const email = (form.get('email') ?? '').toString().trim() || null
    const bio = (form.get('bio') ?? '').toString().trim() || null
    const linkedInUrl = (form.get('linkedInUrl') ?? '').toString().trim() || null
    const opportunityId = (form.get('opportunityId') ?? '').toString().trim() || null
    const isActive = form.get('isActive') !== 'false' && form.get('isActive') !== '0'
    const sortOrder = parseInt((form.get('sortOrder') ?? String(existing.sortOrder)).toString(), 10) || 0
    const startDateStr = (form.get('startDate') ?? '').toString().trim()
    const endDateStr = (form.get('endDate') ?? '').toString().trim()
    const startDate = startDateStr ? new Date(startDateStr) : null
    const endDate = endDateStr ? new Date(endDateStr) : null

    let imageUrl: string | null = existing.imageUrl
    const imageFile = form.get('image') as File | null
    if (imageFile && imageFile.size > 0) {
      try {
        const saved = await saveImageFile(imageFile)
        if (saved) imageUrl = saved
      } catch (e) {
        console.error('participants PATCH image upload:', e)
        return NextResponse.json(
          { error: (e as Error).message || 'Image upload failed. Try a smaller file or check Cloudinary.' },
          { status: 500 }
        )
      }
    }

    const participant = await prisma.participant.update({
      where: { id },
      data: {
        type,
        name,
        email,
        role: roleStr,
        imageUrl,
        bio,
        linkedInUrl,
        opportunityId: opportunityId || undefined,
        isActive,
        sortOrder,
        startDate,
        endDate,
      },
      include: {
        opportunity: { select: { id: true, title: true, type: true } },
      },
    })
    return NextResponse.json(participant)
  } catch (error) {
    console.error('Error updating participant:', error)
    return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireSection('opportunities')
  if (unauth) return unauth
  const session = await getServerSession(authOptions)
  const role = effectiveRole((session?.user as { role?: string } | undefined)?.role)
  if (role !== ROLES.SUPER_ADMIN && role !== ROLES.CO_FOUNDER && role !== ROLES.ADMIN && role !== ROLES.SOCIAL_MEDIA_MANAGER) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const syncErr = ensureParticipantModel()
  if (syncErr) return NextResponse.json({ error: syncErr }, { status: 503 })
  try {
    const { id } = await params
    await prisma.participant.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting participant:', error)
    return NextResponse.json({ error: 'Failed to delete participant' }, { status: 500 })
  }
}
