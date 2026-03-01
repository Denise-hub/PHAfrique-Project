'use client'

import React from 'react'
import { useInView } from '@/hooks/useInView'
import Image from 'next/image'

interface TeamMember {
  name: string
  role: string
  image: string
}

// Team members data extracted from filenames
const TEAM_MEMBERS: TeamMember[] = [
  { name: 'Eunice Tshilengu', role: 'Co-Founder (Environmental Health)', image: '/assets/images/team/Eunice Tshilengu Co-Founder (Environmental Health).jpg' },
  { name: 'Jemima Lotika', role: 'Co-Founder (Maternal & Child Health)', image: '/assets/images/team/Jemima Lotika Co-Founder (Maternal & Child Health).jpeg' },
  { name: 'Tshowa Kabala', role: 'Co-Founder (Ethics & Mental Health)', image: '/assets/images/team/Tshowa Kabala Co-Founder (Ethics & Mental Health).jpg' },
  { name: 'Lydia Bistegn', role: 'Grant Manager', image: '/assets/images/team/Lydia Bistegn (Grant Manager).jpg' },
  { name: 'Dominica Emelife', role: 'Mental Health Portfolio Manager', image: '/assets/images/team/Dominica Emelife (Mental Health Portfolio Manager).JPG' },
  { name: 'Munashe Faranisi', role: 'Social Media Manager', image: '/assets/images/team/Munashe Faranisi (Social Media Manager).png' },
  { name: 'Oratile Tshukudu', role: 'Administrative Officer', image: '/assets/images/team/Oratile Tshukudu (Administrative Officer).jpg' },
  { name: 'Queren Basemenane', role: 'Newsletter Manager', image: '/assets/images/team/Queren Basemenane (Newsletter Manager).jpg' },
]

export default function Team() {
  const visible = useInView('team-section', { threshold: 0.1 })

  // Separate co-founders and other team members (excluding generic "Team Member" roles)
  const coFounders = TEAM_MEMBERS.filter(m => m.role.includes('Co-Founder'))
  const otherMembers = TEAM_MEMBERS.filter(m => !m.role.includes('Co-Founder') && m.role !== 'Team Member')

  return (
    <section
      id="team-section"
      className="section-padding bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950"
      aria-labelledby="team-heading"
    >
      <div className="container-custom">
        {/* Section heading */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-4">
            <div className="h-0.5 w-16 bg-[#FF0000]" aria-hidden />
            <h2 id="team-heading" className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#044444]">
              Our Team
            </h2>
            <div className="h-0.5 w-16 bg-[#FF0000]" aria-hidden />
          </div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base">
            Meet the dedicated professionals driving our mission to improve public health across Africa
          </p>
        </div>

        {/* Co-Founders Section */}
        {coFounders.length > 0 && (
          <div className="mb-12 md:mb-16">
            <h3 className="text-lg md:text-xl font-semibold text-[#044444] mb-6 text-center">Co-Founders</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {coFounders.map((member, i) => (
                <div
                  key={member.name}
                  className={`bg-white dark:bg-neutral-800/60 rounded-xl p-6 shadow-lg border border-neutral-100 dark:border-neutral-700/60 hover:shadow-xl transition-all duration-300 text-center ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: visible ? `${100 + i * 100}ms` : '0ms' }}
                >
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-[#044444]/10 dark:ring-[#044444]/20">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                  <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">{member.name}</h4>
                  <p className="text-sm text-[#044444] dark:text-[#044444] font-medium">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Team Members Section */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-[#044444] mb-6 text-center">Team Members</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {otherMembers.map((member, i) => (
              <div
                key={member.name}
                className={`bg-white dark:bg-neutral-800/60 rounded-xl p-4 shadow-md border border-neutral-100 dark:border-neutral-700/60 hover:shadow-lg transition-all duration-300 text-center ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: visible ? `${200 + i * 50}ms` : '0ms' }}
              >
                <div className="relative w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden ring-2 ring-[#044444]/10 dark:ring-[#044444]/20">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1 leading-tight">{member.name}</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
