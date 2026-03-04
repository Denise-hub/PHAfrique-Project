import { NextResponse } from 'next/server'

/**
 * Log a Prisma/DB error and return a 500 JSON response with a clear message.
 * Use in API routes so production gets real error info instead of generic "Failed to ...".
 */
export function handleApiError(
  context: string,
  error: unknown,
  fallbackMessage = 'An error occurred'
): NextResponse {
  const err = error as Error & { code?: string; meta?: unknown }
  const message = err?.message || fallbackMessage
  const code = err?.code
  console.error(`[${context}]`, code ? `${code}: ${message}` : message, err?.meta ?? '')
  if (code === 'P2002') {
    return NextResponse.json(
      { error: 'A record with this value already exists.' },
      { status: 400 }
    )
  }
  if (code === 'P2025') {
    return NextResponse.json({ error: 'Record not found.' }, { status: 404 })
  }
  return NextResponse.json({ error: message }, { status: 500 })
}
