import React from 'react'

export type PageHeroProps = {
  /** Main title (first line). */
  title: string
  /** Optional second line (e.g. "Africa" under "About Public Health Corps"). */
  titleLine2?: string
  /** Optional subtitle/card content below the title. */
  children?: React.ReactNode
  /** Optional extra class for the section. */
  className?: string
}

/**
 * Unified page hero: decorative lines + two-toned circles, bold gradient title (one or two lines).
 * Use on About, Portfolios, Programs, Opportunities, Contact for consistent heading design.
 */
export default function PageHero({ title, titleLine2, children, className = '' }: PageHeroProps) {
  return (
    <section
      className={`relative bg-gradient-to-br from-[#044444]/10 via-[#FF0000]/6 to-[#044444]/14 dark:from-[#044444]/18 dark:via-[#FF0000]/8 dark:to-[#044444]/22 overflow-hidden ${className}`}
      aria-labelledby="page-hero-title"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#044444]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF0000]/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 right-1/3 w-36 h-36 bg-[#044444]/6 rounded-full blur-xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="py-10 md:py-12">
          <div className="max-w-3xl mx-auto text-center">
            {/* Decorative accent: left teal, right red (two-toned) */}
            <div className="flex items-center justify-center gap-3 mb-5 animate-fade-in-up">
              <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-[#044444] to-[#044444]" aria-hidden />
              <div className="h-2 w-2 rounded-full bg-[#044444] shadow-lg shadow-[#044444]/50 animate-pulse" aria-hidden />
              <div className="h-1 w-1 rounded-full bg-[#FF0000] shadow-md shadow-[#FF0000]/50" aria-hidden />
              <div className="h-0.5 w-20 bg-gradient-to-l from-transparent via-[#FF0000] to-[#044444]" aria-hidden />
            </div>

            <h1
              id="page-hero-title"
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="bg-gradient-to-r from-[#FF0000] via-[#044444] to-[#FF0000] bg-[length:200%_auto] bg-clip-text text-transparent drop-shadow-sm animate-[gradient_3s_ease_infinite]">
                {title}
                {titleLine2 != null && titleLine2 !== '' && (
                  <>
                    <br />
                    {titleLine2}
                  </>
                )}
              </span>
            </h1>

            {children && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
