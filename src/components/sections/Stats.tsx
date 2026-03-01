'use client'

import React from 'react'
import { useInView } from '@/hooks/useInView'

const STATS = [
  { 
    value: 'Comprehensive', 
    label: 'Programs', 
    description: 'Diverse initiatives spanning maternal health, WASH, emergency preparedness, and mental health support' 
  },
  { 
    value: 'Widespread', 
    label: 'Impact', 
    description: 'Reaching communities across multiple African nations through targeted health interventions' 
  },
  { 
    value: 'Collaborative', 
    label: 'Partnerships', 
    description: 'Working closely with communities, organizations, and stakeholders to maximize our reach' 
  },
  { 
    value: 'Hybrid', 
    label: 'Delivery', 
    description: 'Combining online platforms and in-person engagement to serve communities across Africa' 
  },
]

export default function Stats() {
  const visible = useInView('stats-section', { threshold: 0.1 })

  return (
    <section id="stats-section" className="section-padding bg-neutral-50 dark:bg-neutral-900">
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`text-center p-6 md:p-8 rounded-2xl bg-white dark:bg-neutral-800/60 dark:border dark:border-neutral-700/60 border border-neutral-100 shadow-sm transition-all duration-600 ease-out ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: visible ? `${80 + i * 100}ms` : '0ms' }}
            >
              <div className="text-2xl sm:text-3xl font-bold text-[#044444] leading-tight">{s.value}</div>
              <div className="mt-2 font-semibold text-neutral-900 dark:text-neutral-100">{s.label}</div>
              <div className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{s.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
