import React from 'react'
import dynamic from 'next/dynamic'
import Hero from '@/components/sections/Hero'
import ValueStrip from '@/components/ui/ValueStrip'
import { getPrograms } from '@/lib/programs'
import { getProjects } from '@/lib/projects'

const Stats = dynamic(() => import('@/components/sections/Stats'), { ssr: true })
const AboutSection = dynamic(() => import('@/components/sections/AboutSection'), { ssr: true })
const PortfolioSection = dynamic(() => import('@/components/sections/PortfolioSection'), { ssr: true })
const ProgramsSection = dynamic(() => import('@/components/sections/ProgramsSection'), { ssr: true })
const Team = dynamic(() => import('@/components/sections/Team'), { ssr: true })
const CTA = dynamic(() => import('@/components/sections/CTA'), { ssr: true })

export const revalidate = 60

export default async function Home(): Promise<React.ReactElement> {
  const [programs, projects] = await Promise.all([getPrograms(), getProjects()])
  const portfoliosJson = projects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description ?? null,
    imageUrl: p.imageUrl ?? null,
    link: p.link ?? null,
    sortOrder: p.sortOrder,
    updatedAt: p.updatedAt,
  }))
  return (
    <div className="flex flex-col">
      <Hero />
      <ValueStrip />
      <Stats />
      <AboutSection />
      <PortfolioSection portfolios={portfoliosJson} />
      <ProgramsSection programs={programs} />
      <Team />
      <CTA />
    </div>
  )
}

