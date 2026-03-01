'use client'

import React from 'react'
import Image from 'next/image'

// Countries where PHAfrica is actively involved (ISO 3166-1 alpha-2)
const FLAGS: { code: string; name: string }[] = [
  { code: 'za', name: 'South Africa' },
  { code: 'zw', name: 'Zimbabwe' },
  { code: 'sz', name: 'eSwatini' },
  { code: 'ng', name: 'Nigeria' },
]

const FLAG_BASE = 'https://flagcdn.com'

export default function CountryFlagsStrip() {
  return (
    <section
      className="relative overflow-hidden border-t border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-white via-neutral-50/50 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900/50 dark:to-neutral-900"
      aria-label="Countries where we work"
    >
      <div className="py-5 md:py-6">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4 px-4">
          Where we work
        </p>
        <div className="relative flex items-center justify-center min-h-[60px] overflow-hidden px-8 md:px-16 lg:px-24">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 lg:w-32 z-20 pointer-events-none bg-gradient-to-r from-neutral-50 via-neutral-50/90 to-transparent dark:from-neutral-900 dark:via-neutral-900/90" />
          {/* Scroll track - centered and continuously sliding */}
          <div className="relative z-10 w-full max-w-4xl mx-auto flex justify-center overflow-hidden">
            <div className="animate-scroll-flags flex flex-row gap-4 md:gap-6 shrink-0 motion-reduce:animate-none">
              {[...FLAGS, ...FLAGS, ...FLAGS, ...FLAGS].map(({ code, name }, i) => (
                <div
                  key={`flag-${i}`}
                  className="flex shrink-0 items-center justify-center group"
                >
                  <Image
                    src={`${FLAG_BASE}/w40/${code}.png`}
                    alt={name}
                    width={40}
                    height={30}
                    className="h-6 w-9 rounded object-cover shadow-sm ring-1 ring-neutral-200/60 dark:ring-neutral-700/50 group-hover:ring-[#044444]/40 dark:group-hover:ring-[#044444]/60 group-hover:shadow-md transition-all duration-300"
                    title={name}
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 lg:w-32 z-20 pointer-events-none bg-gradient-to-l from-neutral-50 via-neutral-50/90 to-transparent dark:from-neutral-900 dark:via-neutral-900/90" />
        </div>
      </div>
    </section>
  )
}
