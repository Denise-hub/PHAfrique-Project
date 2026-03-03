import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { compare, hash } from 'bcryptjs'
import { prisma } from '@/lib/db'

// On Vercel, use the deployment URL so login works on both production and preview URLs
if (typeof process !== 'undefined' && process.env.VERCEL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
}

const SUPER_ADMIN_EMAIL = 'denmaombi@gmail.com'

function getAdminUserModel() {
  try {
    const model = (prisma as unknown as { adminUser?: { findUnique: (args: { where: { email: string } }) => Promise<unknown> } }).adminUser
    return model ?? null
  } catch {
    return null
  }
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

        const email = (credentials.email ?? '').toString().toLowerCase().trim()
        const adminUser = getAdminUserModel()
        if (!adminUser) {
          console.error('[auth] authorize RETURNING null: reason=Prisma adminUser model not available. Run: npx prisma generate')
          return null
        }

        const envPasswordRaw = process.env.ADMIN_PASSWORD
        const envPassword = (envPasswordRaw || '').replace(/^\uFEFF/, '').replace(/^["']|["']$/g, '').replace(/\r\n?|\n/g, '').trim()
        const envHashRaw = process.env.ADMIN_PASSWORD_HASH
        const envHash = (envHashRaw || '').replace(/^\uFEFF/, '').replace(/^["']|["']$/g, '').trim()
        const isSuperAdminEmail = email === SUPER_ADMIN_EMAIL

        console.log('[auth] --- credentials login ---')
        console.log('[auth] email:', email, '| isSuperAdminEmail:', isSuperAdminEmail)
        console.log('[auth] input password length:', rawPassword.length, '| first char code:', rawPassword.length ? rawPassword.charCodeAt(0) : '-', '| last char code:', rawPassword.length ? rawPassword.charCodeAt(rawPassword.length - 1) : '-')
        console.log('[auth] process.env.ADMIN_PASSWORD: defined =', !!envPasswordRaw, '| length after trim:', envPassword.length, '| first char code:', envPassword.length ? envPassword.charCodeAt(0) : '-', '| last char code:', envPassword.length ? envPassword.charCodeAt(envPassword.length - 1) : '-')
        console.log('[auth] process.env.ADMIN_PASSWORD_HASH: defined =', !!envHashRaw, '| length after trim:', envHash.length, '| prefix:', envHash.slice(0, 7))

        let admin: { id: string; email: string; role: string; passwordHash: string | null; displayName?: string | null; imageUrl?: string | null } | null
        try {
          admin = await adminUser.findUnique({ where: { email } }) as typeof admin
        } catch (e) {
          console.error('[auth] authorize RETURNING null: reason=DB error during findUnique:', (e as Error).message)
          return null
        }

        console.log('[auth] DB user found:', !!admin, '| has passwordHash:', !!admin?.passwordHash)

        // Ensure SUPER_ADMIN row exists so we never block on "run db:seed"
        if (isSuperAdminEmail && !admin) {
          console.log('[auth] SUPER_ADMIN row missing; creating now')
          try {
            const initialHash = envPassword.length >= 8
              ? await hash(envPassword, 10)
              : (envHash.length > 0 ? envHash : null)
            admin = (await prisma.adminUser.upsert({
              where: { email },
              create: { email, role: 'SUPER_ADMIN', passwordHash: initialHash },
              update: {},
            })) as NonNullable<typeof admin>
            console.log('[auth] SUPER_ADMIN row created, continuing with password check')
          } catch (e) {
            console.error('[auth] authorize RETURNING null: reason=Failed to create SUPER_ADMIN row:', (e as Error).message)
            return null
          }
        }

        if (!admin) {
          console.error('[auth] authorize RETURNING null: reason=No admin user for email:', email)
          return null
        }

        // For SUPER_ADMIN: if there is no password set in the DB yet, initialize it from ADMIN_PASSWORD in .env
        // so the first login works. Once a passwordHash exists (for example, changed via the Profile page),
        // do NOT overwrite it here – the DB value becomes the source of truth.
        if (isSuperAdminEmail && envPassword.length >= 8 && !admin.passwordHash) {
          const envHashForDb = await hash(envPassword, 10)
          await prisma.adminUser.update({ where: { email }, data: { passwordHash: envHashForDb } }).catch(() => {})
          admin = { ...admin, passwordHash: envHashForDb }
          console.log('[auth] SUPER_ADMIN: initialised DB password from .env ADMIN_PASSWORD')
        }

        // 1) Check DB password if set
        if (admin.passwordHash) {
          console.log('[auth] Branch: DB hash check')
          const isValid = await compare(rawPassword, admin.passwordHash)
          console.log('[auth] DB hash compare result:', isValid)
          if (isValid) {
            console.log('[auth] Result: SUCCESS (DB hash)')
            const userObj = { id: admin.id, email: admin.email, name: (admin as { displayName?: string | null }).displayName || 'Admin', image: (admin as { imageUrl?: string | null }).imageUrl ?? undefined, role: admin.role }
            console.log('[auth] authorize() RETURNING user object:', JSON.stringify({ id: userObj.id, email: userObj.email, name: userObj.name, role: userObj.role }))
            return userObj
          }
        } else {
          console.log('[auth] Branch: DB hash skipped (no passwordHash in DB)')
        }

        // 2) Fallback: SUPER_ADMIN with ADMIN_PASSWORD from .env (normalized comparison)
        const pwNorm = rawPassword.replace(/\s+/g, ' ').trim()
        const envNorm = envPassword.replace(/\s+/g, ' ').trim()
        const stringMatch = isSuperAdminEmail && envNorm.length >= 8 && (rawPassword === envPassword || pwNorm === envNorm)
        console.log('[auth] Branch: env password string match | envPassword.length>=8:', envNorm.length >= 8, '| rawPassword===envPassword:', rawPassword === envPassword, '| normalizedMatch:', pwNorm === envNorm, '| stringMatch:', stringMatch)
        if (stringMatch) {
          console.log('[auth] Result: SUCCESS (env password string match)')
          const newHash = await hash(rawPassword, 10)
          prisma.adminUser.update({ where: { email }, data: { passwordHash: newHash } }).catch((e) => console.error('[auth] Failed to save password to DB:', e))
          const userObj = { id: admin.id, email: admin.email, name: (admin as { displayName?: string | null }).displayName || 'Admin', image: (admin as { imageUrl?: string | null }).imageUrl ?? undefined, role: admin.role }
          console.log('[auth] authorize() RETURNING user object:', JSON.stringify({ id: userObj.id, email: userObj.email, name: userObj.name, role: userObj.role }))
          return userObj
        }

        // 3) Fallback: SUPER_ADMIN with ADMIN_PASSWORD_HASH from .env (bcrypt compare)
        if (isSuperAdminEmail && envHash.length > 0) {
          console.log('[auth] Branch: env ADMIN_PASSWORD_HASH bcrypt compare (executing)')
          try {
            const matchesEnvHash = await compare(rawPassword, envHash)
            console.log('[auth] env hash compare result:', matchesEnvHash)
            if (matchesEnvHash) {
              console.log('[auth] Result: SUCCESS (env hash match)')
              prisma.adminUser.update({ where: { email }, data: { passwordHash: envHash } }).catch(() => {})
              const userObj = {
                id: admin.id,
                email: admin.email,
                name: (admin as { displayName?: string | null }).displayName || 'Admin',
                image: (admin as { imageUrl?: string | null }).imageUrl ?? undefined,
                role: admin.role,
              }
              console.log('[auth] authorize() RETURNING user object:', JSON.stringify({ id: userObj.id, email: userObj.email, name: userObj.name, role: userObj.role }))
              return userObj
            }
          } catch (e) {
            console.log('[auth] env hash compare threw:', (e as Error).message)
          }
        } else {
          console.log('[auth] Branch: env hash skipped | isSuperAdminEmail:', isSuperAdminEmail, '| envHash.length>0:', envHash.length > 0)
        }

        console.error('[auth] authorize RETURNING null: reason=no strategy succeeded (DB hash failed or skipped; env string match false; env hash failed or skipped)')
        if (isSuperAdminEmail) {
          console.error('[auth] Hint: For denmaombi@gmail.com, set ADMIN_PASSWORD in .env to the exact password you type, save, then restart the dev server (npm run dev).')
        }
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
  trustHost: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log('[auth] signIn callback | provider:', account?.provider, '| user:', user ? { id: user.id, email: user.email } : null)
        if (account?.provider === 'google') {
          const email = (user.email || (profile as { email?: string })?.email || '').toLowerCase().trim()
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
          let admin = await adminUser.findUnique({ where: { email } })
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
              const admin = await adminUser.findUnique({
                where: { email: (token.email as string).toLowerCase().trim() },
              }) as { role?: string; displayName?: string; imageUrl?: string } | null
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
