import { NextResponse } from 'next/server'
import { requireSection } from '@/lib/admin'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const unauth = await requireSection('dashboard')
  if (unauth) return unauth

  try {
    const [
      totalProjects,
      totalPrograms,
      totalOpportunities,
      totalApplications,
      totalEvents,
      pendingApplications,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.program.count(),
      prisma.opportunity.count(),
      prisma.application.count(),
      prisma.event.count(),
      prisma.application.count({ where: { status: 'pending' } }),
    ])

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentApplications = await prisma.application.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    })

    return NextResponse.json({
      totalProjects,
      totalPrograms,
      totalOpportunities,
      totalApplications,
      totalEvents,
      pendingApplications,
      activePrograms: totalPrograms,
      recentApplications,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
