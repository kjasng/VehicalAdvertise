import { redirect } from 'next/navigation'

export const metadata = { title: 'Admin · Campaigns' }

export default function CampaignsPage() {
  redirect('/admin/contracts')
}
