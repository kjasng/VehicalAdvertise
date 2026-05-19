import { MarketingFooter } from '@/components/public/marketing-footer'
import { MarketingHeader } from '@/components/public/marketing-header'

export function MarketingShell({
  active,
  children,
}: {
  active: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white text-black">
      <MarketingHeader active={active} />
      {children}
      <MarketingFooter />
    </div>
  )
}
