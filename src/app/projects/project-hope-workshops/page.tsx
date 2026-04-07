import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import PageHero from '@/components/ui/PageHero'

export const metadata: Metadata = {
  title: 'Project Hope Workshops | Public Health en Afrique',
  description:
    'SOS MENHEMA × Project Hope UK: hands-on program focused on menstrual health, environmental awareness, and empowerment for young people in South Africa.',
}

import HeroImage from '../../../../public/assets/images/programs/SOS MENHEMA - Project Hope/IMG_5888.jpeg'
import SideImage from '../../../../public/assets/images/programs/SOS MENHEMA - Project Hope/1.jpg'
import ExtraImage1 from '../../../../public/assets/images/programs/SOS MENHEMA - Project Hope/Untitled design (2).png'
import ExtraImage2 from '../../../../public/assets/images/programs/SOS MENHEMA - Project Hope/Untitled design.png'
import ExtraImage3 from '../../../../public/assets/images/programs/SOS MENHEMA - Project Hope/IMG_5904.jpeg'
import ExtraImage4 from '../../../../public/assets/images/programs/SOS MENHEMA - Project Hope/IMG_5851.jpeg'

const HERO_IMAGE = HeroImage
const SIDE_IMAGE = SideImage

const EXTRA_IMAGES = [
  ExtraImage1,
  ExtraImage2,
  ExtraImage3,
  ExtraImage4,
]

export default function ProjectHopeWorkshopsPage() {
  return (
    <div className="pt-20">
      <PageHero title="Project Hope Workshops" />

      {/* Hero banner (same structure polish as project pages) */}
      <section className="pt-6 md:pt-8 pb-10 md:pb-14 bg-white dark:bg-neutral-950">
        <div className="container-custom">
          <div className="relative rounded-3xl overflow-hidden h-72 md:h-[420px] shadow-2xl">
            <Image src={HERO_IMAGE} alt="Project Hope Workshops" fill className="object-cover" sizes="100vw" priority placeholder="blur" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" aria-hidden />
            <div className="absolute inset-0 flex items-end">
              <div className="p-6 md:p-10 max-w-3xl">
                <div className="inline-flex items-center gap-3 mb-3">
                  <div className="h-0.5 w-12 bg-white/70" aria-hidden />
                  <p className="text-white/90 text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase">
                    Project
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
                  SOS MENHEMA × Project Hope UK
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content + side image */}
      <section className="pb-14 md:pb-20 bg-neutral-50 dark:bg-neutral-950">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
              <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-200/70 dark:border-neutral-800 p-6 sm:p-8 md:p-10">
                <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
                  SOS MENHEMA × Project Hope UK
                </h2>
                <div className="mt-4 space-y-4 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  <p>
                    Since September 2024, our team partnered with Project Hope UK to deliver a hands-on program focused
                    on menstrual health, environmental awareness, and empowerment for young people in South Africa.
                  </p>
                  <p>
                    With the help of Project Hope UK, we regularly host focus groups and workshops with young people
                    aged 11–19, bringing together both girls and boys to talk openly about menstruation. We make the
                    sessions fun and inclusive by using games, discussions, and relatable examples to get everyone
                    involved.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden shadow-xl border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="relative h-72 sm:h-80 lg:h-full min-h-[320px]">
                  <Image
                    src={SIDE_IMAGE}
                    alt="Project Hope Workshops"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    placeholder="blur"
                  />
                </div>
              </div>
            </div>

            {/* Second section with exact content */}
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
              <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-200/70 dark:border-neutral-800 p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
                  In a session, we typically cover:
                </h3>
                <ul className="mt-4 space-y-2 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed list-disc pl-5">
                  <li>Common myths and cultural taboos.</li>
                  <li>How menstrual health affects school, confidence, and well-being.</li>
                  <li>The environmental impact of disposable products.</li>
                  <li>
                    How to use and care for reusable pads (we distributed 50 re-usable pads to participants!).
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-200/70 dark:border-neutral-800 p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
                  Our Goals:
                </h3>
                <ul className="mt-4 space-y-2 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed list-disc pl-5">
                  <li>Educate students and communities about menstrual health and break the stigma.</li>
                  <li>Empower girls with reusable, eco-friendly menstrual products.</li>
                  <li>Build confidence and encourage open, positive conversations about menstruation.</li>
                  <li>Engage schools and community leaders to make change sustainable.</li>
                  <li>Raise awareness about how period choices impact our planet.</li>
                </ul>
              </div>
            </div>

            <div className="mt-10 rounded-3xl bg-gradient-to-r from-[#044444] to-[#033333] text-white px-6 py-8 md:px-10 md:py-10 shadow-2xl">
              <p className="text-sm sm:text-base font-semibold leading-relaxed text-white/95">
                A continent where every girl can manage her period with pride, safety, and dignity and where boys,
                teachers, and families are part of the conversation.
              </p>
            </div>

            {/* Extra images gallery */}
            <div className="mt-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {EXTRA_IMAGES.map((src, index) => (
                  <div
                    key={index}
                    className="relative rounded-2xl overflow-hidden shadow-lg border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                  >
                    <div className="relative h-56 sm:h-52 lg:h-48">
                      <Image
                        src={src}
                        alt="Project Hope Workshops"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        placeholder="blur"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

