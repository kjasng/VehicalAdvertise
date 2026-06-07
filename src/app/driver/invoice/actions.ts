'use server'

import { revalidatePath } from 'next/cache'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { buildAdLeaseContractHtml } from '@/lib/driver/ad-lease-contract-html'
import { buildDriverInvoiceHtml } from '@/lib/driver/invoice-html'
import { getLastCompletedMonthlyPeriod } from '@/lib/driver/monthly-earning'
import { getCompanyInfo } from '@/lib/shared/vn-doc/company-info'

export async function createDriverWithdrawalInvoice(): Promise<{ error: string | null }> {
  const role = await getCurrentUserRole()
  if (role !== 'driver') return { error: 'Forbidden' }

  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()
  const [profileRes, driverRes, contractRes] = await Promise.all([
    supabase.from('profiles').select('full_name, email').eq('id', user.id).maybeSingle(),
    supabase
      .from('drivers')
      .select('bank_account_name, bank_account_number, bank_name, cccd_number')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('contracts')
      .select('id, campaign_id, status, earning_start_date, campaigns(name), vehicles(plate)')
      .eq('driver_id', user.id)
      .eq('status', 'running')
      .not('earning_start_date', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const driver = driverRes.data
  const contract = contractRes.data
  if (!profileRes.data || !driver || !contract?.earning_start_date) {
    return { error: 'Driver is not active for earning yet.' }
  }
  if (!driver.bank_account_name || !driver.bank_account_number || !driver.bank_name) {
    return { error: 'Complete payout settings before creating an invoice.' }
  }

  const period = getLastCompletedMonthlyPeriod(contract.earning_start_date)
  if (!period) return { error: 'Monthly payment period has not completed yet.' }

  const { error: periodError } = await supabase.rpc('ensure_driver_monthly_earning_period', {
    p_driver_id: user.id,
    p_contract_id: contract.id,
    p_period_start: period.start,
    p_period_end: period.end,
  })
  if (periodError) return { error: periodError.message }

  const [{ data: earningPeriod }, { data: duplicate }] = await Promise.all([
    supabase
      .from('driver_earning_periods')
      .select('id, driver_net_vnd')
      .eq('contract_id', contract.id)
      .eq('period_start', period.start)
      .maybeSingle(),
    supabase
      .from('driver_invoices')
      .select('id')
      .eq('contract_id', contract.id)
      .eq('period_start', period.start)
      .maybeSingle(),
  ])

  if (duplicate) return { error: 'Invoice already exists for this period.' }
  if (!earningPeriod) return { error: 'Monthly earning period is not ready.' }

  const campaign = Array.isArray(contract.campaigns) ? contract.campaigns[0] : contract.campaigns
  const vehicle = Array.isArray(contract.vehicles) ? contract.vehicles[0] : contract.vehicles
  const campaignName = campaign?.name ?? 'Campaign'
  const vehiclePlate = vehicle?.plate ?? '—'
  const company = getCompanyInfo()
  const invoiceNumber = `DRV-${period.start.replaceAll('-', '')}-${user.id.slice(0, 8).toUpperCase()}`
  const contractNumber = `HD-${period.start.replaceAll('-', '')}-${user.id.slice(0, 8).toUpperCase()}`
  const bankSnapshot = {
    bankAccountName: driver.bank_account_name,
    bankAccountNumber: driver.bank_account_number,
    bankName: driver.bank_name,
  }
  const now = new Date().toISOString()

  // Stored document = ad-lease contract (Bên A/Bên B) followed by the payment invoice.
  const contractHtml = buildAdLeaseContractHtml({
    contractNumber,
    signDate: now,
    company,
    driverName: profileRes.data.full_name,
    driverCccd: driver.cccd_number,
    driverAddress: null,
    vehiclePlate,
    campaignName,
    periodStart: period.start,
    periodEnd: period.end,
  })
  const invoiceDocHtml = buildDriverInvoiceHtml({
    invoiceNumber,
    requestedAt: now,
    company,
    driverName: profileRes.data.full_name,
    driverEmail: profileRes.data.email,
    campaignName,
    periodStart: period.start,
    periodEnd: period.end,
    amountVnd: earningPeriod.driver_net_vnd,
    bankAccountName: driver.bank_account_name,
    bankAccountNumber: driver.bank_account_number,
    bankName: driver.bank_name,
  })
  const invoiceHtml = `${contractHtml}<div class="page-break"></div>${invoiceDocHtml}`

  const { error: insertError } = await supabase.from('driver_invoices').insert({
    invoice_number: invoiceNumber,
    driver_id: user.id,
    contract_id: contract.id,
    campaign_id: contract.campaign_id,
    earning_period_id: earningPeriod.id,
    period_start: period.start,
    period_end: period.end,
    amount_vnd: earningPeriod.driver_net_vnd,
    bank_snapshot: bankSnapshot,
    invoice_html: invoiceHtml,
    requested_at: now,
  })
  if (insertError) return { error: insertError.message }

  await supabase
    .from('driver_earning_periods')
    .update({ status: 'invoiced' })
    .eq('id', earningPeriod.id)

  revalidatePath('/driver/invoice')
  revalidatePath('/admin/invoices/driver')
  return { error: null }
}
