import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { compare, hash } from 'bcryptjs'
import { prisma } from '@/lib/db'

// Email address used for the initial super‑admin account. This address is
// treated specially when seeding and when validating credentials so that
// there is always at least one account able to reach the admin panel.
const SUPER_ADMIN_EMAIL = 'denmaombi@gmail.com'

function canonicalAdminEmail(input: string) {
  const email = input.toLowerCase().trim()
  const aliases: Record<string, string> = {
    'munashe@phafrique.com': 'munashe.faranisi@phafrique.org',
    'munashe@phafrique.org': 'munashe.faranisi@phafrique.org',
    'munashe.faranisi@phafrique.com': 'munashe.faranisi@phafrique.org',
    'tshowa@phafrique.com': 'kabala@phafrique.org',
    'jemima@phafrique.com': 'jemima.lotika@phafrique.org',
    'eunice@phafrique.com': 'eunice.tshilengu@phafrique.org',
  }
  return aliases[email] || email
}

function adminEmailCandidates(input: string) {
  const raw = input.toLowerCase().trim()
  const canonical = canonicalAdminEmail(raw)
  const local = raw.split('@')[0] || ''
  const candidates = new Set<string>([
    raw,
    canonical,
    `${local}@phafrique.com`,
    `${local}@phafrique.org`,
  ])
  if (local === 'munashe' || local === 'munashe.faranisi') {
    candidates.add('munashe@phafrique.com')
    candidates.add('munashe@phafrique.org')
    candidates.add('munashe.faranisi@phafrique.com')
    candidates.add('munashe.faranisi@phafrique.org')
  }
  return Array.from(candidates).filter(Boolean)
}

// Defensive helper around the Prisma client. In some environments Prisma
// may not yet be generated; returning null here lets the calling code fail
// gracefully instead of throwing at import time.
function getAdminUserModel() {
  try {
    const model = (prisma as unknown as {
      adminUser?: {
        findUnique: (args: { where: { email: string } }) => Promise<unknown>
        findFirst: (args: { where: { email: { equals: string; mode: 'insensitive' } } }) => Promise<unknown>
      }
    }).adminUser
    return model ?? null
  } catch {
    return null
  }
}

async function findAdminByEmail(
  adminUser: NonNullable<ReturnType<typeof getAdminUserModel>>,
  email: string,
  rawEmail?: string
) {
  try {
    const found = await adminUser.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
    if (found) return found
  } catch {
    // Fallback below for providers that do not support mode: 'insensitive'.
  }
  if (rawEmail && rawEmail !== email) {
    const exactRaw = await adminUser.findUnique({ where: { email: rawEmail } })
    if (exactRaw) return exactRaw
  }
  return await adminUser.findUnique({ where: { email } })
}

