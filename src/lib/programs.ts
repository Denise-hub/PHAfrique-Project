import { unstable_noStore } from 'next/cache'
import { prisma } from '@/lib/db'

export type ProgramPublic = {
  id: string
  title: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
}

/**
 * Fetch all programs for public display (Programs section & Programs page).
 * Ordered by sortOrder then createdAt.
 * Returns empty array if DB is unavailable (e.g. after project rename or first run).
 */
export async function getPrograms(): Promise<ProgramPublic[]> {
  try {
    unstable_noStore()
    return await prisma.program.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        imageUrl: true,
        sortOrder: true,
      },
    })
  } catch (e) {
    console.error('[getPrograms]', e)
    return []
  }
}

/**
 * Fetch a single program by slug for the public program detail page.
 */
export async function getProgramBySlug(slug: string): Promise<ProgramPublic | null> {
  try {
    unstable_noStore()
    return await prisma.program.findUnique({
      where: { slug: slug.trim().toLowerCase() },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        imageUrl: true,
        sortOrder: true,
      },
    })
  } catch (e) {
    console.error('[getProgramBySlug]', e)
    return null
  }
}
