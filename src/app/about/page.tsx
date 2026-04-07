import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { unstable_noStore as noStore } from 'next/cache'
import PageHero from '@/components/ui/PageHero'
import VolunteersSection from '@/components/sections/VolunteersSection'
import { prisma } from '@/lib/db'
import { imageSrc } from '@/lib/image-url'

export const metadata: Metadata = {
  title: 'About Us | Public Health en Afrique',
  description:
    'Our mission, vision, and values: advancing public health in Africa through innovation, equity, and partnership.',
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const MISSION = 'Public Health en Afrique is dedicated to leading and collaborating with Africans to create a sustainable health system that ensures healthier lives for all. PHA focuses on equitable access to healthcare through partnerships, awareness campaigns, and community projects.'

const VISION = 'Our vision is to address health inequalities in Africa by identifying and filling gaps in health service delivery. We strive to ensure that every African has access to quality healthcare.'
const GOALS = "Public Health en Afrique's plan aims to drive results to improve access to quality, safe and affordable healthcare for all Africans."
const VALUES = [
  { title: 'Equity', desc: 'Ensuring inclusivity and fairness in access to healthcare.' },
  { title: 'Innovation', desc: 'Leveraging technology and creative solutions to solve public health challenges.' },
  { title: 'Integrity', desc: 'Upholding transparency and accountability in all actions.' },
  { title: 'Collaboration', desc: 'Building partnerships for greater impact.' },
  { title: 'Empowerment', desc: 'Supporting communities to take charge of their health.' },
  { title: 'Sustainability', desc: 'Creating lasting health solutions.' },
  { title: 'Compassion', desc: 'Approaching initiatives with empathy and dedication.' },
]

type FounderCard = {
  name: string
  email: string
  imageUrl: string
  subtitle?: string
}

function normalizeFounderName(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, '')
}

function canonicalFounderKey(name: string, email: string) {
  const n = normalizeFounderName(name)
  const e = email.trim().toLowerCase()
  if (n.includes('tshowa') || n.includes('kabala') || e.startsWith('tshowa@') || e.startsWith('kabala@')) return 'tshowa'
  if (n.includes('jemima') || e.startsWith('jemima@')) return 'jemima'
  if (n.includes('eunice') || e.startsWith('eunice@')) return 'eunice'
  return ''
}

const DEFAULT_FOUNDERS: FounderCard[] = [
  {
    name: 'Tshowa Kabala',
    email: 'tshowa@phafrique.com',
    imageUrl: '/assets/images/team/Tshowa_Kabala.png',
    subtitle: 'Ethics & Mental Health',
  },
  {
    name: 'Jemima Lotika',
    email: 'jemima@phafrique.com',
    imageUrl: '/assets/images/team/Jemima_Lotika.png',
    subtitle: 'Maternal and Child Health',
  },
  {
    name: 'Eunice Tshilengu',
    email: 'eunice@phafrique.com',
    imageUrl: '/assets/images/team/Eunice_Tshilengu_Co-Founder.png',
    subtitle: 'Environmental Health',
  },
]

