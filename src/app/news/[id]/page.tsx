import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { imageSrc } from '@/lib/image-url'

export const dynamic = 'force-dynamic'

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const newsletter = await prisma.newsletter.findUnique({
    where: { id: params.id },
  })

  if (!newsletter) {
    notFound()
  }

  // If this item was saved with a link but someone accesses the detail view directly, redirect them.
  if (newsletter.link) {
    redirect(newsletter.link)
  }

  return (
    <div className="pt-20 bg-white dark:bg-neutral-950 min-h-screen">
      {/* Article Header */}
      <div className="container-custom py-12 md:py-16">
        <Link href="/news" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-[#044444] transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to News
        </Link>
        <div className="max-w-3xl mx-auto">
          <div className="text-sm font-semibold text-[#FF0000] tracking-wider uppercase mb-3">
            {new Date(newsletter.publishedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-6 leading-tight">
            {newsletter.title}
          </h1>
        </div>
      </div>

      {/* Featured Image */}
      {newsletter.imageUrl && (
        <div className="container-custom pb-12">
          <div className="relative w-full max-w-4xl mx-auto h-[300px] md:h-[500px] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-neutral-100 dark:border-neutral-800">
            <Image
              src={imageSrc(newsletter.imageUrl)}
              alt={newsletter.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="container-custom pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
            {newsletter.content?.split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
