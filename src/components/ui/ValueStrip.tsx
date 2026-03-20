'use client'

import React from 'react'
import Image from 'next/image'
import { useInView } from '@/hooks/useInView'

const GOALS = [
  {
    label: 'Maternal and Child Health',
    short: 'Every mother and child is physically and mentally healthy',
    icon: 'M12 14c1.657 0 3-1.567 3-3.5S13.657 7 12 7s-3 1.567-3 3.5 1.343 3.5 3 3.5zm0 0c-3.314 0-6 2.015-6 4.5V20h12v-1.5c0-2.485-2.686-4.5-6-4.5z',
    image: '/assets/images/portfolios/UPDATED-MATERNAL-WHITE-BG-2048x2048.jpg',
  },
  {
    label: 'Mental Health',
    short: 'Every African has access to mental health support',
    icon: 'M12 4a4 4 0 00-4 4v1H7a3 3 0 000 6h1v1a4 4 0 008 0v-1h1a3 3 0 000-6h-1V8a4 4 0 00-4-4z',
    image: '/assets/images/portfolios/UPDATED-MENTAL-HEALTH-WHITE-BG-2048x2048.jpg',
  },
  {
    label: 'Environmental Health',
    short: 'Every African lives in a safe clean environment',
    icon: 'M12 3l4 4h-3v6h-2V7H8l4-4zm-6 9a4 4 0 104 4H6v-4zm12 0a4 4 0 11-4 4h4v-4z',
    image: '/assets/images/portfolios/UPDATED-ENVIRONMENTAL-WHITE-BG-2048x2048.jpg',
  },
  {
    label: 'Ethics',
    short: 'Every African has equitable access to healthcare',
    icon: 'M12 4.5c-1.657 0-3 1.343-3 3V11H7v2h2v6h2v-6h2v-2h-2V7.5c0-.552.448-1 1-1H17V4.5h-5z',
    image: '/assets/images/portfolios/UPDATED-ETHICS-WHITE-BG-2048x2048.jpg',
  },
]

export default function ValueStrip() {
  const visible = useInView('values-strip', { threshold: 0.15 })

  return (
    <section
      id="values-strip"
      className="relative py-8 md:py-10 bg-white/95 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
      aria-label="Our goals"
    >
      
      <div className="container-custom relative z-10">
        <div
          className={`text-center mb-4 md:mb-6 transition-all duration-600 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="inline-flex items-center gap-4">
            <div className="h-0.5 w-16 bg-[#FF0000]" aria-hidden />
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#044444] dark:text-[#44AAAA]">
              Our Goals
            </h2>
            <div className="h-0.5 w-16 bg-[#FF0000]" aria-hidden />
          </div>
          <p className="mt-3 max-w-3xl mx-auto text-xs sm:text-sm md:text-base text-neutral-600">
            The overarching goal of Public Health en Afrique&apos;s plan is to drive results to
            improve access to quality, safe and affordable healthcare for all Africans.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {GOALS.map((v, i) => (
            <div
              key={v.label}
              className={`group relative text-center p-4 md:p-5 rounded-xl bg-white border border-neutral-200 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#044444]/40 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: visible ? `${80 + i * 60}ms` : '0ms' }}
            >
              {/* Image */}
              {v.image && (
                <div className="mb-4">
                  <div className="relative mx-auto h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border border-neutral-200 shadow-sm">
                    <Image
                      src={v.image}
                      alt={v.label}
                      fill
                      className="object-contain"
                      sizes="112px"
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <span className="block text-lg sm:text-xl font-bold text-neutral-900 mb-2">
                {v.label}
              </span>
              <span className="block text-sm sm:text-base text-neutral-600 leading-relaxed">{v.short}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
