import Link from 'next/link'
import Image from 'next/image'
import PageHero from '@/components/ui/PageHero'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function GalleryPage() {
  let images: { id: string; url: string; alt: string | null; caption: string | null; category: string }[] = []
  try {
    images = await prisma.image.findMany({
      where: { category: 'gallery' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, url: true, alt: true, caption: true, category: true },
    })
  } catch (e) {
    console.error('[gallery page] fetch images failed:', e)
  }

  return (
    <div className="pt-20">
      <PageHero title="Gallery">
        <p className="text-neutral-600 dark:text-neutral-400 text-lg mt-2">
          Get to see more of our fun moments as a team.
        </p>
      </PageHero>
      <section className="container-custom py-10 md:py-14">
        {images.length === 0 ? (
          <p className="text-center text-neutral-500 dark:text-neutral-400 py-12">
            No images in the gallery yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {images.map((img) => (
              <figure
                key={img.id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-md hover:shadow-lg transition-shadow"
              >
                <Image
                  src={img.url.startsWith('/') ? img.url : `/${img.url}`}
                  alt={img.alt ?? img.caption ?? 'Gallery image'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {(img.caption || img.alt) && (
                  <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white text-sm">
                    {img.caption ?? img.alt ?? ''}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
