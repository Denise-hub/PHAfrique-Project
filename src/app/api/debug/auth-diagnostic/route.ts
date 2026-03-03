import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const SUPER_ADMIN_EMAIL = 'denmaombi@gmail.com'

/**
 * GET /api/debug/auth-diagnostic
 * Returns auth-related state to identify login blockers.
 * In production: call with ?key=YOUR_NEXTAUTH_SECRET to enable (so only you can see it).
 * In development: no key needed.
 */
export async function GET(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production'
  if (isProduction) {
    const key = req.nextUrl.searchParams.get('key')
    if (key !== process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
    }
  }

  const out: {
    superAdminRow: {
      exists: boolean
      role?: string
      hasPasswordHash: boolean
      error?: string
    }
    env: {
      ADMIN_PASSWORD: { defined: boolean; length: number }
      ADMIN_PASSWORD_HASH: { defined: boolean; length: number; prefix: string }
      NEXTAUTH_SECRET: { defined: boolean }
      NEXTAUTH_URL: string | null
      VERCEL_URL: string | null
      googleOAuth: { configured: boolean }
    }
    prisma: {
      adminUserModelAvailable: boolean
      tableError?: string
    }
    summary: string[]
  } = {
    superAdminRow: { exists: false, hasPasswordHash: false },
    env: {
      ADMIN_PASSWORD: { defined: false, length: 0 },
      ADMIN_PASSWORD_HASH: { defined: false, length: 0, prefix: '' },
      NEXTAUTH_SECRET: { defined: false },
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
      VERCEL_URL: process.env.VERCEL_URL || null,
      googleOAuth: {
        configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      },
    },
    prisma: { adminUserModelAvailable: false },
    summary: [],
  }

  const model = (prisma as unknown as { adminUser?: { findUnique: (args: { where: { email: string } }) => Promise<unknown> } }).adminUser
  out.prisma.adminUserModelAvailable = typeof model === 'object' && model !== null && typeof (model as { findUnique?: unknown }).findUnique === 'function'

  if (!out.prisma.adminUserModelAvailable) {
    out.summary.push('Prisma adminUser model is not available. Run: npx prisma generate')
  } else {
    try {
      const admin = await prisma.adminUser.findUnique({
        where: { email: SUPER_ADMIN_EMAIL },
        select: { id: true, email: true, role: true, passwordHash: true },
      }) as { id: string; email: string; role: string; passwordHash: string | null } | null
      if (admin) {
        out.superAdminRow = {
          exists: true,
          role: admin.role,
          hasPasswordHash: !!admin.passwordHash && admin.passwordHash.length > 0,
        }
        out.summary.push(`SUPER_ADMIN row exists (role=${admin.role}, hasPasswordHash=${out.superAdminRow.hasPasswordHash})`)
      } else {
        out.superAdminRow = { exists: false, hasPasswordHash: false }
        out.summary.push('SUPER_ADMIN row does NOT exist in AdminUser table.')
      }
    } catch (e) {
      out.prisma.tableError = (e as Error).message
      out.superAdminRow = { ...out.superAdminRow, error: (e as Error).message }
      out.summary.push(`DB error: ${(e as Error).message}`)
    }
  }

  const envPasswordRaw = process.env.ADMIN_PASSWORD
  const envPassword = (envPasswordRaw || '').replace(/^\uFEFF/, '').replace(/^["']|["']$/g, '').trim()
  out.env.ADMIN_PASSWORD = { defined: !!envPasswordRaw, length: envPassword.length }

  const envHashRaw = process.env.ADMIN_PASSWORD_HASH
  const envHash = (envHashRaw || '').replace(/^\uFEFF/, '').replace(/^["']|["']$/g, '').trim()
  out.env.ADMIN_PASSWORD_HASH = { defined: !!envHashRaw, length: envHash.length, prefix: envHash.slice(0, 12) + (envHash.length > 12 ? '...' : '') }

  out.env.NEXTAUTH_SECRET = { defined: !!(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length > 0) }

  if (out.env.ADMIN_PASSWORD.defined && out.env.ADMIN_PASSWORD.length < 8) {
    out.summary.push('ADMIN_PASSWORD is set but length < 8; env password string match will be skipped.')
  }
  if (!out.env.NEXTAUTH_SECRET.defined) {
    out.summary.push('NEXTAUTH_SECRET is not set; sessions may fail.')
  }
  if (!out.env.googleOAuth.configured) {
    out.summary.push('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set; Google Sign-In will be disabled.')
  }

  return NextResponse.json(out, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
