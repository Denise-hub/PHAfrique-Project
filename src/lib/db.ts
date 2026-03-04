import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (process.env.NODE_ENV === 'production' && (!url || url.startsWith('file:'))) {
    console.error('[db] In production, DATABASE_URL must be a PostgreSQL URL (e.g. Neon). Set it in Vercel → Project → Settings → Environment Variables.')
  }
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
  if (typeof (client as { adminUser?: unknown }).adminUser === 'undefined') {
    console.error('[db] Prisma client missing adminUser. Run: npx prisma generate')
  }
  return client
}

/** Stub used when Prisma init fails (e.g. after folder rename or DB locked). Avoids 500 on every page. */
function createStub(): Record<string, unknown> {
  const empty: Promise<unknown[]> = Promise.resolve([])
  const emptyNull: Promise<null> = Promise.resolve(null)
  const noop = (): Promise<null> => emptyNull
  const reject = (): Promise<never> => Promise.reject(new Error('Database unavailable'))
  return {
    $connect: () => Promise.resolve(),
    $disconnect: () => Promise.resolve(),
    adminUser: {
      findUnique: noop,
      findMany: () => empty,
      upsert: reject,
      update: async () => ({}),
    },
    program: { findMany: () => empty, findUnique: noop },
    project: { findMany: () => empty, findUnique: noop },
    event: { findMany: () => empty, findUnique: noop, create: noop, update: noop, delete: noop },
    image: { findMany: () => empty, findUnique: noop, create: noop, update: noop, delete: noop },
    content: { findMany: () => empty, findUnique: noop, upsert: noop, delete: noop },
    opportunity: { findMany: () => empty, findUnique: noop, create: noop, update: noop, delete: noop },
    application: { findMany: () => empty, findUnique: noop, create: noop, update: noop, count: async () => 0 },
    participant: { findMany: () => empty, findUnique: noop, create: noop, update: noop, delete: noop },
  }
}

let _instance: PrismaClient | ReturnType<typeof createStub> | null = null

function getPrisma(): PrismaClient | ReturnType<typeof createStub> {
  if (_instance) return _instance
  if (globalForPrisma.prisma) {
    _instance = globalForPrisma.prisma
    return _instance
  }
  try {
    _instance = createPrisma()
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _instance as PrismaClient
    return _instance
  } catch (e) {
    console.error('[db] PrismaClient init failed. App will run without database. Run: npx prisma generate (stop dev server first).', e)
    _instance = createStub()
    return _instance
  }
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop: string) {
    return (getPrisma() as Record<string, unknown>)[prop]
  },
})
