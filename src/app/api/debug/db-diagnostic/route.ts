import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/debug/db-diagnostic
 *
 * Confirms which database production uses and what data it contains.
 * In production: call with ?key=YOUR_NEXTAUTH_SECRET to enable.
 * In development: no key needed.
 *
 * Use this to verify:
 * - Which DATABASE_URL is in use (Neon vs local)
 * - Row counts for Gallery, News, Opportunities, Interns, etc.
 */
export async function GET(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production'
  if (isProduction) {
    const key = req.nextUrl.searchParams.get('key')
    if (key !== process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
    }
  }

  const url = process.env.DATABASE_URL || ''
  const isPostgres = url.startsWith('postgresql://') || url.startsWith('postgres://')
  const isNeon = isPostgres && url.includes('neon.tech')
  const urlHint = !url
    ? 'MISSING'
    : url.startsWith('file:')
      ? 'SQLite (local file)'
      : isNeon
        ? 'Neon PostgreSQL'
        : isPostgres
          ? 'PostgreSQL (other)'
          : 'OTHER'

  const redacted =
    url.length > 40
      ? `${url.slice(0, 20)}...${url.slice(-12)}`
      : url
        ? '[set]'
        : '[not set]'

  const counts: Record<string, number> = {
    Image: 0,
    Event: 0,
    Opportunity: 0,
    Participant: 0,
    Application: 0,
    Program: 0,
    Project: 0,
    AdminUser: 0,
  }

  let dbError: string | null = null

  try {
    counts.Image = await prisma.image.count()
    counts.Event = await prisma.event.count()
    counts.Opportunity = await prisma.opportunity.count()
    counts.Participant = await prisma.participant.count()
    counts.Application = await prisma.application.count()
    counts.Program = await prisma.program.count()
    counts.Project = await prisma.project.count()
    counts.AdminUser = await prisma.adminUser.count()
  } catch (e) {
    dbError = (e as Error).message
  }

  return NextResponse.json(
    {
      database: {
        urlHint,
        redacted,
        isPostgres,
        isNeon,
        note: !url
          ? 'DATABASE_URL is not set. Set it in Vercel → Project → Settings → Environment Variables for Production.'
          : url.startsWith('file:')
            ? 'You are using a local SQLite file. Production (Vercel) must use Neon PostgreSQL and set DATABASE_URL to the Neon connection string.'
            : null,
      },
      counts: {
        Image: counts.Image,
        Event: counts.Event,
        Opportunity: counts.Opportunity,
        Participant: counts.Participant,
        Application: counts.Application,
        Program: counts.Program,
        Project: counts.Project,
        AdminUser: counts.AdminUser,
      },
      legend: {
        Image: 'Gallery images',
        Event: 'News items',
        Opportunity: 'Opportunities (e.g. internship)',
        Participant: 'Interns & volunteers',
        Application: 'Applications',
        Program: 'Programs',
        Project: 'Projects',
        AdminUser: 'Admin users',
      },
      dbError: dbError || undefined,
      summary:
        dbError ?
          `Database error: ${dbError}`
        : urlHint === 'MISSING'
          ? 'DATABASE_URL is missing. Production cannot connect to any database.'
          : urlHint === 'SQLite (local file)'
            ? 'You are connected to a local SQLite database. The live site uses a different database (Neon). Data you add locally never appears on the live site unless you migrate it.'
            : `Connected to ${urlHint}. Counts above show what is stored in this database.`,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
