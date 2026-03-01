import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

async function withErrorLog(
  req: Request,
  ctx: { params: Promise<{ nextauth: string[] }> },
  fn: (req: Request, ctx: { params: Promise<{ nextauth: string[] }> }) => ReturnType<typeof handler>
) {
  try {
    return await fn(req, ctx)
  } catch (e) {
    console.error('[nextauth] Route error:', e)
    throw e
  }
}

export const GET = (req: Request, ctx: { params: Promise<{ nextauth: string[] }> }) =>
  withErrorLog(req, ctx, (r, c) => handler(r as never, c as never))
export const POST = (req: Request, ctx: { params: Promise<{ nextauth: string[] }> }) =>
  withErrorLog(req, ctx, (r, c) => handler(r as never, c as never))
