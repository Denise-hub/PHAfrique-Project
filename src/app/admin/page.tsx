import Link from 'next/link'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  let programCount = 0
  let projectCount = 0
  let oppCount = 0
  let appCount = 0
  let pendingAppCount = 0
  let eventCount = 0
  let todayAppCount = 0

  try {
    const results = await Promise.all([
      prisma.program.count().catch(() => 0),
      prisma.project.count().catch(() => 0),
      prisma.opportunity.count().catch(() => 0),
      prisma.application.count().catch(() => 0),
      prisma.application.count({ where: { status: 'pending' } }).catch(() => 0),
      prisma.event.count().catch(() => 0),
      prisma.application.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }).catch(() => 0),
    ])
    
    programCount = results[0]
    projectCount = results[1]
    oppCount = results[2]
    appCount = results[3]
    pendingAppCount = results[4]
    eventCount = results[5]
    todayAppCount = results[6]
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  }

  // Get program breakdown (if programs have categories)
  let programs: { title: string }[] = []
  try {
    programs = await prisma.program.findMany({
      select: { title: true },
      take: 5,
    })
  } catch (error) {
    console.error('Error fetching programs:', error)
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#044444] dark:text-[#44AAAA] mb-2">Dashboard</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage your content, programs, and applications. Monitor key metrics and access quick actions below.
        </p>
      </div>

      {/* Metrics Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Programs */}
        <div className="rounded-2xl bg-gradient-to-br from-[#044444] to-[#033333] text-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-xs font-medium text-white/80">Total Programs</div>
          </div>
          <div className="text-4xl font-bold mb-1">{programCount}</div>
          <div className="text-sm text-white/70">Active health programs</div>
        </div>

        {/* Today's Applications */}
        <div className="rounded-2xl bg-gradient-to-br from-[#FF0000] to-[#CC0000] text-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="text-xs font-medium text-white/80">Today&apos;s Applications</div>
          </div>
          <div className="text-4xl font-bold mb-1">{todayAppCount}</div>
          <div className="text-sm text-white/70">New applications received</div>
        </div>

        {/* Pending Applications */}
        <div className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#FF0000]/10 rounded-lg">
              <svg className="h-6 w-6 text-[#FF0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Pending Review</div>
          </div>
          <div className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">{pendingAppCount}</div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-semibold rounded-full">
              {pendingAppCount} pending
            </span>
            <Link href="/admin/applications" className="text-sm text-[#044444] dark:text-[#44AAAA] hover:underline font-medium">
              View applications →
            </Link>
          </div>
        </div>

        {/* Total Portfolio */}
        <div className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#044444]/10 rounded-lg">
              <svg className="h-6 w-6 text-[#044444] dark:text-[#44AAAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Portfolio Projects</div>
          </div>
          <div className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">{projectCount}</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Active projects</div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Breakdown */}
        <div className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Program Overview</h2>
            <div className="p-2 bg-[#044444]/10 rounded-lg">
              <svg className="h-5 w-5 text-[#044444] dark:text-[#44AAAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#044444]/5 dark:bg-[#044444]/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#044444] rounded-lg">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">Total Programs</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Health initiatives</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-[#044444] dark:text-[#44AAAA]">{programCount}</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#FF0000]/5 dark:bg-[#FF0000]/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF0000] rounded-lg">
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">Opportunities</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">Internships & volunteering</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-[#FF0000]">{oppCount}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Quick Actions</h2>
            <div className="p-2 bg-[#FF0000]/10 rounded-lg">
              <svg className="h-5 w-5 text-[#FF0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            <Link
              href="/admin/programs"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-[#044444] to-[#033333] text-white rounded-lg hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-semibold">Add New Program</span>
              </div>
              <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/admin/projects"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-[#FF0000] to-[#CC0000] text-white rounded-lg hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-semibold">Add Portfolio Project</span>
              </div>
              <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/admin/opportunities"
              className="flex items-center justify-between p-4 bg-[#044444]/10 dark:bg-[#044444]/20 hover:bg-[#044444]/20 dark:hover:bg-[#044444]/30 rounded-lg transition-all group border border-[#044444]/20"
            >
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-[#044444] dark:text-[#44AAAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-semibold text-[#044444] dark:text-[#44AAAA]">Add Opportunity</span>
              </div>
              <svg className="h-5 w-5 text-[#044444] dark:text-[#44AAAA] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/admin/events"
              className="flex items-center justify-between p-4 bg-[#FF0000]/10 dark:bg-[#FF0000]/20 hover:bg-[#FF0000]/20 dark:hover:bg-[#FF0000]/30 rounded-lg transition-all group border border-[#FF0000]/20"
            >
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-[#FF0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-semibold text-[#FF0000]">Add News</span>
              </div>
              <svg className="h-5 w-5 text-[#FF0000] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
