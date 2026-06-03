import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

import {
  getCurrentMonthlyPeriod,
  getLastCompletedMonthlyPeriod,
  type MonthlyPeriod,
} from './monthly-earning'

export type DriverInvoiceRow = {
  id: string
  invoiceNumber: string
  amountVnd: number
  status: 'requested' | 'reviewing' | 'approved' | 'paid' | 'rejected'
  periodStart: string
  periodEnd: string
  requestedAt: string
}

export type DriverInvoicePageData = {
  activeContract: {
    id: string
    campaignName: string
    earningStartDate: string
  } | null
  currentPeriod: MonthlyPeriod | null
  completedPeriod: MonthlyPeriod | null
  earningPeriod: {
    id: string
    driverNetVnd: number
    grossChargeVnd: number
    platformFeeVnd: number
  } | null
  invoices: DriverInvoiceRow[]
  payoutSettingsComplete: boolean
  canCreateInvoice: boolean
  blockedReason: string | null
  totalPaidVnd: number
}

export async function getDriverInvoicePageData(): Promise<DriverInvoicePageData | null> {
  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return null

  const supabase = createSupabaseAdminClient()
  const [driverRes, contractsRes, invoicesRes] = await Promise.all([
    supabase
      .from('drivers')
      .select('bank_account_name, bank_account_number, bank_name')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('contracts')
      .select('id, campaign_id, status, earning_start_date, campaigns(name)')
      .eq('driver_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('driver_invoices')
      .select('id, invoice_number, amount_vnd, status, period_start, period_end, requested_at')
      .eq('driver_id', user.id)
      .order('requested_at', { ascending: false }),
  ])

  const driver = driverRes.data
  const invoices = (invoicesRes.data ?? []).map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    amountVnd: invoice.amount_vnd,
    status: invoice.status,
    periodStart: invoice.period_start,
    periodEnd: invoice.period_end,
    requestedAt: invoice.requested_at,
  }))
  const totalPaidVnd = invoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amountVnd, 0)

  const contract = (contractsRes.data ?? []).find(
    (row) => row.status === 'running' && row.earning_start_date,
  )
  if (!contract?.earning_start_date) {
    return {
      activeContract: null,
      currentPeriod: null,
      completedPeriod: null,
      earningPeriod: null,
      invoices,
      payoutSettingsComplete: hasPayoutSettings(driver),
      canCreateInvoice: false,
      blockedReason: 'Driver is not active for earning yet.',
      totalPaidVnd,
    }
  }

  const currentPeriod = getCurrentMonthlyPeriod(contract.earning_start_date)
  const completedPeriod = getLastCompletedMonthlyPeriod(contract.earning_start_date)
  const earningPeriod = completedPeriod
    ? await ensureAndFetchEarningPeriod(user.id, contract.id, completedPeriod)
    : null
  const duplicate = completedPeriod
    ? invoices.some(
        (invoice) =>
          invoice.periodStart === completedPeriod.start &&
          invoice.periodEnd === completedPeriod.end,
      )
    : false
  const payoutSettingsComplete = hasPayoutSettings(driver)

  const campaign = Array.isArray(contract.campaigns) ? contract.campaigns[0] : contract.campaigns
  const blockedReason = !completedPeriod
    ? 'Monthly payment period has not completed yet.'
    : !payoutSettingsComplete
      ? 'Complete payout settings before creating an invoice.'
      : duplicate
        ? 'Invoice already exists for the latest completed period.'
        : earningPeriod
          ? null
          : 'Monthly earning period is not ready.'

  return {
    activeContract: {
      id: contract.id,
      campaignName: campaign?.name ?? 'Campaign',
      earningStartDate: contract.earning_start_date,
    },
    currentPeriod,
    completedPeriod,
    earningPeriod,
    invoices,
    payoutSettingsComplete,
    canCreateInvoice: Boolean(
      completedPeriod && payoutSettingsComplete && earningPeriod && !duplicate,
    ),
    blockedReason,
    totalPaidVnd,
  }
}

function hasPayoutSettings(
  driver: {
    bank_account_name: string | null
    bank_account_number: string | null
    bank_name?: string | null
  } | null,
) {
  return Boolean(driver?.bank_account_name && driver.bank_account_number && driver.bank_name)
}

async function ensureAndFetchEarningPeriod(
  driverId: string,
  contractId: string,
  period: MonthlyPeriod,
) {
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.rpc('ensure_driver_monthly_earning_period', {
    p_driver_id: driverId,
    p_contract_id: contractId,
    p_period_start: period.start,
    p_period_end: period.end,
  })
  if (error) {
    console.error('[ensureAndFetchEarningPeriod] rpc error:', error.message)
    return null
  }

  const { data } = await supabase
    .from('driver_earning_periods')
    .select('id, driver_net_vnd, gross_charge_vnd, platform_fee_vnd')
    .eq('contract_id', contractId)
    .eq('period_start', period.start)
    .maybeSingle()

  return data
    ? {
        id: data.id,
        driverNetVnd: data.driver_net_vnd,
        grossChargeVnd: data.gross_charge_vnd,
        platformFeeVnd: data.platform_fee_vnd,
      }
    : null
}
