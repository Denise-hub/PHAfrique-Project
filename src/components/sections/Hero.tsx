'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'


const HERO_VIDEO_SRC =
  'https://www.phafrique.com/wp-content/uploads/2024/02/import_61a86844354cd2.22941475-1.mp4'
export default function Hero() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 200)
    return () => clearTimeout(t)
  }, [])

  const scrollToNext = () => {
    const nextSection = document.querySelector('#values-strip')
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
      aria-label="Hero: Public Health en Afrique"
    >
      {/* Background video with subtle white overlay for readability */}
      <div className="absolute inset-0 -z-10">
        <video
          className="h-full w-full object-cover"
          src={HERO_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-white/40" aria-hidden />
      </div>

      {/* Centered content */}
      <div className="container-custom relative z-10 pt-24 pb-16">
        <div
          className={`mx-auto max-w-3xl text-center transition-all duration-700 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black mb-4">
            Public Health en Afrique
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-neutral-900 mb-6">
            We have a passion for Public Health and want to see the improvement of this sector in
            Africa. PHA is active in South Africa, Zimbabwe, eSwatini, and Nigeria.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[#FF0000] px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-105 hover:bg-[#cc0000] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              Contact Us
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/10 px-6 py-3 text-sm sm:text-base font-semibold text-white/90 backdrop-blur-md transition-all duration-200 hover:bg-white/20"
            >
              Learn more about PHA
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full border border-white/40 bg-black/30 p-2.5 text-white shadow-md backdrop-blur-md transition-all hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        aria-label="Scroll to next section"
      >
        <svg
          className="h-5 w-5 animate-bounce"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7-7-7M12 3v18" />
        </svg>
      </button>
    </section>
  )
}