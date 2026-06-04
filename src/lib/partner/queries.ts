import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { CampaignStatus } from '@/types/db'

import { DRIVER_GROSS_MONTHLY_VND, formatVnd } from './constants'

export type PartnerCampaignRow = {
  id: string
  name: string
  status: CampaignStatus
  requestedDriverCount: number
  monthlyCapVnd: number
  requiredMonthlyBudgetVnd: number
  budgetVnd: number
  spentVnd: number
  startDate: string
  endDate: string
  districts: string[]
}

export type PartnerLedgerRow = {
  id: string
  ts: string
  description: string
  amountVnd: number
  direction: 'credit' | 'debit'
  balance: number
}

export type PartnerNotification = {
  id: string
  title: string
  body: string
  createdAt: string
}

export type PartnerData = {
  partnerId: string
  companyName: string
  status: string
  balanceVnd: number
  campaigns: PartnerCampaignRow[]
  ledger: PartnerLedgerRow[]
  notifications: PartnerNotification[]
}

export async function getPartnerData(): Promise<PartnerData | null> {
  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return null

  const supabase = createSupabaseAdminClient()
  const [partnerRes, campaignsRes, ledgerRes] = await Promise.all([
    supabase
      .from('partners')
      .select('id, company_name, status, balance_vnd')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('campaigns')
      .select(
        'id, name, status, budget_vnd, spent_vnd, start_date, end_date, target_districts, requested_driver_count, active_driver_limit, monthly_budget_vnd',
      )
      .eq('partner_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('ledger_entries')
      .select('id, ts, kind, amount_vnd, note')
      .eq('partner_id', user.id)
      .order('ts', { ascending: true })
      .limit(200),
  ])

  const partner = partnerRes.data
  if (!partner) return null

  const campaigns = (campaignsRes.data ?? []).map((campaign) => {
    const requestedDriverCount =
      campaign.requested_driver_count ?? campaign.active_driver_limit ?? 0
    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      requestedDriverCount,
      monthlyCapVnd: campaign.monthly_budget_vnd ?? 0,
      requiredMonthlyBudgetVnd: requestedDriverCount * DRIVER_GROSS_MONTHLY_VND,
      budgetVnd: campaign.budget_vnd,
      spentVnd: campaign.spent_vnd,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      districts: campaign.target_districts ?? [],
    }
  })

  let runningBalance = 0
  const ledgerAsc = (ledgerRes.data ?? []).map((entry) => {
    runningBalance += entry.amount_vnd
    return {
      id: String(entry.id),
      ts: entry.ts,
      description: entry.note ?? entry.kind.replace(/_/g, ' '),
      amountVnd: Math.abs(entry.amount_vnd),
      direction: entry.amount_vnd >= 0 ? ('credit' as const) : ('debit' as const),
      balance: runningBalance,
    }
  })

  const ledger = ledgerAsc.reverse()
  const notifications = buildNotifications(campaigns, ledger)

  return {
    partnerId: partner.id,
    companyName: partner.company_name,
    status: partner.status ?? 'pending',
    balanceVnd: partner.balance_vnd,
    campaigns,
    ledger,
    notifications,
  }
}

function buildNotifications(
  campaigns: PartnerCampaignRow[],
  ledger: PartnerLedgerRow[],
): PartnerNotification[] {
  const topups = ledger
    .filter((row) => row.direction === 'credit')
    .slice(0, 3)
    .map((row) => ({
      id: `ledger-${row.id}`,
      title: 'Deposit Success',
      body: `Amount: ${formatVnd(row.amountVnd)}. Current balance: ${formatVnd(row.balance)}.`,
      createdAt: row.ts,
    }))

  const published = campaigns
    .filter((campaign) => campaign.status === 'submitted')
    .slice(0, 3)
    .map((campaign) => ({
      id: `campaign-${campaign.id}`,
      title: 'Campaign Published',
      body: `${campaign.name} has been published and is waiting for admin review.`,
      createdAt: campaign.startDate,
    }))

  return [...topups, ...published].slice(0, 5)
}
