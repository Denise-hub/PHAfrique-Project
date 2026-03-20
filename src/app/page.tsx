import React from 'react'
import nextDynamic from 'next/dynamic'
import Hero from '@/components/sections/Hero'
import ValueStrip from '@/components/ui/ValueStrip'
import { getPrograms } from '@/lib/programs'

const GetToKnowUs = nextDynamic(() => import('@/components/sections/GetToKnowUs'), { ssr: true })
const SustainableHealthcareSection = nextDynamic(
  () => import('@/components/sections/SustainableHealthcareSection'),
  { ssr: true },
)
const ProgramsSection = nextDynamic(() => import('@/components/sections/ProgramsSection'), { ssr: true })
const CTA = nextDynamic(() => import('@/components/sections/CTA'), { ssr: true })

export const dynamic = 'force-dynamic'

export default async function Home(): Promise<React.ReactElement> {
  const programs = await getPrograms()
  return (
    <div className="flex flex-col">
      <Hero />
      <ValueStrip />
      <GetToKnowUs />
      <SustainableHealthcareSection />
      <ProgramsSection programs={programs} />
      <CTA />
    </div>
  )
}

