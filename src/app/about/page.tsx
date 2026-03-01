import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import PageHero from '@/components/ui/PageHero'

export const metadata: Metadata = {
  title: 'About Us | Public Health Corps Africa',
  description: 'Our mission, vision, and values: advancing public health in Africa through innovation, equity, and partnership.',
}

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

export default function AboutPage() {
  return (
    <div className="pt-20">
      <PageHero title="About Public Health Corps" titleLine2="Africa" />

      <section className="section-padding bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-stretch">
            {/* Mission, Vision and Goals Cards */}
            <div className="flex flex-col justify-center space-y-5 sm:space-y-6">
              {/* Mission Card */}
              <div className="bg-white dark:bg-neutral-800/60 rounded-xl p-5 sm:p-6 md:p-8 shadow-lg border border-neutral-100 dark:border-neutral-700/60 hover:shadow-xl transition-shadow duration-300 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="h-1 w-10 sm:w-12 bg-[#044444] rounded-full" aria-hidden />
                  <h3 className="text-lg sm:text-xl font-bold text-[#044444]">Our Mission</h3>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">{MISSION}</p>
              </div>

              {/* Vision Card */}
              <div className="bg-white dark:bg-neutral-800/60 rounded-xl p-5 sm:p-6 md:p-8 shadow-lg border border-neutral-100 dark:border-neutral-700/60 hover:shadow-xl transition-shadow duration-300 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="h-1 w-10 sm:w-12 bg-[#FF0000] rounded-full" aria-hidden />
                  <h3 className="text-lg sm:text-xl font-bold text-[#FF0000]">Our Vision</h3>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">{VISION}</p>
              </div>

              {/* Goals Card */}
              <div className="bg-white dark:bg-neutral-800/60 rounded-xl p-5 sm:p-6 md:p-8 shadow-lg border border-neutral-100 dark:border-neutral-700/60 hover:shadow-xl transition-shadow duration-300 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="h-1 w-10 sm:w-12 bg-[#044444] rounded-full" aria-hidden />
                  <h3 className="text-lg sm:text-xl font-bold text-[#044444]">Our Goals</h3>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">{GOALS}</p>
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

      {/* Our Impact & Approach Section - Replacing Values with a different focus */}
      <section className="pt-12 md:pt-16 pb-16 md:pb-24 bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center mb-12 md:mb-16">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <div className="h-8 w-1 bg-gradient-to-b from-[#044444] to-[#FF0000] rounded-full" />
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                Our Approach
              </h2>
            </div>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              How we work to create sustainable health solutions across Africa
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {/* Community-Centered Approach */}
            <div className="group relative bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800/60 dark:to-neutral-900/40 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-200/50 dark:border-neutral-700/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#044444]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" aria-hidden />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#044444] to-[#033333] flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">Community-Centered</h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  We work directly with local communities, understanding their unique needs and co-creating solutions that are culturally relevant and sustainable.
                </p>
              </div>
            </div>

            {/* Evidence-Based Solutions */}
            <div className="group relative bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800/60 dark:to-neutral-900/40 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-200/50 dark:border-neutral-700/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF0000]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" aria-hidden />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF0000] to-[#E60000] flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">Evidence-Based</h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Our programs are grounded in research and data, ensuring that every initiative delivers measurable impact and addresses real health challenges.
                </p>
              </div>
            </div>

            {/* Partnership-Driven */}
            <div className="group relative bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800/60 dark:to-neutral-900/40 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-200/50 dark:border-neutral-700/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#044444]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" aria-hidden />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#044444] to-[#033333] flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">Partnership-Driven</h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  We believe in the power of collaboration, working alongside governments, NGOs, healthcare providers, and communities to amplify our collective impact.
                </p>
              </div>
            </div>

            {/* Long-Term Impact */}
            <div className="group relative bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800/60 dark:to-neutral-900/40 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-200/50 dark:border-neutral-700/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF0000]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" aria-hidden />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF0000] to-[#E60000] flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">Long-Term Impact</h3>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  We design programs that create lasting change, building capacity within communities and systems to ensure health improvements continue for generations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
