import { unstable_noStore } from 'next/cache'
import { prisma } from '@/lib/db'

export type ProjectPublic = {
  id: string
  title: string
  slug: string
  description: string | null
  imageUrl: string | null
  link: string | null
  sortOrder: number
  updatedAt: Date
}

/**
 * Fetch all projects (portfolios) for public display.
 * Ordered by sortOrder then createdAt.
 * Returns empty array if DB is unavailable.
 */
export async function getProjects(): Promise<ProjectPublic[]> {
  try {
    unstable_noStore()
    return await prisma.project.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        imageUrl: true,
        link: true,
        sortOrder: true,
        updatedAt: true,
      },
    })
  } catch (e) {
    console.error('[getProjects]', e)
    return []
  }
}
