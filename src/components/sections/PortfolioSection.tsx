'use client'

import React, { useState } from 'react'
import { useInView } from '@/hooks/useInView'
import Image from 'next/image'
import Link from 'next/link'
import { imageSrc } from '@/lib/image-url'

export type PortfolioItem = {
  id: string
  title: string
  slug: string
  description: string | null
  imageUrl: string | null
  link: string | null
  sortOrder: number
  /** ISO string or number for cache-busting images after edit */
  updatedAt?: string | Date
}

type PortfolioSectionProps = {
  portfolios?: PortfolioItem[]
  /** When true, "Learn more" expands in-card. When false, "Learn more" links to /portfolios. Default false (home). */
  isFullPage?: boolean
  /** When false, omits the section heading (e.g. on /portfolios where the page has a hero). Default true. */
  showHeading?: boolean
  /** Hides action buttons on cards. */
  hideActions?: boolean
  /** Uses large image-first cards for portfolio page layout. */
  fullImageCards?: boolean
}

const PLACEHOLDER_IMAGE = '/assets/images/portfolios/UPDATED-MATERNAL-WHITE-BG-2048x2048.jpg'

export default function PortfolioSection({
  portfolios = [],
  isFullPage = false,
  showHeading = true,
  hideActions = false,
  fullImageCards = false,
}: PortfolioSectionProps) {
  const visible = useInView('portfolios-section', { threshold: 0.1 })
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const list = Array.isArray(portfolios) ? portfolios : []

  return (
    <section
      id="portfolios-section"
      className="section-padding bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900"
      {...(showHeading && { 'aria-labelledby': 'portfolios-heading' })}
    >
      <div className="container-custom">
        {showHeading && (
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-4">
              <div className="h-0.5 w-16 bg-[#FF0000]" aria-hidden />
              <h2 id="portfolios-heading" className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#044444] dark:text-[#44AAAA]">
                Our Portfolios
              </h2>
              <div className="h-0.5 w-16 bg-[#FF0000]" aria-hidden />
            </div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base">
              Mental health, ethics, environmental health, and maternal & child health — our core portfolio areas.
            </p>
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          {list.length === 0 ? (
            <p className="text-center text-neutral-500 dark:text-neutral-400 py-12">No portfolios at the moment. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
              {list.map((item, i) => {
                const row = Math.floor(i / 2)
                const col = i % 2
                const colorIndex = (row + col) % 2
                const accentColor = colorIndex === 0 ? '#FF0000' : '#044444'
                const baseUrl = imageSrc(item.imageUrl ?? PLACEHOLDER_IMAGE)
                const imageUrl = item.updatedAt
                  ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}t=${typeof item.updatedAt === 'string' ? new Date(item.updatedAt).getTime() : (item.updatedAt as Date).getTime()}`
                  : baseUrl
                const isExpanded = isFullPage && expandedId === item.id && !hideActions

                return (
                  <div
                    key={`${item.id}-${item.updatedAt ?? ''}`}
                    className={`bg-white dark:bg-neutral-800 rounded-2xl overflow-visible transition-all duration-300 flex flex-col relative min-h-[200px] md:min-h-[220px] ${
                      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{
                      transitionDelay: visible ? `${100 + i * 100}ms` : '0ms',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <div className="p-4 md:p-5 flex flex-col relative z-10">
                      {fullImageCards ? (
                        <>
                          <div className="relative w-full h-56 md:h-64 rounded-xl overflow-hidden shadow-md ring-1 ring-neutral-200 dark:ring-neutral-700 mb-4">
                            <Image
                              key={imageUrl}
                              src={imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              unoptimized={imageUrl.startsWith('/uploads/')}
                            />
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed">
                            {item.description || 'No description available.'}
                          </p>
                        </>
                      ) : isExpanded ? (
                        <div className="overflow-hidden w-full">
                          <div className="relative float-right w-20 h-20 md:w-24 md:h-24 ml-3 md:ml-4 mb-3 md:mb-4 shrink-0 rounded-xl overflow-hidden shadow-md ring-1 ring-neutral-200 dark:ring-neutral-700">
                            <Image
                              key={imageUrl}
                              src={imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="96px"
                              unoptimized={imageUrl.startsWith('/uploads/')}
                            />
                          </div>
                          <h3 className="text-base md:text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1.5 leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm text-justify leading-relaxed mb-4 w-full">
                            {item.description || 'No description available.'}
                          </p>
                          {isFullPage && !hideActions && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedId((id) => (id === item.id ? null : item.id))
                              }}
                              className="self-start py-2 px-4 text-xs md:text-sm rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90"
                              style={{ backgroundColor: accentColor }}
                            >
                              Show less
                            </button>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="absolute top-3 right-3 w-32 md:w-40 h-32 md:h-40 flex-shrink-0 z-20">
                            <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md ring-1 ring-neutral-200 dark:ring-neutral-700">
                              <Image
                                key={imageUrl}
                                src={imageUrl}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 128px, 160px"
                                unoptimized={imageUrl.startsWith('/uploads/')}
                              />
                            </div>
                          </div>
                          <div className="pr-36 md:pr-44 flex flex-col min-w-0">
                            <h3 className="text-base md:text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1.5 leading-tight">
                              {item.title}
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 text-xs md:text-sm leading-snug mb-4 line-clamp-4">
                              {item.description || 'No description available.'}
                            </p>
                            {isFullPage ? (
                              !hideActions && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setExpandedId((id) => (id === item.id ? null : item.id))
                                }}
                                className="self-start py-2 px-4 text-xs md:text-sm rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90"
                                style={{ backgroundColor: accentColor }}
                              >
                                Learn more
                              </button>
                              )
                            ) : (
                              !hideActions && (
                              <Link
                                href="/portfolios"
                                className="self-start py-2 px-4 text-xs md:text-sm rounded-lg font-semibold text-white transition-all duration-200 hover:opacity-90"
                                style={{ backgroundColor: accentColor }}
                              >
                                Learn more
                              </Link>
                              )
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div
                      className="absolute bottom-0 left-0 w-1/2 h-1 rounded-bl-2xl"
                      style={{ backgroundColor: accentColor }}
                      aria-hidden
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
