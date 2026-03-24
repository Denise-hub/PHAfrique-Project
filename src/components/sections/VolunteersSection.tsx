'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { imageSrc } from '@/lib/image-url'

type Volunteer = {
  id: string
  name: string
  role: string
  imageUrl: string | null
  bio: string | null
  linkedInUrl: string | null
  sortOrder: number
}

function volunteerGroup(role: string): 0 | 1 | 2 {
  const r = role.toLowerCase()
  if (r.includes('advisor') || r.includes('adviser') || r.includes('consultant')) return 0
  if (r.includes('manager')) return 1
  return 2
}

export default function VolunteersSection() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    fetch('/api/participants?type=VOLUNTEER', { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) return []
        const j = await r.json()
        return Array.isArray(j) ? j : []
      })
      .catch(() => [])
      .then((all) => {
        if (cancelled) return
        const list = all
          .map(
            (p: {
              id: string
              name: string
              role: string
              imageUrl: string | null
              bio: string | null
              linkedInUrl: string | null
              sortOrder: number
            }) => ({
              id: p.id,
              name: p.name,
              role: p.role,
              imageUrl: p.imageUrl || null,
              bio: p.bio || null,
              linkedInUrl: p.linkedInUrl || null,
              sortOrder: p.sortOrder ?? 0,
            }),
          )
          .sort((a: Volunteer, b: Volunteer) => {
            const ga = volunteerGroup(a.role)
            const gb = volunteerGroup(b.role)
            if (ga !== gb) return ga - gb
            if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
            return a.name.localeCompare(b.name)
          })
        setVolunteers(list)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <span className="h-8 w-1 rounded-full bg-gradient-to-b from-[#044444] to-[#FF0000]" />
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
              Meet Our Volunteers
            </h2>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base">
            Celebrating the dedicated volunteers who are driving positive change in communities across Africa.
          </p>
        </div>

        {volunteers.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900/40">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              Volunteer profiles will appear here once added through the admin panel.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {[0, 1, 2].map((group) => {
              const grouped = volunteers.filter((v) => volunteerGroup(v.role) === group)
              if (grouped.length === 0) return null

              return (
                <div key={group} className={group === 2 ? 'pt-2' : ''}>
                  <div
                    className={
                      group === 0 && grouped.length === 1
                        ? 'flex justify-center'
                        : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                    }
                  >
                    {grouped.map((volunteer) => (
                      <article
                        key={volunteer.id}
                        className={`group bg-white dark:bg-neutral-900/70 rounded-2xl p-6 shadow-lg border border-neutral-100 dark:border-neutral-700/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-center ${
                          group === 0 && grouped.length === 1 ? 'w-full max-w-sm' : ''
                        }`}
                      >
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 rounded-full overflow-hidden bg-neutral-50 dark:bg-neutral-800 ring-4 ring-[#044444]/10 dark:ring-[#044444]/30 group-hover:ring-[#FF0000]/25 transition-all">
                          {volunteer.imageUrl && !brokenImages[volunteer.id] ? (
                            <Image
                              src={imageSrc(volunteer.imageUrl)}
                              alt={volunteer.name}
                              fill
                              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                              sizes="112px"
                              onError={() =>
                                setBrokenImages((prev) => ({ ...prev, [volunteer.id]: true }))
                              }
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#044444]/20 to-[#FF0000]/10 flex items-center justify-center text-[#044444] dark:text-[#44AAAA] font-bold text-2xl">
                              {volunteer.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-1.5 group-hover:text-[#044444] dark:group-hover:text-[#44AAAA] transition-colors">
                          {volunteer.name}
                        </h3>
                        <p className="text-sm text-[#044444] dark:text-[#44AAAA] font-semibold mb-2">
                          {group === 2 ? 'Volunteer' : volunteer.role}
                        </p>
                        {volunteer.bio && (
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
                            {volunteer.bio}
                          </p>
                        )}
                        {volunteer.linkedInUrl && (
                          <a
                            href={volunteer.linkedInUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center justify-center text-xs font-medium text-[#044444] dark:text-[#44AAAA] hover:underline"
                          >
                            View profile
                          </a>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

