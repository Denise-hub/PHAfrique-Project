import Link from 'next/link'
import Image from 'next/image'
import PageHero from '@/components/ui/PageHero'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 60

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function NewsPage() {
  let items: {
    id: string
    title: string
    description: string | null
    location: string | null
    startDate: Date
    endDate: Date | null
    imageUrl: string | null
    link: string | null
  }[] = []
  try {
    items = await prisma.event.findMany({
      orderBy: { startDate: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        imageUrl: true,
        link: true,
      },
    })
  } catch (e) {
    console.error('[news page] fetch events failed:', e)
  }

  return (
    <div className="pt-20">
      <PageHero title="News">
        <p className="text-neutral-600 dark:text-neutral-400 text-lg mt-2">
          Stay updated with our latest news and updates from the organisation.
        </p>
      </PageHero>
      <section className="container-custom py-10 md:py-14">
        {items.length === 0 ? (
          <p className="text-center text-neutral-500 dark:text-neutral-400 py-12">
            No news items yet. Check back soon for updates.
          </p>
        ) : (
          <ul className="space-y-8 max-w-3xl mx-auto">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <article className="flex flex-col sm:flex-row gap-4 p-4 md:p-5">
                  {item.imageUrl && (
                    <div className="relative w-full sm:w-48 h-40 sm:h-32 shrink-0 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      <Image
                        src={item.imageUrl.startsWith('/') ? item.imageUrl : `/${item.imageUrl}`}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 12rem"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <time
                      className="text-sm text-neutral-500 dark:text-neutral-400"
                      dateTime={new Date(item.startDate).toISOString()}
                    >
                      {formatDate(item.startDate)}
                    </time>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                      {item.link ? (
                        <Link
                          href={item.link}
                          className="hover:text-[#044444] dark:hover:text-[#44AAAA] underline underline-offset-2"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </h2>
                    {item.location && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{item.location}</p>
                    )}
                    {item.description && (
                      <p className="text-neutral-600 dark:text-neutral-300 mt-2 line-clamp-3">{item.description}</p>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
