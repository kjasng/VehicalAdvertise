'use client'

/**
 * Partner Campaigns — list all campaigns + "New Campaign" CTA.
 * Opens a Sheet containing CampaignFormWizard.
 * Client component due to Sheet open/close state.
 */
import { useState } from 'react'

import { Plus } from 'lucide-react'

import { CampaignCard } from '@/components/partner/campaign-card'
import { CampaignFormWizard } from '@/components/partner/campaign-form-wizard'
import { MOCK_CAMPAIGNS } from '@/components/partner/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export default function PartnerCampaignsPage() {
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

      {/* Campaign grid */}
      <section aria-label="All campaigns">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_CAMPAIGNS.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </section>

      {/* New campaign sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-lg"
          aria-label="New campaign form"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="font-heading text-[28px] text-[#1a1a1a] uppercase">
              New Campaign
            </SheetTitle>
          </SheetHeader>
          <CampaignFormWizard onSuccess={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