async function findAdminByAnyEmail(
  adminUser: NonNullable<ReturnType<typeof getAdminUserModel>>,
  inputEmail: string
) {
  const candidates = adminEmailCandidates(inputEmail)
  for (const candidate of candidates) {
    const found = await findAdminByEmail(adminUser, candidate, inputEmail)
    if (found) return found
  }
  return null
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const rawPassword = (credentials?.password ?? '').toString().replace(/\r\n?|\n/g, '').trim()
        if (!credentials?.email || !rawPassword) {
          console.log('[auth] authorize RETURNING null: reason=missing email or password')
          return null
        }

        const rawEmail = (credentials.email ?? '').toString().trim()
        const email = canonicalAdminEmail(rawEmail)
        const adminUser = getAdminUserModel()
        if (!adminUser) {
          console.error('[auth] authorize RETURNING null: reason=Prisma adminUser model not available. Run: npx prisma generate')
          return null
        }

        const envPasswordRaw = process.env.ADMIN_PASSWORD
        const envPassword = (envPasswordRaw || '').replace(/^\uFEFF/, '').replace(/^["']|["']$/g, '').replace(/\r\n?|\n/g, ' ').replace(/\s+/g, ' ').trim()
        const envHashRaw = process.env.ADMIN_PASSWORD_HASH
        const envHash = (envHashRaw || '').replace(/^\uFEFF/, '').replace(/^["']|["']$/g, '').trim()
        const isSuperAdminEmail = adminEmailCandidates(rawEmail).includes(SUPER_ADMIN_EMAIL)

        console.log('[auth] --- credentials login ---')
        console.log('[auth] email:', email, '| isSuperAdminEmail:', isSuperAdminEmail)
        console.log('[auth] process.env.ADMIN_PASSWORD: defined =', !!envPasswordRaw, '| length after trim:', envPassword.length)

        let admin: { id: string; email: string; role: string; passwordHash: string | null; displayName?: string | null; imageUrl?: string | null } | null
        try {
          admin = await findAdminByAnyEmail(adminUser, rawEmail) as typeof admin
        } catch (e) {
          console.error('[auth] authorize RETURNING null: reason=DB error during findUnique:', (e as Error).message)
          return null
        }

        console.log('[auth] DB user found:', !!admin, '| has passwordHash:', !!admin?.passwordHash)

        // Recovery/bootstrap with ADMIN_PASSWORD:
        // - If the email exists in AdminUser and ADMIN_PASSWORD matches, allow sign-in.
        // - This keeps production recoverable when team passwords drift or were never set.
        // - We immediately persist a fresh bcrypt hash in DB for that admin account.
        const pwNorm = rawPassword.replace(/\r\n?|\n/g, ' ').replace(/\s+/g, ' ').trim()
        const envNorm = envPassword.replace(/\s+/g, ' ').trim()
        const envPasswordMatch = envNorm.length >= 8 && (rawPassword === envPassword || pwNorm === envNorm || rawPassword === envNorm || pwNorm === envPassword)
        const canBootstrapWithEnvPassword = !!admin && envPasswordMatch
        if (canBootstrapWithEnvPassword && admin) {
          console.log(
            '[auth] Result: SUCCESS (ADMIN_PASSWORD bootstrap match)',
            '| mode:',
            isSuperAdminEmail ? 'super-admin-recovery' : 'admin-recovery',
          )
          const newHash = await hash(pwNorm.length ? pwNorm : rawPassword, 10)
          prisma.adminUser.update({ where: { email: admin.email }, data: { passwordHash: newHash } }).catch((e) => console.error('[auth] Failed to save password to DB:', e))
          const userObj = { id: admin.id, email: admin.email, name: (admin as { displayName?: string | null }).displayName || 'Admin', image: (admin as { imageUrl?: string | null }).imageUrl ?? undefined, role: admin.role }
          return userObj
        }

        if (!admin) {
          console.error('[auth] authorize RETURNING null: reason=No admin user for email:', email)
          return null
        }

        // For SUPER_ADMIN: if there is no password set in the DB yet, initialize it from ADMIN_PASSWORD
        if (isSuperAdminEmail && envPassword.length >= 8 && !admin.passwordHash) {
          const envHashForDb = await hash(envPassword, 10)
          await prisma.adminUser.update({ where: { email: admin.email }, data: { passwordHash: envHashForDb } }).catch(() => {})
          admin = { ...admin, passwordHash: envHashForDb }
          console.log('[auth] SUPER_ADMIN: initialised DB password from ADMIN_PASSWORD')
        }

        // Check DB password if set
        if (admin.passwordHash) {
          const isValid = await compare(rawPassword, admin.passwordHash)
          if (isValid) {
            console.log('[auth] Result: SUCCESS (DB hash)')
            const userObj = { id: admin.id, email: admin.email, name: (admin as { displayName?: string | null }).displayName || 'Admin', image: (admin as { imageUrl?: string | null }).imageUrl ?? undefined, role: admin.role }
            return userObj
          }
        }

        // Fallback recovery with ADMIN_PASSWORD_HASH from .env (bcrypt compare)
        // Applies to any existing admin account so non-super-admin users can recover too.
        if (admin && envHash.length > 0) {
          try {
            const matchesEnvHash = await compare(rawPassword, envHash)
            if (matchesEnvHash) {
              console.log('[auth] Result: SUCCESS (env hash match)', '| mode:', isSuperAdminEmail ? 'super-admin-recovery' : 'admin-recovery')
              prisma.adminUser.update({ where: { email: admin.email }, data: { passwordHash: envHash } }).catch(() => {})
              return {
                id: admin.id,
                email: admin.email,
                name: (admin as { displayName?: string | null }).displayName || 'Admin',
                image: (admin as { imageUrl?: string | null }).imageUrl ?? undefined,
                role: admin.role,
              }
            }
          } catch (_e) {
            // ignore
          }
        }

        console.error('[auth] authorize RETURNING null: no strategy succeeded')
        return null
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log('[auth] signIn callback | provider:', account?.provider, '| user:', user ? { id: user.id, email: user.email } : null)
        if (account?.provider === 'google') {
          const email = canonicalAdminEmail((user.email || (profile as { email?: string })?.email || '').toLowerCase().trim())
        if (!email) {
          console.error('[auth] Google sign-in: no email in profile')
          return false
        }
        const adminUser = getAdminUserModel()
        if (!adminUser) {
          console.error('[auth] Google sign-in: Prisma adminUser not available. Run: npx prisma generate')
          return false
        }
        try {
          let admin = await findAdminByAnyEmail(adminUser, email)
          if (!admin && email === SUPER_ADMIN_EMAIL) {
            console.log('[auth] Google sign-in: SUPER_ADMIN not in DB, creating now')
            admin = await prisma.adminUser.upsert({
              where: { email },
              create: { email, role: 'SUPER_ADMIN', passwordHash: null },
              update: { role: 'SUPER_ADMIN' },
            }) as typeof admin
          }
          if (!admin) {
            console.error(`[auth] Google sign-in: ${email} is not in the admin list. Run: npm run db:seed to add more admins.`)
            return false
          }
          return true
        } catch (e) {
          console.error('[auth] Google sign-in DB error:', e)
          return false
        }
      }
      console.log('[auth] signIn callback returning: true')
        return true
      } catch (e) {
        console.error('[auth] signIn callback THREW:', (e as Error).message, (e as Error).stack)
        throw e
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/admin')) return `${baseUrl}${url}`
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/admin`
    },
    async jwt({ token, user }) {
      try {
        console.log('[auth] jwt callback | user present:', !!user, user ? `email=${user.email} id=${user.id}` : '', '| token keys:', Object.keys(token || {}))
        if (user) {
          token.id = user.id
          token.email = user.email
          token.name = user.name
          token.picture = user.image ?? (user as { image?: string }).image
          token.role = (user as { role?: string }).role
          console.log('[auth] jwt callback after user merge | token.id:', token.id, 'token.email:', token.email, 'token.role:', token.role)
        }
        if (token.email) {
          const adminUser = getAdminUserModel()
          if (adminUser) {
            try {
              const admin = await findAdminByAnyEmail(
                adminUser,
                (token.email as string).toLowerCase().trim()
              ) as { role?: string; displayName?: string; imageUrl?: string } | null
              if (admin) {
                token.role = (admin as { role: string }).role
                if (admin.displayName) token.name = admin.displayName
                if (admin.imageUrl) token.picture = admin.imageUrl
              }
            } catch (e) {
              console.error('[auth] jwt callback DB lookup error:', (e as Error).message)
            }
          }
        }
        console.log('[auth] jwt callback returning token with keys:', Object.keys(token || {}))
        return token
      } catch (e) {
        console.error('[auth] jwt callback THREW:', (e as Error).message, (e as Error).stack)
        throw e
      }
    },
    async session({ session, token }) {
      try {
        console.log('[auth] session callback | token.id:', token?.id, 'token.email:', token?.email, 'session.user keys:', session?.user ? Object.keys(session.user) : [])
        if (session.user) {
          session.user.id = token.id as string
          session.user.email = token.email as string
          session.user.name = token.name as string
          session.user.image = token.picture as string | null
          session.user.role = token.role as string
        }
        console.log('[auth] session callback returning session.user:', session?.user ? { id: session.user.id, email: session.user.email, role: (session.user as { role?: string }).role } : null)
        return session
      } catch (e) {
        console.error('[auth] session callback THREW:', (e as Error).message, (e as Error).stack)
        throw e
      }
    },
  },
}
