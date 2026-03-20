import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

function trim(s: unknown): string | null {
  if (s == null) return null
  const t = String(s).trim()
  return t === '' ? null : t
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  let name: string | null = null
  let email: string | null = null
  let phone: string | null = null
  let message: string | null = null
  let resumeUrl: string | null = null
  let country: string | null = null
  let qualification: string | null = null
  let publicHealthIssues: string | null = null
  let internshipInterest: string | null = null

  const contentType = req.headers.get('content-type') || ''
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    name = trim(formData.get('name'))
    email = trim(formData.get('email'))
    phone = trim(formData.get('phone'))
    message = trim(formData.get('message'))
    resumeUrl = trim(formData.get('resumeUrl'))
    country = trim(formData.get('country'))
    qualification = trim(formData.get('qualification'))
    publicHealthIssues = trim(formData.get('publicHealthIssues'))
    internshipInterest = trim(formData.get('internshipInterest'))

    const cv = formData.get('cv') || formData.get('resumeFile') || formData.get('resume')
    // Next.js provides uploaded files as Web File/Blob objects. Avoid relying on `instanceof File`
    // because runtime globals can differ across environments.
    if (cv && typeof (cv as any).arrayBuffer === 'function' && (typeof (cv as any).size === 'number' ? (cv as any).size > 0 : true)) {
      try {
        const dir = path.join(process.cwd(), 'public', 'uploads', 'applications')
        await mkdir(dir, { recursive: true })
        const originalName = typeof (cv as any).name === 'string' ? (cv as any).name : 'resume.pdf'
        const ext = path.extname(originalName) || '.pdf'
        const base = `${id}-${Date.now()}${ext}`
        const filePath = path.join(dir, base)
        const buffer = Buffer.from(await (cv as any).arrayBuffer())
        await writeFile(filePath, buffer)
        resumeUrl = `/uploads/applications/${base}`
      } catch (e) {
        console.error('Apply: CV file save failed (expected on Vercel). Application will be saved without file.', e)
        resumeUrl = null
      }
    }
  } else {
    const body = await req.json().catch(() => ({}))
    name = trim(body.name)
    email = trim(body.email)
    phone = trim(body.phone)
    message = trim(body.message)
    resumeUrl = trim(body.resumeUrl)
    country = trim(body.country)
    qualification = trim(body.qualification)
    publicHealthIssues = trim(body.publicHealthIssues)
    internshipInterest = trim(body.internshipInterest)
  }

  if (!name || !email) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
  }

  const opp = await prisma.opportunity.findUnique({ where: { id } })
  if (!opp || !opp.isActive) {
    return NextResponse.json({ error: 'Opportunity not found or not accepting applications' }, { status: 404 })
  }
  if (opp.applicationDeadline && opp.applicationDeadline < new Date()) {
    return NextResponse.json({ error: 'Application deadline has passed' }, { status: 400 })
  }

  try {
    const app = await prisma.application.create({
      data: {
        opportunityId: id,
        name,
        email,
        phone,
        message,
        resumeUrl,
        country,
        qualification,
        publicHealthIssues,
        internshipInterest,
      },
    })
    revalidatePath('/opportunities')
    return NextResponse.json({ ok: true, id: app.id })
  } catch (e) {
    console.error('opportunities apply POST', e)
    const prismaErr = e && typeof e === 'object' && 'code' in e ? (e as { code: string }).code : ''
    if (prismaErr === 'P2003') {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Application failed. Please try again.' }, { status: 500 })
  }
}
