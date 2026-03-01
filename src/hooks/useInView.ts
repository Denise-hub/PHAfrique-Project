'use client'

import { useEffect, useState } from 'react'

/**
 * Returns true when the element with `id` has entered the viewport.
 * Used for scroll-triggered entrance animations (MediTrust/Denmoda-style).
 */
export function useInView(id: string, options?: { threshold?: number; rootMargin?: string }) {
  const [visible, setVisible] = useState(false)
  const threshold = options?.threshold ?? 0.15
  const rootMargin = options?.rootMargin ?? '0px'

  useEffect(() => {
    const el = document.getElementById(id)
    if (!el) return
    const ob = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold, rootMargin }
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [id, threshold, rootMargin])

  return visible
}
