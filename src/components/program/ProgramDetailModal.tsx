'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export type ProgramForModal = {
  id: string
  title: string
  slug: string
  description: string | null
  imageUrl: string | null
  /** Optional regions for "Target Regions" pills; if empty, shows "All Regions". */
  regions?: string[]
}

const PLACEHOLDER_IMAGE = '/assets/images/portfolios/UPDATED-MATERNAL-WHITE-BG-2048x2048.jpg'

type Props = {
  program: ProgramForModal
  onClose: () => void
  /** When false, hides the "View all programs" footer (e.g. when modal is opened from /programs). Default true. */
  showViewAllLink?: boolean
}

export default function ProgramDetailModal({ program, onClose, showViewAllLink = true }: Props) {
  const imageUrl = program.imageUrl ?? PLACEHOLDER_IMAGE
  const regions = program.regions && program.regions.length > 0 ? program.regions : ['All Regions']

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="program-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 id="program-modal-title" className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 pr-10">
            {program.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#044444]"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Program image: same as card for visual continuity */}
        <div className="relative w-full h-40 sm:h-48 flex-shrink-0 overflow-hidden bg-neutral-200 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <Image
            src={imageUrl}
            alt={program.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF0000]" aria-hidden />
        </div>

        {/* Content: existing text structure */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              {program.title}
            </h3>
            <p className="text-[#FF0000] font-semibold text-sm mb-4">
              Program overview
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
              {program.description || 'No description available.'}
            </p>

            {/* Target Regions */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                <svg className="h-4 w-4 text-[#FF0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Target Regions
              </span>
              <div className="flex flex-wrap gap-2">
                {regions.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center rounded-full border border-[#FF0000] bg-white dark:bg-neutral-800 px-3 py-1 text-xs font-medium text-[#FF0000]"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showViewAllLink && (
          <div className="shrink-0 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 rounded-b-2xl">
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#044444] dark:text-[#44AAAA] hover:underline"
            >
              View all programs
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
