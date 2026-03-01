import { NextRequest, NextResponse } from 'next/server'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { getMailer, getDefaultFrom } from '@/lib/mailer'

const ALLOWED_STATUSES = ['pending', 'reviewed', 'accepted', 'rejected']

function normalizeStatus(s: string): string {
  const v = String(s).toLowerCase().trim()
  return ALLOWED_STATUSES.includes(v) ? v : 'pending'
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Clean HTML wrapper for email body content. */
function emailLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 1.5rem; color: #1e40af;">${escapeHtml(title)}</h1>
  </div>
  <div>${bodyHtml}</div>
  <p style="margin-top: 32px; color: #64748b; font-size: 0.9rem;">Best regards,<br>PHA Team</p>
</body>
</html>`
}

/** Build subject and HTML for accepted application email. */
function buildAcceptedEmail(name: string, opportunityTitle: string): { subject: string; html: string } {
  const subject = `Application Update – ${opportunityTitle}`
  const body = `<p>Dear ${escapeHtml(name)},</p>
<p>We are pleased to inform you that your application for <strong>${escapeHtml(opportunityTitle)}</strong> has been accepted.</p>
<p>We will contact you shortly with the next steps.</p>`
  return { subject, html: emailLayout('Congratulations!', body) }
}

/** Build subject and HTML for rejected application email. */
function buildRejectedEmail(name: string, opportunityTitle: string): { subject: string; html: string } {
  const subject = `Update on your application – ${opportunityTitle}`
  const body = `<p>Dear ${escapeHtml(name)},</p>
<p>Thank you for your interest in <strong>${escapeHtml(opportunityTitle)}</strong>.</p>
<p>While we were impressed with your background, we have decided to move forward with other candidates at this time. We encourage you to apply again in the future.</p>`
  return { subject, html: emailLayout('Application Update', body) }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const unauth = await requireSection('applications')
    if (unauth) return unauth

    const { id } = await params
    const app = await prisma.application.findUnique({
      where: { id },
      include: { opportunity: { select: { id: true, title: true, slug: true, type: true } } },
    })
    if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(app)
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauth = await requireSection('applications')
    if (unauth) return unauth

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const data: { status?: string; adminNotes?: string | null } = {}
    if (body.status != null) data.status = normalizeStatus(body.status)
    if (body.adminNotes !== undefined) data.adminNotes = body.adminNotes == null || body.adminNotes === '' ? null : String(body.adminNotes).trim()

    const existing = await prisma.application.findUnique({
      where: { id },
      include: { opportunity: { select: { title: true } } },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const previousStatus = (existing.status || '').toLowerCase()
    const newStatus = data.status ?? previousStatus

    const app = await prisma.application.update({
      where: { id },
      data,
      include: { opportunity: { select: { title: true, slug: true, type: true } } },
    })

    try {
      if (newStatus === 'accepted' || newStatus === 'rejected') {
        const to = app.email?.trim()
        if (!to) {
          console.warn('[Application status email] No applicant email, skipping send')
        } else {
          const { subject, html } =
            newStatus === 'accepted'
              ? buildAcceptedEmail(app.name, app.opportunity.title)
              : buildRejectedEmail(app.name, app.opportunity.title)
          const transporter = getMailer()
          if (transporter) {
            await transporter.sendMail({
              from: getDefaultFrom(),
              to,
              subject,
              html,
            })
          } else {
            console.warn('[Application status email] SMTP not configured (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS). Email not sent.')
          }
        }
      }
    } catch (emailErr) {
      console.error('[Application status email] send failed:', emailErr)
      // Do not rethrow: DB update succeeded; admin still gets success response.
    }

    return NextResponse.json(app)
  } catch (e: unknown) {
    const isNotFound = e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2025'
    const message = e instanceof Error ? e.message : 'Update failed'
    console.error('Error updating application:', e)
    if (isNotFound) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