async function getFounders(): Promise<FounderCard[]> {
  try {
    noStore()
    const rows = await prisma.adminUser.findMany({
      where: { role: 'CO_FOUNDER' },
      orderBy: { createdAt: 'asc' },
      select: { displayName: true, email: true, imageUrl: true },
    })
    if (!rows.length) return DEFAULT_FOUNDERS

    const mapped = rows.map((row) => {
      const name = (row.displayName || row.email.split('@')[0] || 'Co-founder').trim()
      const lower = name.toLowerCase()
      const isTshowa =
        lower.includes('tshowa') ||
        lower.includes('kabala') ||
        row.email.toLowerCase().startsWith('tshowa@') ||
        row.email.toLowerCase().startsWith('kabala@')
      const isJemima = lower.includes('jemima') || row.email.toLowerCase().startsWith('jemima@')
      const isEunice = lower.includes('eunice') || row.email.toLowerCase().startsWith('eunice@')

      const forcedCanonical =
        isTshowa
          ? '/assets/images/team/Tshowa_Kabala.png'
          : isJemima
            ? '/assets/images/team/Jemima_Lotika.png'
            : isEunice
              ? '/assets/images/team/Eunice_Tshilengu_Co-Founder.png'
              : null

      const resolved = forcedCanonical || (row.imageUrl ? imageSrc(row.imageUrl) : '')
      return {
        name,
        email: row.email,
        imageUrl: resolved || '/assets/logos/pha.jpg',
      }
    })
    const deduped = mapped.filter((founder, index, arr) => {
      const canonical = canonicalFounderKey(founder.name, founder.email)
      const key = canonical || founder.email.trim().toLowerCase() || normalizeFounderName(founder.name)
      return (
        arr.findIndex((f) => {
          const fCanonical = canonicalFounderKey(f.name, f.email)
          const fKey = fCanonical || f.email.trim().toLowerCase() || normalizeFounderName(f.name)
          return fKey === key
        }) === index
      )
    })

    const canonicalProfile: Record<string, { name: string; email: string; subtitle: string }> = {
      tshowa: { name: 'Tshowa Kabala', email: 'tshowa@phafrique.com', subtitle: 'Ethics & Mental Health' },
      jemima: { name: 'Jemima Lotika', email: 'jemima@phafrique.com', subtitle: 'Maternal and Child Health' },
      eunice: { name: 'Eunice Tshilengu', email: 'eunice@phafrique.com', subtitle: 'Environmental Health' },
    }

    const canonicalized = deduped.map((founder) => {
      const key = canonicalFounderKey(founder.name, founder.email)
      if (!key) return founder
      const profile = canonicalProfile[key]
      return {
        ...founder,
        name: profile.name,
        email: profile.email,
        subtitle: profile.subtitle,
      }
    })

    const sorted = [...canonicalized].sort((a, b) => {
      const aIsTshowa = a.name.toLowerCase().includes('tshowa') || a.email.toLowerCase().startsWith('tshowa@')
      const bIsTshowa = b.name.toLowerCase().includes('tshowa') || b.email.toLowerCase().startsWith('tshowa@')
      if (aIsTshowa && !bIsTshowa) return -1
      if (!aIsTshowa && bIsTshowa) return 1
      return 0
    })

    // Ensure the first founder card always uses the requested canonical image.
    if (sorted[0] && (sorted[0].name.toLowerCase().includes('tshowa') || sorted[0].email.toLowerCase().startsWith('tshowa@'))) {
      sorted[0].imageUrl = '/assets/images/team/Tshowa_Kabala.png'
    }

    return sorted
  } catch {
    return DEFAULT_FOUNDERS
  }
}

