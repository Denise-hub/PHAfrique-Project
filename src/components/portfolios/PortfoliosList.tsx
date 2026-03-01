'use client'

import { useEffect, useState } from 'react'
import PortfolioSection from '@/components/sections/PortfolioSection'
import type { PortfolioItem } from '@/components/sections/PortfolioSection'

/** Fetches portfolios from API (no-store) so admin edits always show. */
export default function PortfoliosList() {
  const [list, setList] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const url = `/api/portfolios?_=${Date.now()}`
    fetch(url, { cache: 'no-store', credentials: 'same-origin', headers: { Pragma: 'no-cache' } })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      })
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setList(
            data.map((p: { id: string; title: string; slug: string; description?: string | null; imageUrl?: string | null; link?: string | null; sortOrder: number; updatedAt?: string }) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              description: p.description ?? null,
              imageUrl: p.imageUrl ?? null,
              link: p.link ?? null,
              sortOrder: p.sortOrder ?? 0,
              updatedAt: p.updatedAt,
            }))
          )
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="section-padding flex justify-center py-16">
        <p className="text-neutral-500">Loading portfolios…</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="section-padding flex justify-center py-16">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }
  return <PortfolioSection portfolios={list} isFullPage showHeading={false} />
}
