'use client'

import React from 'react'
import { useInView } from '@/hooks/useInView'
import Image from 'next/image'

const MISSION =
  'Public Health en Afrique is dedicated to leading and collaborating with Africans to create a sustainable health system that ensures healthier lives for all. PHA focuses on equitable access to healthcare through partnerships, awareness campaigns, and community projects.'

const VISION =
  'Our vision is to address health inequalities in Africa by identifying and filling gaps in health service delivery. We strive to ensure that every African has access to quality healthcare.'

const GOALS =
  "Public Health en Afrique's plan aims to drive results to improve access to quality, safe and affordable healthcare for all Africans."

export default function AboutSection() {
  const visible = useInView('about-section', { threshold: 0.1 })

  return (
    <section
      id="about-section"
      className="section-padding bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900"
      aria-labelledby="about-heading"
    >
      <div className="container-custom">
        {/* Enhanced section heading */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-4">
            <div className="h-0.5 w-16 bg-[#FF0000]" aria-hidden />
            <h2 id="about-heading" className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#044444]">
              About Us
            </h2>
            <div className="h-0.5 w-16 bg-[#FF0000]" aria-hidden />
          </div>
        </div>

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
                  src="/assets/images/about/7.jpeg"
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
  )
}
