import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import PageHero from '@/components/ui/PageHero'

export const metadata: Metadata = {
  title: 'SOS MENHEMA | Public Health en Afrique',
  description:
    'SOS MENHEMA is a grassroots project designed to address period poverty and menstrual stigma in underserved African communities.',
}

const HERO_IMAGE = '/assets/images/programs/SOS MENHEMA page/IMG_20251011_141015.jpg'
const EXTRA_IMAGE_1 = '/assets/images/programs/SOS MENHEMA page/IMG_20251011_125603.jpg'
const EXTRA_IMAGE_2 = '/assets/images/programs/SOS MENHEMA page/IMG_7265.jpg'

const WORKSHOP_PDF =
  'https://www.phafrique.com/wp-content/uploads/2025/12/SOS-Menhema-October-workshop-flyers.pdf'
const INFOGRAPHIC_PDF = 'https://www.phafrique.com/wp-content/uploads/2025/12/A2-Format-Infographic-SOS-M.pdf'

export default function SosMenhemaPage() {
  return (
    <div className="pt-20">
      <PageHero title="SOS MENHEMA" />

      {/* Hero banner (same structure polish as Opportunities page) */}
      <section className="pt-6 md:pt-8 pb-10 md:pb-14 bg-white dark:bg-neutral-950">
        <div className="container-custom">
          <div className="relative rounded-3xl overflow-hidden h-72 md:h-[420px] shadow-2xl">
            <Image src={HERO_IMAGE} alt="SOS MENHEMA" fill className="object-cover" sizes="100vw" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" aria-hidden />
            <div className="absolute inset-0 flex items-end">
              <div className="p-6 md:p-10 max-w-3xl">
                <div className="inline-flex items-center gap-3 mb-3">
                  <div className="h-0.5 w-12 bg-white/70" aria-hidden />
                  <p className="text-white/90 text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase">
                    Project
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
                  SOS MENHEMA
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-14 md:pb-20 bg-neutral-50 dark:bg-neutral-950">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-200/70 dark:border-neutral-800 p-6 sm:p-8 md:p-10">
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
                Supporting Menstrual Health Across Africa
              </h2>
              <div className="mt-4 space-y-4 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                <p>
                  At PHA, we believe that menstrual health is not just a hygiene issue, it’s a human right. That’s why
                  we launched SOS MENHEMA, a grassroots project designed to address period poverty and menstrual stigma
                  in underserved African communities.
                </p>
                <p>
                  The name SOS MENHEMA says it all: “SOS” signals urgency, and “Menhema” is short for menstrual hygiene
                  management. Together, they reflect our mission to respond to the menstrual health crisis with empathy,
                  education, and action.
                </p>
              </div>

              <div className="mt-10">
                <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
                  Supporting Menstrual Health Across Africa
                </h2>
                <div className="mt-4 space-y-4 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  <p>
                    Across Africa, many school-aged girls still miss school during their periods due to stigma, lack of
                    menstrual products, and poor sanitation facilities. More than 10% of girls are unable to attend
                    classes while menstruating, with even higher rates in rural areas. This not only impacts education
                    but also self-esteem and overall wellbeing.
                  </p>
                  <p>
                    We recognised that menstrual health can’t be addressed in isolation, it connects to mental health,
                    environmental health, ethics, and maternal &amp; child health, the four core pillars of PHA. So, we
                    designed SOS MENHEMA as a holistic program that combines education, access to reusable products, and
                    environmental awareness.
                  </p>
                </div>
              </div>
            </div>

            {/* Extra images layout */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="relative h-64 sm:h-72 md:h-[340px]">
                  <Image
                    src={EXTRA_IMAGE_1}
                    alt="SOS MENHEMA"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="relative h-64 sm:h-72 md:h-[340px]">
                  <Image
                    src={EXTRA_IMAGE_2}
                    alt="SOS MENHEMA"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>

            {/* Reference-like engaging red layout */}
            <div className="mt-10 rounded-3xl bg-[#E6003A] text-white px-6 py-8 md:px-10 md:py-10 shadow-2xl">
              <h3 className="text-sm font-semibold tracking-wide text-white/90">Looking Ahead</h3>
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-white/90">
                SOS MENHEMA proves that when you empower girls with knowledge, confidence, and sustainable products, you
                transform not just their health, but their futures too! Looking ahead, PHA aims to expand SOS MENHEMA to
                more communities across Africa, continue empowering young leaders, and build local capacity for lasting
                change. Together, we can end period poverty and put Africa first, one conversation, one community, one
                pad at a time. Email info@phafrique.com if you would like to be involved in this initiative!
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={WORKSHOP_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-black text-white font-semibold px-6 py-4 text-sm shadow-lg hover:shadow-xl transition-shadow"
                >
                  SOS Menhema October workshop
                </a>
                <a
                  href={INFOGRAPHIC_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-black text-white font-semibold px-6 py-4 text-sm shadow-lg hover:shadow-xl transition-shadow"
                >
                  Infographic SOS menhema
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

