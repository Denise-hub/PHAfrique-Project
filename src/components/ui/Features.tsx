'use client'

import React from 'react'
import { useInView } from '@/hooks/useInView'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { imageSrc } from '@/lib/image-url'

interface Program {
  id: string
  title: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
}

export default function Features() {
  const visible = useInView('portfolio-section', { threshold: 0.08 })
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/programs')
      .then((r) => {
        if (!r.ok) {
          throw new Error('Failed to fetch programs')
        }
        return r.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setPrograms(data.slice(0, 6))
        } else {
          setPrograms([])
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching programs:', error)
        setPrograms([])
        setLoading(false)
      })
  }, [])

  return (
    <section
      id="portfolio-section"
      className="section-padding bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950"
      aria-labelledby="portfolio-heading"
    >
      <div className="container-custom">
        {/* Section heading */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-4">
            <div className="h-0.5 w-16 bg-[#FF0000]" aria-hidden />
            <h2 id="portfolio-heading" className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#044444] dark:text-[#44AAAA]">
              Our Programs
            </h2>
            <div className="h-0.5 w-16 bg-[#FF0000]" aria-hidden />
          </div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base">
            Discover our transformative programs and initiatives that are making a lasting impact on public health across Africa
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#044444] border-r-transparent"></div>
            <p className="mt-4 text-neutral-500">Loading programs...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-6 rounded-2xl bg-white/50 dark:bg-neutral-900/30 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg max-w-md">
              <svg className="h-12 w-12 mx-auto text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-2">No programs available yet</p>
              <p className="text-sm text-neutral-500">Programs will appear here once they are added through the admin panel.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured + Grid layout */}
            <div className="space-y-8 md:space-y-12">
              {programs.length > 0 && (
                <div className={`transition-all duration-700 ease-out ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: visible ? '100ms' : '0ms' }}>
                  <Link
                    href={`/programs#${programs[0].slug}`}
                    className="group block rounded-2xl overflow-hidden bg-white dark:bg-neutral-800/50 shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 border-2 border-transparent hover:border-[#FF0000]/30"
                  >
                    <div className="grid md:grid-cols-2 gap-0">
                      {/* Image Section */}
                      <div className="relative aspect-[4/3] md:aspect-auto md:h-full min-h-[300px] overflow-hidden bg-gradient-to-br from-[#044444]/10 to-[#FF0000]/10">
                        <div className="absolute inset-0 border-t-4 border-[#FF0000] z-10" aria-hidden />
                        <div className="absolute top-0 right-0 bottom-0 w-2 bg-[#044444] z-10" aria-hidden />
                        <Image
                          src={imageSrc(programs[0].imageUrl || '/assets/images/programs/hero.jpeg')}
                          alt={programs[0].title}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#044444]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden />
                        
                        {/* Featured Badge */}
                        <div className="absolute top-4 left-4 z-20">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF0000] text-white text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Featured
                          </span>
                        </div>
                      </div>
                      
                      {/* Content Section */}
                      <div className="p-6 md:p-8 lg:p-10 relative flex flex-col justify-center bg-gradient-to-br from-white to-neutral-50/50 dark:from-neutral-800 dark:to-neutral-800/50">
                        {/* Dual accent lines on left */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden>
                          <div className="h-1/2 bg-[#FF0000]" />
                          <div className="h-1/2 bg-[#044444]" />
                        </div>
                        
                        <div className="mb-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#044444]/10 text-[#044444] border border-[#044444]/20 dark:bg-[#44AAAA]/10 dark:text-[#44AAAA] dark:border-[#44AAAA]/20">
                            Program
                          </span>
                        </div>
                        
                        <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3 group-hover:text-[#044444] dark:group-hover:text-[#44AAAA] transition-colors duration-300">
                          {programs[0].title}
                        </h3>
                        
                        {programs[0].description && (
                          <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 line-clamp-4">
                            {programs[0].description}
                          </p>
                        )}
                        
                        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-gradient-to-r from-[#FF0000]/10 via-[#FF0000]/5 to-[#044444]/10 border-2 border-[#FF0000]/30 group-hover:border-[#044444]/50 transition-all duration-300 group-hover:shadow-lg">
                          <span className="text-[#FF0000] font-bold text-sm group-hover:text-[#044444] dark:group-hover:text-[#44AAAA] transition-colors duration-300">
                            Explore Program
                          </span>
                          <svg className="h-5 w-5 text-[#044444] dark:text-[#44AAAA] transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {programs.length > 1 && (
                <div className="rounded-2xl bg-white/50 dark:bg-neutral-900/30 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-700/50 shadow-lg p-4 md:p-6 lg:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {programs.slice(1, 7).map((program, i) => (
                      <Link
                        key={program.id}
                        href={`/programs#${program.slug}`}
                        className={`group rounded-xl overflow-hidden bg-white dark:bg-neutral-800/50 transition-all duration-300 ease-out shadow-lg hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#044444]/30 focus:ring-offset-2 dark:focus:ring-offset-neutral-950 border-2 border-transparent hover:border-[#FF0000]/30 ${
                          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                        style={{ transitionDelay: visible ? `${200 + i * 80}ms` : '0ms' }}
                      >
                        {/* Image with dual accent borders */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                          {/* Red top border */}
                          <div className="absolute inset-0 border-t-4 border-[#FF0000] z-10" aria-hidden />
                          {/* Teal accent stripe on right side */}
                          <div className="absolute top-0 right-0 bottom-0 w-1 bg-[#044444] z-10" aria-hidden />
                          <Image
                            src={imageSrc(program.imageUrl || '/assets/images/programs/hero.jpeg')}
                            alt={program.title}
                            fill
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#044444]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden />
                        </div>
                        
                        {/* Card content */}
                        <div className="p-5 md:p-6 relative">
                          {/* Dual accent lines on left */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden>
                            <div className="h-1/2 bg-[#FF0000]" />
                            <div className="h-1/2 bg-[#044444]" />
                          </div>
                          
                          <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-[#044444] dark:group-hover:text-[#44AAAA] transition-colors duration-300">
                            {program.title}
                          </h3>
                          {program.description && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-3">
                              {program.description}
                            </p>
                          )}
                          
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-[#FF0000]/10 to-[#044444]/10 border border-[#FF0000]/20 group-hover:border-[#044444]/30 transition-all duration-300">
                            <span className="text-[#FF0000] font-semibold text-sm group-hover:text-[#044444] dark:group-hover:text-[#44AAAA] transition-colors duration-300">
                              View program
                            </span>
                            <svg className="h-4 w-4 text-[#044444] dark:text-[#44AAAA] transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* View All Button */}
            <div className="mt-8 sm:mt-10 text-center">
              <Link 
                href="/programs" 
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#044444] hover:bg-[#033333] text-white font-semibold px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#044444] focus:ring-offset-2 active:scale-[0.98]"
              >
                View all programs
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
