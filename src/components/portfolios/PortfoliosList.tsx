'use client'

import PortfolioSection from '@/components/sections/PortfolioSection'
import type { PortfolioItem } from '@/components/sections/PortfolioSection'

const PORTFOLIOS: PortfolioItem[] = [
  {
    id: 'maternal-and-child',
    slug: 'maternal-and-child',
    title: 'Maternal and Child',
    description: 'Every mother and child is physically and mentally healthy',
    imageUrl: '/assets/images/portfolios/1771339283808-jo85fyxstl.jpg',
    link: null,
    sortOrder: 1,
  },
  {
    id: 'mental-health',
    slug: 'mental-health',
    title: 'Mental Health',
    description: 'Every African has access to mental health support',
    imageUrl: '/assets/images/portfolios/1771334752131-xar1q9gvj5f.jpg',
    link: null,
    sortOrder: 2,
  },
  {
    id: 'environmental-health',
    slug: 'environmental-health',
    title: 'Environmental Health',
    description: 'Every African lives in a safe, clean environment',
    imageUrl: '/assets/images/portfolios/1771334737809-jeg05v46dy.jpg',
    link: null,
    sortOrder: 3,
  },
  {
    id: 'ethics',
    slug: 'ethics',
    title: 'Ethics',
    description: 'Every African has equitable access to healthcare',
    imageUrl: '/assets/images/portfolios/1771334830242-wnwrdpnnpll.jpg',
    link: null,
    sortOrder: 4,
  },
]

export default function PortfoliosList() {
  return <PortfolioSection portfolios={PORTFOLIOS} isFullPage showHeading={false} hideActions fullImageCards />
}
