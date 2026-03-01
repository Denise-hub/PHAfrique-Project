import PortfoliosList from '@/components/portfolios/PortfoliosList'
import PageHero from '@/components/ui/PageHero'

export const revalidate = 60

export default function PortfoliosPage() {
  return (
    <div className="pt-20">
      <PageHero title="Our Portfolios" />
      <PortfoliosList />
    </div>
  )
}
