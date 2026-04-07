import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import PageHero from '@/components/ui/PageHero'

export const metadata: Metadata = {
  title: 'Kgetsi Ya Tsi Project | Public Health en Afrique',
  description:
    'The Kgetsi Ya Tsi Experience: Breaking the Stigma, One Conversation at a Time — the SOS MENHEMA pilot program.',
}

import HeroImage from '../../../../public/assets/images/programs/SOS MENHEMA - Kgetsi Ya Tsi/IMG_7866.jpg'
import SideImage from '../../../../public/assets/images/programs/SOS MENHEMA - Kgetsi Ya Tsi/PHOTO-2024-03-16-17-53-05(1).jpg'
import GalleryImage1 from '../../../../public/assets/images/programs/SOS MENHEMA - Kgetsi Ya Tsi/PHOTO-2024-03-16-15-33-20.jpg'
import GalleryImage2 from '../../../../public/assets/images/programs/SOS MENHEMA - Kgetsi Ya Tsi/PHOTO-2024-03-16-13-39-54.jpg'
import GalleryImage3 from '../../../../public/assets/images/programs/SOS MENHEMA - Kgetsi Ya Tsi/IMG_1356.jpg'
import GalleryImage4 from '../../../../public/assets/images/programs/SOS MENHEMA - Kgetsi Ya Tsi/PHOTO-2024-03-16-15-33-22.jpg'

const HERO_IMAGE = HeroImage
const SIDE_IMAGE = SideImage

const GALLERY = [
  GalleryImage1,
  GalleryImage2,
  GalleryImage3,
  GalleryImage4,
]

export default function KgetsiYaTsiProjectPage() {
  return (
    <div className="pt-20">
      <PageHero title="Kgetsi Ya Tsi Project" />

      {/* Hero banner */}
      <section className="pt-6 md:pt-8 pb-10 md:pb-14 bg-white dark:bg-neutral-950">
        <div className="container-custom">
          <div className="relative rounded-3xl overflow-hidden h-72 md:h-[420px] shadow-2xl">
            <Image src={HERO_IMAGE} alt="Kgetsi Ya Tsi Project" fill className="object-cover" sizes="100vw" priority placeholder="blur" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" aria-hidden />
          </div>
        </div>
      </section>

      {/* Content with right image (text wraps below) */}
      <section className="pb-14 md:pb-20 bg-neutral-50 dark:bg-neutral-950">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-200/70 dark:border-neutral-800 p-6 sm:p-8 md:p-10">
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 lg:pr-[52%]">
                The Kgetsi Ya Tsi Experience: Breaking the Stigma, One Conversation at a Time
              </h2>

              {/* Floated image on large screens so text continues below it */}
              <div className="mt-6 mb-4 lg:float-right lg:ml-8 lg:mb-6 w-full lg:w-[48%]">
                <div className="rounded-3xl overflow-hidden shadow-lg border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <div className="relative h-64 sm:h-72 md:h-80 lg:h-96">
                    <Image
                      src={SIDE_IMAGE}
                      alt="Kgetsi Ya Tsi Project"
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 48vw"
                      placeholder="blur"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-snug sm:leading-relaxed text-justify">
                <p>
                  From November 2023 to March 2024, PHA teamed up with Kgetsi Ya Tsie Secondary School to launch our
                  pilot SOS MENHEMA program, our way of saying, “periods are normal, and it’s time we treat them that
                  way!”
                </p>

                <p>So, what was it all about?</p>

                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Our goal was to:</p>

                <p>Shine a light on menstrual hygiene, mental health, and reproductive health.</p>
                <p>Empower teachers and community leaders to better support girls during their periods.</p>
                <p>Provide reusable menstrual products, because sustainability matters.</p>
                <p>Promote eco-friendly period choices that are kind to both people and the planet.</p>

                <p className="font-extrabold text-[#044444] dark:text-[#44AAAA]">What We Did:</p>

                <p>
                  Through focus groups and workshops, we brought together girls and boys aged 14–16 to chat about
                  periods.
                </p>

                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Together, we explored topics like:</p>

                <p>Breaking stigma around menstruation.</p>
                <p>Improving access to products.</p>
                <p>Understanding the environmental impact of menstrual waste.</p>
                <p>Linking menstrual health with mental well-being.</p>

                <p>
                  We also handed out reusable pads and ran practical sessions on how to use and care for them. But
                  most importantly, we created a safe space for open, honest conversations with students, teachers,
                  and even families, helping to make periods less taboo and more understood.
                </p>

                <p className="font-extrabold text-[#044444] dark:text-[#44AAAA]">What Worked Well:</p>

                <p>
                  Taking a holistic approach that connects menstrual health, mental health, and the environment.
                </p>
                <p>Building strong partnerships with schools, volunteers, and the local community.</p>
                <p>Watching young people step up as peer educators and advocates for change.</p>

                <p>
                  The SOS MENHEMA pilot was just the beginning! PHA continues to build on this momentum by expanding
                  the program to reach more schools and communities, ensuring every girl has the confidence,
                  knowledge, and resources to manage her period with pride.
                </p>
              </div>

              <div className="clear-both" />
            </div>

            {/* Gallery */}
            <div className="mt-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {GALLERY.map((src, index) => (
                  <div
                    key={index}
                    className="relative rounded-2xl overflow-hidden shadow-lg border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                  >
                    <div className="relative h-56 sm:h-52 lg:h-48">
                      <Image
                        src={src}
                        alt="Kgetsi Ya Tsi Project"
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

