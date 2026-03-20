'use client'

import React from 'react'
import Image from 'next/image'
import { useInView } from '@/hooks/useInView'

const HEALTH_TEXT =
  'Public Health en Afrique will lead and collaborate with Africans to deliver a comprehensive and sustainable health system that aims to ensure healthier and better lives for our people.'

const QUALITY_TEXT =
  'All humans have the right to equitable access to quality, safe and affordable healthcare.'

const AIM_TEXT =
  'PHA aims to put Africa First in all health aspects (physical, mental, emotional, environmental, and social) to empower our communities for better health.'

export default function GetToKnowUs() {
  const visible = useInView('get-to-know-us', { threshold: 0.1 })

  return (
    <section
      id="get-to-know-us"
      className="section-padding bg-[#FF0000] text-white"
      aria-labelledby="get-to-know-us-heading"
    >
      <div className="container-custom">
        {/* Heading */}
        <div className="mt-[-20px] mb-8 md:mb-20 text-center">
          <div className="inline-flex items-center gap-4">
            <div className="h-0.5 w-12 sm:w-16 bg-white/80 rounded-full" aria-hidden />
            <h2
              id="get-to-know-us-heading"
              className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-white"
            >
              Get To Know Us
            </h2>
            <div className="h-0.5 w-12 sm:w-16 bg-white/80 rounded-full" aria-hidden />
          </div>
        </div>

        {/* Two-column layout */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-stretch transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* LEFT: stacked cards */}
          <div className="flex flex-col justify-center space-y-6 sm:space-y-7">
            {/* Health */}
            <div className="bg-white text-neutral-900 rounded-2xl p-6 md:p-7 shadow-xl">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center">
                  {/* Red Heart Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 
                             7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 
                             19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Health</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed">{HEALTH_TEXT}</p>
                </div>
              </div>
            </div>

            {/* Quality */}
            <div className="bg-white text-neutral-900 rounded-2xl p-6 md:p-7 shadow-xl">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center">
                  {/* Red Handshake Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 12h10M7 16h6M7 8h10m0 0l3 3m-3-3l-3-3"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Quality</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed">{QUALITY_TEXT}</p>
                </div>
              </div>
            </div>

            {/* Our Aim */}
            <div className="bg-white text-neutral-900 rounded-2xl p-6 md:p-7 shadow-xl">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center">
                  {/* Red Lightbulb Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 2a7 7 0 00-7 7c0 3.866 3.134 7 7 7s7-3.134 7-7a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Our Aim</h3>
                  <p className="mt-1 text-sm md:text-base leading-relaxed">{AIM_TEXT}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: image only */}
          <div className="relative flex items-center">
            <div className="relative w-full max-w-4xl mx-auto px-6 lg:px-10">
              {/* Decorative corner blocks */}
              <div
                className="absolute -top-16 left-10 w-32 h-32 rounded-[30px] bg-white shadow-2xl opacity-40 rotate-6"
                aria-hidden
              />
              <div
                className="absolute -bottom-16 right-10 w-36 h-36 rounded-[30px] bg-white shadow-2xl opacity-30"
                aria-hidden
              />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/assets/images/programs/knowus.jpeg"
                  alt="Public Health en Afrique team"
                  width={1000}
                  height={800}
                  className="
                    w-full object-cover
                    h-[300px]
                    sm:h-[360px]
                    md:h-[420px]
                    lg:h-[480px]
                  "
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}