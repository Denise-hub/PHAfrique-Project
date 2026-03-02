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

/** Prisma client can miss participant model if dev server was started without running generate. */
function ensureParticipantModel() {
  if (typeof (prisma as { participant?: unknown }).participant === 'undefined') {
    return 'Database client is out of sync. Restart the dev server with: npm run dev (it runs Prisma generate automatically). If the problem persists, stop all Node processes, run npm run db:push, then npm run dev again.'
  }
  return null
}

function normalizeType(t: string): string {
  const v = String(t).toUpperCase()
  return v === TYPE_VOLUNTEER ? TYPE_VOLUNTEER : TYPE_INTERN
}

export async function GET() {
  const unauth = await requireSection('opportunities')
  if (unauth) return unauth
  const syncErr = ensureParticipantModel()
  if (syncErr) return NextResponse.json({ error: syncErr }, { status: 503 })
  try {
    const list = await prisma.participant.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        opportunity: { select: { id: true, title: true, type: true } },
      },
    })
    return NextResponse.json(list)
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const unauth = await requireSection('opportunities')
  if (unauth) return unauth
  const session = await getServerSession(authOptions)
  const role = effectiveRole((session?.user as { role?: string } | undefined)?.role)
  if (role !== ROLES.SUPER_ADMIN && role !== ROLES.CO_FOUNDER) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const syncErr = ensureParticipantModel()
  if (syncErr) return NextResponse.json({ error: syncErr }, { status: 503 })
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Use multipart/form-data for image upload' }, { status: 400 })
  }
  try {
    const form = await req.formData()
    const name = (form.get('name') ?? '').toString().trim()
    const type = normalizeType((form.get('type') ?? TYPE_INTERN).toString())
    const roleStr = (form.get('role') ?? '').toString().trim()
    if (!name || !roleStr) {
      return NextResponse.json({ error: 'Name and role are required' }, { status: 400 })
    }
    if (type !== TYPE_INTERN && type !== TYPE_VOLUNTEER) {
      return NextResponse.json({ error: 'Type must be INTERN or VOLUNTEER' }, { status: 400 })
    }
    const email = (form.get('email') ?? '').toString().trim() || null
    const bio = (form.get('bio') ?? '').toString().trim() || null
    const linkedInUrl = (form.get('linkedInUrl') ?? '').toString().trim() || null
    const opportunityId = (form.get('opportunityId') ?? '').toString().trim() || null
    const applicationId = (form.get('applicationId') ?? '').toString().trim() || null
    const isActive = form.get('isActive') !== 'false' && form.get('isActive') !== '0'
    const sortOrder = parseInt((form.get('sortOrder') ?? '0').toString(), 10) || 0
    const startDateStr = (form.get('startDate') ?? '').toString().trim()
    const endDateStr = (form.get('endDate') ?? '').toString().trim()
    const startDate = startDateStr ? new Date(startDateStr) : null
    const endDate = endDateStr ? new Date(endDateStr) : null

    const imageFile = form.get('image') as File | null
    let imageUrl: string | null = null
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await saveImageFile(imageFile)
      } catch (uploadErr) {
        console.error('Error saving participant image:', uploadErr)
        const msg = uploadErr instanceof Error ? uploadErr.message : 'Image upload failed'
        return NextResponse.json({ error: `Profile image could not be saved: ${msg}` }, { status: 500 })
      }
    }

    const participant = await prisma.participant.create({
      data: {
        type,
        name,
        email,
        role: roleStr,
        imageUrl,
        bio,
        linkedInUrl,
        opportunityId: opportunityId || undefined,
        applicationId: applicationId || undefined,
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
    console.error('Error creating participant:', error)
    let message = 'Failed to create participant'
    if (error && typeof error === 'object') {
      const prismaError = error as { code?: string; meta?: { target?: string[] }; message?: string }
      if (prismaError.code === 'P2002') {
        message = 'A participant is already linked to this application. Edit the existing one or unlink it first.'
      } else if (prismaError.code === 'P2003') {
        message = 'Invalid linked opportunity or application. Please choose a valid option or leave unlinked.'
      } else if (prismaError.code === 'P2025' || prismaError.code === 'P2018') {
        message = 'Referenced record not found. Please refresh and try again.'
      } else if (prismaError.message && /table|does not exist|Participant/i.test(String(prismaError.message))) {
        message = 'Participants table is missing. Run: npm run db:push (then restart the dev server if needed) and try again.'
      } else if (process.env.NODE_ENV === 'development' && prismaError.message) {
        message = prismaError.message
      }
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