export default async function AboutPage() {
  const founders = await getFounders()
  return (
    <div className="pt-20">
      <PageHero title="About Us" />

      <section className="section-padding bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-stretch">
            {/* Mission, Vision and Goals Cards */}
            <div className="flex flex-col justify-center space-y-5 sm:space-y-6">
              {/* Mission Card */}
              <div className="bg-white dark:bg-neutral-800/60 rounded-xl p-5 sm:p-6 md:p-8 shadow-lg border border-neutral-100 dark:border-neutral-700/60 hover:shadow-xl transition-shadow duration-300 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="h-1 w-10 sm:w-12 bg-[#044444] rounded-full" aria-hidden />
                  <h3 className="text-lg sm:text-xl font-bold text-[#044444] dark:text-[#44AAAA]">Our Mission</h3>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
                  {MISSION}
                </p>
              </div>

              {/* Vision Card */}
              <div className="bg-white dark:bg-neutral-800/60 rounded-xl p-5 sm:p-6 md:p-8 shadow-lg border border-neutral-100 dark:border-neutral-700/60 hover:shadow-xl transition-shadow duration-300 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="h-1 w-10 sm:w-12 bg-[#FF0000] rounded-full" aria-hidden />
                  <h3 className="text-lg sm:text-xl font-bold text-[#FF0000]">Our Vision</h3>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
                  {VISION}
                </p>
              </div>
            </div>

            {/* Creative Image Display */}
            <div className="relative order-first lg:order-last flex items-center">
              <div className="relative w-full aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                {/* Decorative border accent */}
                <div className="absolute inset-0 border-2 sm:border-4 border-[#044444]/20 rounded-xl sm:rounded-2xl pointer-events-none z-10" aria-hidden />
                <div className="absolute -bottom-2 -right-2 w-20 h-20 sm:w-24 sm:h-24 bg-[#FF0000]/10 rounded-full blur-2xl pointer-events-none z-0" aria-hidden />
                <div className="absolute -top-2 -left-2 w-24 h-24 sm:w-32 sm:h-32 bg-[#044444]/10 rounded-full blur-2xl pointer-events-none z-0" aria-hidden />
                
                <div className="relative w-full h-full z-0">
                  <Image
                    src="/assets/images/about/IMG_7872.jpg"
                    alt="Public Health Corps Africa — community and team"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                
                {/* Subtle overlay gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#044444]/5 via-transparent to-[#FF0000]/5 pointer-events-none z-0" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Objectives Section */}
      <section className="pt-12 md:pt-16 pb-16 md:pb-24 bg-[#F5F5F7] dark:bg-neutral-950">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
              Our <span className="text-[#FF0000]">Objectives</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: image with layered cards */}
            <div className="relative">
              <div
                className="absolute -top-8 -left-6 w-36 h-36 rounded-[32px] bg-[#FF0000] shadow-2xl"
                aria-hidden
              />
              <div
                className="absolute -bottom-10 -right-6 w-40 h-40 rounded-[32px] bg-black/70 shadow-2xl"
                aria-hidden
              />
              <div className="relative rounded-[32px] overflow-hidden shadow-2xl">
                <Image
                  src="/assets/images/about/IMG_7872.jpg"
                  alt="Public Health en Afrique team engaging with community"
                  width={1200}
                  height={900}
                  className="w-full h-[380px] sm:h-[460px] md:h-[520px] lg:h-[560px] object-cover"
                />
              </div>
            </div>

            {/* Right: objectives cards */}
            <div className="flex flex-col gap-6">
              {/* Improved Health Outcomes */}
              <article className="bg-white dark:bg-neutral-900 rounded-3xl px-6 py-5 md:px-8 md:py-6 shadow-xl border border-neutral-200/80 dark:border-neutral-700/60">
                <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  Improved Health Outcomes
                </h3>
                <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  Over the long term, Public Health en Afrique (PHA) envisions significant improvements in
                  health outcomes across Africa. This includes reductions in maternal and child mortality
                  rates, improvements in environmental health indicators, advancements in mental health care
                  accessibility and outcomes, and overall enhancements in population health.
                </p>
              </article>

              {/* Empowered Communities */}
              <article className="bg-white dark:bg-neutral-900 rounded-3xl px-6 py-5 md:px-8 md:py-6 shadow-xl border border-neutral-200/80 dark:border-neutral-700/60">
                <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  Empowered Communities
                </h3>
                <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  African communities are actively involved in decision-making processes, equipped with the
                  knowledge and resources to advocate for their health priorities and participate in health
                  promotion activities.
                </p>
              </article>

              {/* Equitable Access To Healthcare */}
              <article className="bg-white dark:bg-neutral-900 rounded-3xl px-6 py-5 md:px-8 md:py-6 shadow-xl border border-neutral-200/80 dark:border-neutral-700/60">
                <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                  Equitable Access To Healthcare
                </h3>
                <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  PHA&apos;s focus on removing barriers to healthcare access and promoting health among
                  vulnerable populations aims to achieve the long-term outcome of equitable access to
                  quality, safe, and affordable healthcare for all Africans. This includes addressing
                  disparities in access based on geography, socio-economic status, gender, and other factors.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* PH Afrique Aims & Countries Section */}
      <section className="pb-16 md:pb-24 bg-white dark:bg-neutral-950">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          {/* Aims */}
          <div className="pt-4 sm:pt-6 mb-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
              PH Afrique <span className="text-[#FF0000]">Aims</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto">
              To contribute to the long-term strengthening of health systems across the continent. This includes, but is
              not limited to:
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {/* Aim 1 */}
              <div className="rounded-2xl bg-gradient-to-r from-[#044444]/90 to-[#022222] text-white px-5 py-6 shadow-lg">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9 12.5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-center">
                  Improvements providing experience opportunities for public health students and recent graduates.
                </p>
              </div>

              {/* Aim 2 */}
              <div className="rounded-2xl bg-gradient-to-r from-[#FF0000]/90 to-[#CC0000] text-white px-5 py-6 shadow-lg">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9 12.5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-center">
                  Strengthening early-career public health partnerships across the continent.
                </p>
              </div>

              {/* Aim 3 */}
              <div className="rounded-2xl bg-gradient-to-r from-[#044444]/90 to-[#0A7373] text-white px-5 py-6 shadow-lg">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9 12.5l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-center">
                  PHA establishment across <span className="font-semibold">all African countries</span>, building a
                  network of public health advocates and practitioners.
                </p>
              </div>
            </div>
          </div>

          {/* Countries We Are Working In */}
          <div className="mt-8 max-w-5xl mx-auto">
            <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg px-4 py-5 sm:px-6 sm:py-6">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
                  Countries We Are <span className="text-[#FF0000]">Working In</span>
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 max-w-3xl mx-auto">
                  PHA is actively working and expanding its reach in{' '}
                  <span className="font-semibold">South Africa, Zimbabwe, eSwatini, and Nigeria</span>. Our remote teams
                  in these four countries are driving PHA’s mission forward by addressing health challenges through our
                  four key pillars: raising awareness of health issues, enhancing communication, advocating for health,
                  and implementing impactful projects.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {['South Africa', 'Zimbabwe', 'eSwatini', 'Nigeria'].map((country) => (
                  <div
                    key={country}
                    className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-3 sm:px-4 sm:py-4 shadow-sm flex items-center justify-center text-center"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                      {country}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Co-founders Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-3">
              <span className="hidden sm:inline-block h-[2px] w-10 sm:w-16 rounded-full bg-gradient-to-r from-[#044444] to-[#FF0000]" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                Meet the Co-founders
              </h2>
              <span className="hidden sm:inline-block h-[2px] w-10 sm:w-16 rounded-full bg-gradient-to-r from-[#FF0000] to-[#044444]" />
            </div>
          </div>

          {/* Intro text + image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-14">
            <div className="bg-white/90 dark:bg-neutral-900/90 rounded-3xl shadow-lg px-5 py-6 sm:px-7 sm:py-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                Putting Africa First in Public Health
              </h3>
              <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                We, as the co-founders, have a strong love for public health and Africa. We have a passion for Public
                Health and want to see the improvement of this sector in Africa. We originally had our own initiatives
                but decided to join forces for a more effective and sustainable outcome.
              </p>
              <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                Africa faces a few health problems – inadequate health services, poor health infrastructure, limited
                access to water and electricity, and barriers to accessing quality, safe and affordable healthcare. To
                address these challenges in service delivery in the health sector, we aim to partner with African
                established organisations that share the same vision as us and collaborate with them to address these
                gaps.
              </p>
              <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
                We will raise awareness of these issues through our projects as well as on our social media platforms,
                in alignment with our four main portfolios:
              </p>
              <ul className="text-sm sm:text-base text-neutral-800 dark:text-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF0000]/10 text-[#FF0000] text-xs">
                    ●
                  </span>
                  Mental health
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF0000]/10 text-[#FF0000] text-xs">
                    ●
                  </span>
                  Environmental health
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF0000]/10 text-[#FF0000] text-xs">
                    ●
                  </span>
                  Ethics
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF0000]/10 text-[#FF0000] text-xs">
                    ●
                  </span>
                  Maternal and child health
                </li>
              </ul>
              <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                Through these services, we envision an Africa with access to quality safe and affordable healthcare.
                The right to health is the right to the enjoyable of the highest attainable standard of physical and
                mental health. Thus, through our service deliveries, barriers to healthcare may be removed, and health
                may be promoted amongst the most vulnerable populations.
              </p>
            </div>

            <div className="relative">
              <div
                className="absolute -top-6 -left-4 w-32 h-32 rounded-[32px] bg-[#FF0000]/80 shadow-2xl"
                aria-hidden
              />
              <div
                className="absolute -bottom-10 -right-6 w-40 h-40 rounded-[32px] bg-[#044444]/80 shadow-2xl"
                aria-hidden
              />
              <div className="relative rounded-[32px] overflow-hidden shadow-2xl">
                <Image
                  src="/assets/logos/pha.jpg"
                  alt="Public Health en Afrique co-founders"
                  width={1200}
                  height={900}
                  className="w-full h-[320px] sm:h-[380px] md:h-[420px] lg:h-[460px] object-cover"
                />
              </div>

              {/* Floating Request strategic plan pill over image, linking to contact message area */}
              <a
                href="/contact#message"
                className="absolute -bottom-6 left-6 inline-flex items-center gap-2 rounded-full border border-transparent bg-[#044444] px-5 py-2 text-xs sm:text-sm font-semibold text-[#FF0000] shadow-lg hover:shadow-xl hover:bg-[#055555] transition-colors transition-shadow"
              >
                Request our strategic plan
              </a>
            </div>
          </div>

          {/* Co-founder videos */}
          <div className="mb-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-3xl bg-white/95 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-700/80 shadow-xl overflow-hidden">
                <div className="px-5 pt-5">
                  <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#FF0000]">
                    Our story
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                    Learn more about the vision and path of Public Health en Afrique directly from the co-founders.
                  </p>
                </div>
                <div className="mt-4">
                  <video
                    className="w-full h-[220px] sm:h-[260px] md:h-[280px] object-cover"
                    src="/assets/images/about/Co-founder%20english%20video.mp4"
                    controls
                    playsInline
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-white/95 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-700/80 shadow-xl overflow-hidden">
                <div className="px-5 pt-5">
                  <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-[#FF0000]">
                    Notre histoire
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                    Découvrez la vision et le parcours de Public Health en Afrique racontés par les co-fondatrices.
                  </p>
                </div>
                <div className="mt-4">
                  <video
                    className="w-full h-[220px] sm:h-[260px] md:h-[280px] object-cover"
                    src="/assets/images/about/co-founder%20french%20video.mp4"
                    controls
                    playsInline
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Founders cards */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-6 text-center">
              Founders
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {founders.map((founder) => (
                <div
                  key={founder.email}
                  className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg p-6 flex flex-col items-center text-center"
                >
                  <div className="mb-4 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white h-28 w-28 sm:h-32 sm:w-32 flex items-center justify-center overflow-hidden p-1">
                    <Image
                      src={founder.imageUrl}
                      alt={founder.name}
                      width={160}
                      height={160}
                      className="h-full w-full rounded-full object-contain"
                    />
                  </div>
                  <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{founder.name}</h4>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Co-founder</p>
                  {founder.subtitle && (
                    <p className="mt-0.5 text-xs font-medium text-[#044444] dark:text-[#44AAAA]">{founder.subtitle}</p>
                  )}
                  <a
                    href={`mailto:${founder.email}`}
                    className="mt-1 text-xs sm:text-sm font-medium text-[#044444] dark:text-[#44AAAA] hover:underline break-all"
                  >
                    {founder.email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <VolunteersSection />
    </div>
  )
}
