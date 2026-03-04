'use client'

import React, { useState } from 'react'
import { useInView } from '@/hooks/useInView'
import Link from 'next/link'
import Image from 'next/image'
import ProgramDetailModal, { type ProgramForModal } from '@/components/program/ProgramDetailModal'
import { imageSrc } from '@/lib/image-url'

export type ProgramItem = {
  id: string
  title: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
  regions?: string[]
}

type ProgramsSectionProps = {
  programs: ProgramItem[]
  /** When false, omits the section heading (e.g. on /programs where the page already has a hero). Default true. */
  showHeading?: boolean
}

/** First row only on home (e.g. 3 cards in a 3-column grid). Full list only on /programs. */
const FIRST_ROW_COUNT = 3
const PLACEHOLDER_IMAGE = '/assets/images/portfolios/UPDATED-MATERNAL-WHITE-BG-2048x2048.jpg'

export default function ProgramsSection({ programs = [], showHeading = true }: ProgramsSectionProps) {
  const visible = useInView('programs-section', { threshold: 0.08 })
  const [selectedProgram, setSelectedProgram] = useState<ProgramForModal | null>(null)
  const list = Array.isArray(programs) ? programs : []
  const items = list.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description ?? '',
    imageUrl: p.imageUrl ?? PLACEHOLDER_IMAGE,
    regions: p.regions,
  }))
  const isFullPage = !showHeading
  const displayed = isFullPage ? items : items.slice(0, FIRST_ROW_COUNT)

  return (
    <section
      id="programs-section"
      className="section-padding bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950"
      {...(showHeading && { 'aria-labelledby': 'programs-heading' })}
    >
      <div className="container-custom">
        {showHeading && (
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-4">
              <div className="h-0.5 w-16 bg-[#FF0000]" aria-hidden />
              <h2 id="programs-heading" className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#044444]">
                Our Programs
              </h2>
              <div className="h-0.5 w-16 bg-[#FF0000]" aria-hidden />
            </div>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400 text-sm max-w-xl mx-auto">
              Explore our initiatives and impact areas.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {items.length === 0 ? (
            <p className="col-span-full text-center text-neutral-500 dark:text-neutral-400 py-12">No programs at the moment. Check back soon.</p>
          ) : (
            displayed.map((p, i) => {
              const isRed = i % 2 === 0
              const accent = isRed ? '#FF0000' : '#044444'
              const programForModal: ProgramForModal = {
                id: p.id,
                title: p.title,
                slug: p.slug,
                description: p.description || null,
                imageUrl: p.imageUrl,
                regions: p.regions,
              }
              return (
                <article
                  key={p.id}
                  className={`group/card flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 shadow-md hover:shadow-xl hover:border-[#044444]/20 dark:hover:border-[#044444]/40 transition-all duration-300 hover:-translate-y-1.5 ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                  style={{ transitionDelay: visible ? `${80 + i * 60}ms` : '0ms' }}
                >
                  {/* Image with gradient overlay */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                    <Image
                      src={imageSrc(p.imageUrl)}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Bottom gradient for depth */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"
                      aria-hidden
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(to top, ${accent}30 0%, transparent 60%)`,
                      }}
                      aria-hidden
                    />
                    {/* Accent bar */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{ backgroundColor: accent }}
                      aria-hidden
                    />
                  </div>

                  {/* Content: consistent height with flex */}
                  <div className="flex flex-col flex-1 p-5 md:p-6">
                    <div
                      className="w-8 h-0.5 rounded-full mb-3 flex-shrink-0"
                      style={{ backgroundColor: accent }}
                      aria-hidden
                    />
                    <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover/card:text-[#044444] transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3 mb-5 flex-1 min-h-[3.75rem]">
                      {p.description || 'Learn more about this program.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedProgram(programForModal)}
                      className={`inline-flex items-center justify-center gap-1 w-fit max-w-max self-center font-semibold text-sm py-2.5 px-2 rounded-xl border border-neutral-200 dark:border-neutral-600 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#044444]/50 ${
                        isRed
                          ? 'text-[#FF0000] hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]'
                          : 'text-[#044444] hover:bg-[#044444] hover:text-white hover:border-[#044444]'
                      }`}
                    >
                      Learn more
                      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </article>
              )
            })
          )}
        </div>

        {/* Only show "View all programs" when we're in the limited view (home). On /programs we already show all, so the link would be redundant. */}
        {showHeading && list.length > FIRST_ROW_COUNT && (
          <div className="mt-10 text-center">
            <Link
              href="/programs"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#044444] hover:bg-[#033333] text-white font-semibold px-8 py-3.5 text-sm shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#044444] focus:ring-offset-2 active:scale-[0.98]"
            >
              View all programs
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {selectedProgram && (
        <ProgramDetailModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
          showViewAllLink={showHeading}
        />
      )}
    </section>
  )
}
