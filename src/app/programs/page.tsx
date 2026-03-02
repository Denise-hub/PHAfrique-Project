import ProgramsSection from '@/components/sections/ProgramsSection'
import PageHero from '@/components/ui/PageHero'
import { getPrograms } from '@/lib/programs'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function ProgramsPage() {
  let programs: Awaited<ReturnType<typeof getPrograms>> = []
  try {
    programs = await getPrograms()
  } catch (e) {
    console.error('[programs page] getPrograms failed:', e)
  }
  if (!Array.isArray(programs)) programs = []
  const programsJson = programs.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description ?? null,
    imageUrl: p.imageUrl ?? null,
    sortOrder: p.sortOrder,
  }))
  return (
    <div className="pt-20">
      <PageHero title="Our Programs" />
      <ProgramsSection programs={programsJson} showHeading={false} />
    </div>
  )
}
