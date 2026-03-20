'use client'

import React from 'react'
import Link from 'next/link'
import { useInView } from '@/hooks/useInView'

export default function CTA() {
  const visible = useInView('cta-section', { threshold: 0.12 })

  return (
    <section
      id="cta-section"
      className="relative py-12 md:py-16 overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Base background with blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#044444]/70 via-[#033333]/65 to-[#044444]/70 backdrop-blur-lg" />
      
      {/* Dark shadow overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20 backdrop-blur-sm" />
      
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF0000]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF0000]/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#044444]/20 rounded-full blur-xl" />
      </div>

      <div className="container-custom relative z-10">
        <div
          className={`mx-auto max-w-4xl text-center transition-all duration-700 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Decorative accent lines */}
          <div className="flex items-center justify-center gap-3 mb-4 animate-fade-in-up">
            <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-white/30 to-white/40" />
            <div className="h-2 w-2 rounded-full bg-[#FF0000] shadow-lg shadow-[#FF0000]/50 animate-pulse" />
            <div className="h-1 w-1 rounded-full bg-white/60 shadow-md" />
            <div className="h-0.5 w-20 bg-gradient-to-l from-transparent via-white/30 to-white/40" />
          </div>

          {/* Main Heading */}
          <h2 id="cta-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white/90 leading-tight">
            <span className="bg-gradient-to-r from-white/90 via-white/85 to-white/80 bg-clip-text text-transparent drop-shadow-lg">
              Together, We Can Transform
            </span>
            <br />
            <span className="text-[#FF0000]">Public Health in Africa</span>
          </h2>

          {/* Enhanced Description */}
          <p className="text-base md:text-lg text-white/80 mb-6 max-w-2xl mx-auto leading-relaxed">
            Join our mission to build sustainable health systems across Africa. Whether you&apos;re looking to{' '}
            <span className="font-semibold text-white/90">volunteer</span>,{' '}
            <span className="font-semibold text-white/90">partner</span>, or{' '}
            <span className="font-semibold text-white/90">support our programs</span>, your contribution makes a lasting impact.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/opportunities"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF0000] hover:bg-[#E60000] px-8 py-4 text-base font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#FF0000]/50 focus:ring-offset-2 focus:ring-offset-[#044444]"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Explore Opportunities
            </Link>
            <a
              href="https://linktr.ee/Publichealthenafrique"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 px-8 py-4 text-base font-bold text-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#044444]"
            >
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Donate Today
            </a>
          </div>
        </div>
      </div>
      
    </section>
  )
}
