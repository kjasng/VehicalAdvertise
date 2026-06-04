import { redirect } from 'next/navigation'

import { getPartnerData } from '@/lib/partner/queries'

import { PartnerCampaignsClient } from './partner-campaigns-client'

export const metadata = { title: 'Partner · Campaigns' }

export default async function PartnerCampaignsPage() {
  const data = await getPartnerData()
  if (!data) redirect('/login')

  return <PartnerCampaignsClient campaigns={data.campaigns} />
}
