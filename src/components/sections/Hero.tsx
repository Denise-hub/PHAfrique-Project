'use client'

import React, { memo, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const HERO_IMAGE = '/assets/images/programs/hero.jpeg'
const HERO_FALLBACK = '/assets/images/about/Better-quality-l-1024x768-1.jpeg'

const PHRASES = [
  'where every community can thrive',
  'by advancing public health in Africa',
  'by strengthening health systems',
]

const TYPING_MS = 70
const HOLD_MS = 2400

/** Static heading: white text, red underline, larger than animated. Memoized so it does not re-render during typing. */
const StaticHeading = memo(function StaticHeading() {
  return (
    <span className="shrink-0 font-poppins text-lg font-bold sm:text-xl md:text-2xl text-white underline decoration-2 decoration-[#FF0000] underline-offset-3">
      Welcome to PHAfrique
    </span>
  )
})

export default function Hero() {
  const [loaded, setLoaded] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'hold'>('typing')
  const [heroSrc, setHeroSrc] = useState(HERO_IMAGE)
  const [scrollY, setScrollY] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const phrase = PHRASES[phraseIndex]
  const visible = phrase.slice(0, charIndex)

  // Typing state machine: type current phrase, hold, then advance. Only the animated phrase changes; static "Welcome to PHAfrique" is memoized and never re-renders during typing.
  useEffect(() => {
    if (phase === 'typing') {
      if (charIndex >= phrase.length) {
        setPhase('hold')
        return
      }
      timeoutRef.current = setTimeout(() => setCharIndex((c) => c + 1), TYPING_MS)
      return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
    }
    if (phase === 'hold') {
      timeoutRef.current = setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % PHRASES.length)
        setCharIndex(0)
        setPhase('typing')
      }, HOLD_MS)
      return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
    }
  }, [phase, charIndex, phrase.length])

  useEffect(() => {
    const onScroll = () => setScrollY(typeof window !== 'undefined' ? window.scrollY : 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const parallaxY = Math.min(scrollY * 0.25, 100)

  const scrollToNext = () => {
    const nextSection = document.querySelector('#values-strip')
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section
      className="relative min-h-[100dvh] min-h-[100vh] flex items-center justify-center overflow-hidden"
      aria-label="Hero: Welcome to PHAfrique"
    >
      <div
        className="absolute inset-0"
        style={{ transform: `translate3d(0, ${parallaxY * 0.5}px, 0)` }}
      >
        {/* Base dark background to reduce white */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#044444] via-[#033333] to-[#022222] dark:from-[#022222] dark:via-[#033333] dark:to-[#044444]" aria-hidden />
        
        {/* Image with reduced brightness and enhanced contrast */}
        <div className="absolute inset-0" style={{ filter: 'brightness(0.68) contrast(1.1) saturate(1.2)' }}>
        <Image
          src={heroSrc}
          alt="Public Health Corps Africa — advancing health across the continent"
          fill
          priority
          sizes="100vw"
          className="object-cover animate-hero-zoom"
          quality={90}
          onError={() => setHeroSrc(HERO_FALLBACK)}
          onLoad={() => setLoaded(true)}
        />
        </div>
        
        {/* Multi-layer overlay to reduce white and add depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#044444]/60 via-[#044444]/40 to-[#044444]/70 dark:from-[#044444]/70 dark:via-[#044444]/50 dark:to-[#044444]/80" aria-hidden />
        
        {/* Additional gradient overlay for smoother blending */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#022222]/30 via-transparent to-[#044444]/20" aria-hidden />
        
        {/* Subtle vignette effect to darken edges */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#000000]/12" style={{ background: 'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0,0,0,0.12) 100%)' }} aria-hidden />
      </div>


      {/* Floating elements — MediTrust/Denmoda-style depth and engagement */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <span className="absolute top-[16%] left-[10%] w-3 h-3 rounded-full bg-[#044444]/50 animate-float" style={{ animationDelay: '0s' }} />
        <span className="absolute top-[22%] right-[12%] w-2.5 h-2.5 rounded-full bg-[#FF0000]/45 animate-float-slow" style={{ animationDelay: '1s' }} />
        <span className="absolute bottom-[35%] left-[6%] w-2 h-2 rounded-full bg-white/35 animate-float" style={{ animationDelay: '2.2s' }} />
        <span className="absolute top-[52%] right-[8%] w-4 h-4 rounded-full bg-[#044444]/35 animate-float-slow" style={{ animationDelay: '0.5s' }} />
        <span className="absolute bottom-[20%] right-[18%] w-2.5 h-2.5 rounded-full bg-[#FF0000]/40 animate-float" style={{ animationDelay: '1.6s' }} />
        <span className="absolute top-[40%] left-[15%] w-1.5 h-1.5 rounded-full bg-white/25 animate-float-slow" style={{ animationDelay: '2.8s' }} />
      </div>

      <div className="container-custom relative z-10 pt-24">
        <div
          className={`mx-auto max-w-4xl transition-all duration-700 ease-out ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: loaded ? '0ms' : '0ms' }}
        >
          {/* Glass card: blue-tinted glass effect with blur — left-aligned, no resize or reflow from typing */}
          <div className="mx-auto w-full max-w-[48rem] min-h-[200px] sm:min-h-[220px] md:min-h-[240px] rounded-xl sm:rounded-2xl md:rounded-3xl bg-[#044444]/32 backdrop-blur-xl border border-[#044444]/20 shadow-[0_4px_20px_rgba(4,68,68,0.15)] px-4 py-4 sm:px-6 sm:py-5 md:px-10 md:py-7 text-left transition-all duration-300 hover:bg-[#044444]/42 hover:border-[#044444]/30 hover:shadow-[0_6px_24px_rgba(4,68,68,0.25)] flex flex-col items-start justify-center">
            <div
              className={`w-full transition-all duration-600 ease-out ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
              style={{ transitionDelay: loaded ? '120ms' : '0ms' }}
            >
              <h1 className="font-poppins font-semibold tracking-tight flex flex-row flex-wrap sm:flex-nowrap items-baseline gap-x-1.5 sm:gap-x-2" aria-live="polite" aria-atomic="false">
                <StaticHeading />
                <span className="inline-block min-w-[20ch] sm:min-w-[24ch] text-sm sm:text-base md:text-lg text-[#FF0000]">
                  {visible}
                  <span className="animate-blink text-[#FF0000]" aria-hidden>|</span>
                </span>
              </h1>
            </div>
            <p
              className={`mt-5 text-sm sm:text-base font-poppins font-semibold text-white/90 max-w-md leading-relaxed transition-all duration-600 ease-out self-center text-center ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
              style={{ transitionDelay: loaded ? '280ms' : '0ms' }}
            >
              Actively working in South Africa, Zimbabwe, Eswatini, and Nigeria.
            </p>
            <Link href="/contact" className="mt-4 self-center inline-flex items-center justify-center rounded-lg bg-[#FF0000] px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#CC0000] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:ring-offset-2 active:scale-[0.98]">
              Join Our Mission
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator — clickable, smooth scroll to next section */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full p-2.5 ring-2 ring-[#044444]/30 bg-white/80 backdrop-blur-sm animate-pulse-glow hover:ring-[#044444]/50 hover:bg-white/90 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#044444]/50"
        aria-label="Scroll to next section"
      >
        <svg className="h-6 w-6 text-[#044444] animate-bounce" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </section>
  )
}
