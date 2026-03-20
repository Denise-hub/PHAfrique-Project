import PortfoliosList from '@/components/portfolios/PortfoliosList'
import PageHero from '@/components/ui/PageHero'
import Image from 'next/image'

export const revalidate = 60

export default function PortfoliosPage() {
  return (
    <div className="pt-20">
      <PageHero title="Our Portfolios">
        <p className="mt-2 text-base md:text-lg text-neutral-700 dark:text-neutral-200 max-w-3xl mx-auto">
          The program is divided into four key areas that will be piloted in South Africa and then branched out to
          the African region.
        </p>
      </PageHero>
      <PortfoliosList />

      <section className="pb-16 md:pb-24 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-[#044444]/20 dark:border-[#044444]/35">
            <div className="relative bg-gradient-to-br from-[#044444] via-[#033A3A] to-[#044444] p-6 sm:p-8 md:p-10">
              <div className="absolute -top-16 -right-10 w-52 h-52 rounded-full bg-[#FF0000]/15 blur-3xl" aria-hidden />
              <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-white/10 blur-3xl" aria-hidden />

              <div className="relative z-10 text-center mb-8 md:mb-10">
                <div className="inline-flex items-center gap-3 mb-3">
                  <span className="h-0.5 w-12 bg-[#FF0000]" />
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    Funding, Community Impact & Growth
                  </h2>
                  <span className="h-0.5 w-12 bg-[#FF0000]" />
                </div>
                <p className="text-white/85 text-sm md:text-base max-w-3xl mx-auto">
                  Strategic priorities that enable Public Health en Afrique to deliver sustainable impact across
                  communities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                <article className="rounded-2xl bg-white/95 dark:bg-neutral-900/90 p-5 md:p-6 shadow-xl ring-1 ring-white/20">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#044444]/10 text-[#044444] dark:text-[#44AAAA]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 1.12-3 2.5S10.343 13 12 13s3 1.12 3 2.5S13.657 18 12 18m0-10V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#044444] dark:text-[#44AAAA] mb-2">Funding and Grants</h3>
                  <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-200 leading-relaxed">
                    Public Health en Afrique will require funding to perform its projects and cover the organisation&apos;s
                    operational costs. The project will use media advertising, including radio and television
                    advertising, to spread the word and gather sponsors.
                  </p>
                </article>

                <article className="rounded-2xl bg-white/95 dark:bg-neutral-900/90 p-5 md:p-6 shadow-xl ring-1 ring-white/20">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#044444]/10 text-[#044444] dark:text-[#44AAAA]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5V4H2v16h5m10 0v-5a3 3 0 10-6 0v5m6 0H7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#044444] dark:text-[#44AAAA] mb-2">Work with Communities and Women</h3>
                  <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-200 leading-relaxed">
                    By involving local communities in decision-making processes and working in partnership with
                    community leaders and organisations to address any barriers that may be identified. This process
                    will enable the community to increase control over their health and wellness practices.
                  </p>
                </article>

                <article className="rounded-2xl bg-white/95 dark:bg-neutral-900/90 p-5 md:p-6 shadow-xl ring-1 ring-white/20">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#044444]/10 text-[#044444] dark:text-[#44AAAA]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h8m-8 4h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#044444] dark:text-[#44AAAA] mb-2">Strengthen PHA&apos;s Reputation</h3>
                  <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-200 leading-relaxed">
                    This will be done by building Public Health en Afrique&apos;s social media process sites (included but
                    not limited to): Instagram, Facebook, LinkedIn, Twitter, and the Public Health en Afrique&apos;s
                    organisational website.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24 bg-white dark:bg-neutral-950">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <div className="inline-flex items-center gap-3 mb-3">
                <span className="h-0.5 w-12 bg-[#044444]" />
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#044444] dark:text-[#44AAAA]">
                  Audience, Communication & Skills
                </h2>
                <span className="h-0.5 w-12 bg-[#FF0000]" />
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              <article className="rounded-3xl overflow-hidden border border-[#044444]/15 bg-gradient-to-br from-[#044444]/5 via-white to-[#FF0000]/5 dark:from-[#044444]/20 dark:via-neutral-900 dark:to-[#FF0000]/10 shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative min-h-[260px] md:min-h-[320px]">
                    <Image
                      src="/assets/images/programs/2.jpg"
                      alt="Target audience"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-extrabold text-[#044444] dark:text-[#44AAAA] mb-4">Target Audience</h3>
                    <div className="space-y-4 text-neutral-700 dark:text-neutral-200 leading-relaxed">
                      <p className="text-sm md:text-base">
                        <span className="font-bold text-[#044444] dark:text-[#44AAAA]">Primary Target Audience:</span>{' '}
                        Women, girls, secondary school students, and pregnant women.
                      </p>
                      <p className="text-sm md:text-base">
                        <span className="font-bold text-[#044444] dark:text-[#44AAAA]">Secondary Target Audience:</span>{' '}
                        Public Health students and recent graduates, universities, community leaders, boys, and men.
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              <article className="rounded-3xl overflow-hidden border border-[#044444]/15 bg-gradient-to-br from-[#044444]/5 via-white to-[#FF0000]/5 dark:from-[#044444]/20 dark:via-neutral-900 dark:to-[#FF0000]/10 shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="order-1 lg:order-2 relative min-h-[260px] md:min-h-[320px]">
                    <Image
                      src="/assets/images/portfolios/2.jpg"
                      alt="Communication and engagement"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  <div className="order-2 lg:order-1 p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-extrabold text-[#044444] dark:text-[#44AAAA] mb-4">Communication</h3>
                    <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-200 leading-relaxed">
                      Public Health en Afrique ensures that everyone has access to health-related information and stays
                      up to date with current health discussions. This is achieved through community engagement on
                      social media platforms - Instagram, Facebook, Twitter, and LinkedIn - as well as through
                      organizing health workshops and publishing an end-of-year journal accessible to all.
                    </p>
                  </div>
                </div>
              </article>

              <article className="rounded-3xl overflow-hidden border border-[#044444]/15 bg-gradient-to-br from-[#044444]/5 via-white to-[#FF0000]/5 dark:from-[#044444]/20 dark:via-neutral-900 dark:to-[#FF0000]/10 shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative min-h-[260px] md:min-h-[320px]">
                    <Image
                      src="/assets/images/programs/capacity-building.jpg"
                      alt="Skills development and learnership"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-extrabold text-[#044444] dark:text-[#44AAAA] mb-4">Skills Development &amp; Learnership</h3>
                    <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-200 leading-relaxed">
                      Public Health en Afrique provides opportunities for young Public Health professionals to give back
                      to their communities while applying and developing their skills. Activities include assisting with
                      community outreach, creating educational materials, and conducting research and data analysis.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24 bg-white dark:bg-neutral-950">
        <div className="container-custom">
          <div className="relative rounded-3xl overflow-hidden h-64 md:h-72 lg:h-80 shadow-xl max-w-6xl mx-auto">
            <Image
              src="/assets/images/portfolios/volunteer.jpg"
              alt="Would you like to volunteer"
              fill
              className="object-cover object-top"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/45 to-black/55" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Would You Like To Volunteer?</h2>
                <p className="text-white/90 text-sm md:text-base mb-6">
                  Please send your CV and reason for applying by contacting us today
                </p>
                <a
                  href="/opportunities#volunteering-section"
                  className="inline-flex items-center justify-center rounded-full bg-white text-neutral-900 hover:bg-neutral-100 px-8 py-3 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Apply
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
