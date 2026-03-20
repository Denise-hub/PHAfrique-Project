'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const SLIDES = [
  '/assets/images/programs/SOS MENHEMA - Kgetsi Ya Tsi/IMG_7866.jpg',
  '/assets/images/programs/SOS MENHEMA - Kgetsi Ya Tsi/PHOTO-2024-03-16-14-01-40.jpg',
]

export default function SustainableHealthcareSection() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length)
    }, 3800)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-neutral-950">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-neutral-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-black">
            <div className="p-7 sm:p-8 md:p-10 lg:p-12 text-white">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.05] tracking-tight mb-5">
                Sustainable Healthcare Solutions For All Africans
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-white/88 leading-relaxed max-w-xl">
                PHA&apos;s aim is to tackle health care issues that affect our population, starting from period poverty.
                Our solutions aim to be sustainable, affordable and accessible to all. Our goal is to establish an
                ecosystem where access to health services for all Africans is at their reach irrespective of location,
                language, gender and race.
              </p>
            </div>

            <div className="relative p-5 sm:p-6 md:p-8">
              <div className="relative h-[280px] sm:h-[320px] md:h-[360px] rounded-3xl overflow-hidden ring-1 ring-white/15">
                {SLIDES.map((src, i) => (
                  <div
                    key={src}
                    className={`absolute inset-0 transition-opacity duration-700 ${index === i ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <Image
                      src={src}
                      alt="PHA project activities"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {SLIDES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === i ? 'w-6 bg-white' : 'w-2 bg-white/45'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
