'use client'

import React from 'react'
import { useInView } from '@/hooks/useInView'

const VALUES = [
  { 
    label: 'Equity', 
    short: 'Inclusive, fair access to healthcare',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  { 
    label: 'Innovation', 
    short: 'Technology and creative solutions',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
  },
  { 
    label: 'Integrity', 
    short: 'Transparency and accountability',
    icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
  },
  { 
    label: 'Collaboration', 
    short: 'Partnerships for greater impact',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  },
]

export default function ValueStrip() {
  const visible = useInView('values-strip', { threshold: 0.15 })

  return (
    <section
      id="values-strip"
      className="relative py-8 md:py-10 bg-white/95 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
      aria-label="Our core values"
    >
      
      <div className="container-custom relative z-10">
        <div
          className={`text-center mb-6 md:mb-8 transition-all duration-600 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
              <div className="inline-flex items-center gap-4">
                <div className="h-0.5 w-16 bg-[#FF0000]" aria-hidden />
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#044444]">
              Our values
                </h2>
                <div className="h-0.5 w-16 bg-[#FF0000]" aria-hidden />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {VALUES.map((v, i) => (
            <div
              key={v.label}
              className={`group relative text-center p-4 md:p-5 rounded-xl bg-[#044444]/80 backdrop-blur-sm border border-[#044444]/30 shadow-[0_4px_16px_rgba(4,68,68,0.2)] transition-all duration-300 ease-out hover:bg-[#044444]/90 hover:border-[#FF0000]/40 hover:shadow-[0_6px_20px_rgba(4,68,68,0.3)] ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: visible ? `${80 + i * 60}ms` : '0ms' }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-3">
                <div className="p-2.5 rounded-lg bg-white/10 group-hover:bg-[#FF0000]/20 transition-colors">
                  <svg className="h-5 w-5 text-white group-hover:text-[#FF0000] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={v.icon} />
                  </svg>
                </div>
              </div>
              
              {/* Content */}
              <span className="block text-base font-bold text-white mb-1.5">
                {v.label}
              </span>
              <span className="block text-xs text-white/75 leading-relaxed">
                {v.short}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
