'use client'

import { useState } from 'react'

import { Plus } from 'lucide-react'

import { CampaignCard } from '@/components/partner/campaign-card'
import { CampaignFormWizard } from '@/components/partner/campaign-form-wizard'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { PartnerCampaignRow } from '@/lib/partner/queries'

export function PartnerCampaignsClient({ campaigns }: { campaigns: PartnerCampaignRow[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Campaigns"
        title="All Campaigns"
        cta={
          <Button
            onClick={() => setOpen(true)}
            className="bg-[#ff5c00] text-white hover:bg-[#e05200] focus-visible:ring-[#ff5c00]"
            aria-label="Create new campaign"
          >
            <Plus className="mr-1.5 size-4" aria-hidden="true" />
            New Campaign
          </Button>
        }
      />

      {campaigns.length === 0 ? (
        <EmptyState
          kicker="No campaigns"
          title="Create your first campaign"
          helper="Publish a campaign after adding creative and QR target. Budget follows the locked plan."
          cta={
            <Button
              onClick={() => setOpen(true)}
              className="bg-[#ff5c00] text-white hover:bg-[#e05200]"
            >
              <Plus className="mr-1.5 size-4" aria-hidden="true" />
              New Campaign
            </Button>
          }
        />
      ) : (
        <section aria-label="All campaigns">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </section>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-x-hidden overflow-y-auto sm:max-w-xl"
          aria-label="New campaign form"
        >
          <SheetHeader className="pb-2">
            <SheetTitle className="font-heading text-[28px] text-[#1a1a1a] uppercase">
              New Campaign
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            <CampaignFormWizard onSuccess={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
