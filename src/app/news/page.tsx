import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import PageHero from '@/components/ui/PageHero'
import { prisma } from '@/lib/db'
import { imageSrc } from '@/lib/image-url'
import NewsletterSubscribeForm from '@/components/sections/NewsletterSubscribeForm'

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  const newsletters = await prisma.newsletter.findMany({
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <div className="pt-20 bg-neutral-50 dark:bg-neutral-950 min-h-screen flex flex-col">
      <PageHero title="News & Updates" />
      
      <section className="py-12 md:py-16 flex-1">
        <div className="container-custom">
          <NewsletterSubscribeForm />
          
          {newsletters.length === 0 ? (
            <p className="text-center text-neutral-500 py-12">No news items found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsletters.map((item) => {
                const isExternal = !!item.link
                const href = isExternal ? item.link! : `/news/${item.id}`
                
                return (
                  <article key={item.id} className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col transition-transform hover:-translate-y-1">
                    {item.imageUrl && (
                      <div className="relative h-48 w-full bg-neutral-200 dark:bg-neutral-800 shrink-0">
                        <Image
                          src={imageSrc(item.imageUrl)}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                        {new Date(item.publishedAt).toLocaleDateString()}
                      </div>
                      <h3 className="text-lg font-bold text-[#044444] dark:text-[#44AAAA] mb-3 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.content && (
                         <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">
                           {item.content}
                         </p>
                      )}
                      
                      <div className="mt-auto pt-4 flex border-t border-neutral-100 dark:border-neutral-800">
                        {isExternal ? (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#FF0000] font-semibold text-sm hover:underline">
                            Read External Link
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        ) : (
                          <Link href={href} className="inline-flex items-center gap-2 text-[#FF0000] font-semibold text-sm hover:underline">
                            Read More
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
