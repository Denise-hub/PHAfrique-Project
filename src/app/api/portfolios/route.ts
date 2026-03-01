import { NextResponse } from 'next/server'
import { getProjects } from '@/lib/projects'

/** Force this route to run on every request; do not cache. */
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Public API: returns portfolio items for the public site.
 * No auth. Always reads from DB so admin edits show immediately.
 */
export async function GET() {
  try {
    const data = await getProjects()
    if (process.env.NODE_ENV === 'development') {
      console.log('[api/portfolios GET] returning', data.length, 'items')
    }
    const res = NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    })
    return res
  } catch (e) {
    console.error('[api/portfolios GET]', e)
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    })
  }
}
