'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/types/db'

type ContractStatus = Database['public']['Enums']['contract_status']

type ContractMutationContext = {
  id: string
  campaign_id: string
  driver_id: string
  vehicle_id: string
  status: ContractStatus
  campaigns: { partner_id: string } | null
}

async function getContractForMutation(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  contractId: string,
): Promise<ContractMutationContext | null> {
  const { data } = await supabase
    .from('contracts')
    .select('id, campaign_id, driver_id, vehicle_id, status, campaigns(partner_id)')
    .eq('id', contractId)
    .maybeSingle()

  if (!data) return null
  return {
    ...data,
    campaigns: Array.isArray(data.campaigns) ? data.campaigns[0] : data.campaigns,
  } as ContractMutationContext
}

async function hasContractFinancialRecords(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  contractId: string,
): Promise<{ error: string | null; hasRecords: boolean }> {
  const [ledgerRes, invoicesRes, periodsRes, garageEarningsRes] = await Promise.all([
    supabase
      .from('ledger_entries')
      .select('id', { count: 'exact', head: true })
      .eq('contract_id', contractId),
    supabase
      .from('driver_invoices')
      .select('id', { count: 'exact', head: true })
      .eq('contract_id', contractId),
    supabase
      .from('driver_earning_periods')
      .select('id', { count: 'exact', head: true })
      .eq('contract_id', contractId),
    supabase
      .from('garage_earnings')
      .select('id', { count: 'exact', head: true })
      .eq('contract_id', contractId),
  ])

  const firstError =
    ledgerRes.error ?? invoicesRes.error ?? periodsRes.error ?? garageEarningsRes.error
  if (firstError) return { error: firstError.message, hasRecords: false }

  return {
    error: null,
    hasRecords:
      (ledgerRes.count ?? 0) > 0 ||
      (invoicesRes.count ?? 0) > 0 ||
      (periodsRes.count ?? 0) > 0 ||
      (garageEarningsRes.count ?? 0) > 0,
  }
}

async function revalidateContractWorkspace(campaignId: string, partnerId?: string | null) {
  revalidatePath('/admin/contracts')
  revalidatePath(`/admin/contracts/${campaignId}`)
  if (partnerId) revalidatePath(`/admin/${partnerId}/contracts`)
}

async function validateApprovedDriverVehicle(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  driverId: string,
  vehicleId: string,
): Promise<string | null> {
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('id, approved')
    .eq('id', vehicleId)
    .eq('driver_id', driverId)
    .maybeSingle()

  if (error) return error.message
  if (!vehicle) return 'Selected vehicle does not belong to this driver'
  if (!vehicle.approved) return 'Selected vehicle is not approved'
  return null
}

// ── Create contract (match driver to campaign) ────────────────────────────

export async function createContract(raw: unknown): Promise<{ error: string | null }> {
  const parsed = z
    .object({
      campaignId: z.string().uuid(),
      driverId: z.string().uuid(),
      vehicleId: z.string().uuid(),
      garageId: z.string().uuid().optional(),
    })
    .safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { campaignId, driverId, vehicleId, garageId } = parsed.data

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const supabase = createSupabaseAdminClient()
  const vehicleError = await validateApprovedDriverVehicle(supabase, driverId, vehicleId)
  if (vehicleError) return { error: vehicleError }

  const { error } = await supabase.from('contracts').insert({
    campaign_id: campaignId,
    driver_id: driverId,
    vehicle_id: vehicleId,
    install_garage_id: garageId ?? null,
    status: 'matched',
  })

  if (error) return { error: error.message }

  // Move campaign to awaiting_install if it was approved
  await supabase
    .from('campaigns')
    .update({ status: 'awaiting_install' })
    .eq('id', campaignId)
    .eq('status', 'approved')

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('partner_id')
    .eq('id', campaignId)
    .maybeSingle()
  await revalidateContractWorkspace(campaignId, campaign?.partner_id)
  return { error: null }
}

// ── Update contract assignment (driver + vehicle) ─────────────────────────

export async function updateContractAssignment(raw: unknown): Promise<{ error: string | null }> {
  const parsed = z
    .object({
      contractId: z.string().uuid(),
      driverId: z.string().uuid(),
      vehicleId: z.string().uuid(),
    })
    .safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const supabase = createSupabaseAdminClient()
  const contract = await getContractForMutation(supabase, parsed.data.contractId)
  if (!contract) return { error: 'Contract not found' }
  if (['running', 'completed', 'terminated'].includes(contract.status)) {
    return { error: 'Cannot edit a running, completed, or terminated assignment' }
  }

  const financial = await hasContractFinancialRecords(supabase, contract.id)
  if (financial.error) return { error: financial.error }
  if (financial.hasRecords) {
    return { error: 'Cannot edit assignment after financial records exist' }
  }

  const vehicleError = await validateApprovedDriverVehicle(
    supabase,
    parsed.data.driverId,
    parsed.data.vehicleId,
  )
  if (vehicleError) return { error: vehicleError }

  const { error } = await supabase
    .from('contracts')
    .update({
      driver_id: parsed.data.driverId,
      vehicle_id: parsed.data.vehicleId,
      status: 'matched',
      install_garage_id: null,
      installed_at: null,
      removed_at: null,
    })
    .eq('id', contract.id)
  if (error) return { error: error.message }

  await supabase
    .from('photos')
    .delete()
    .eq('subject_type', 'contract')
    .eq('subject_id', contract.id)

  await revalidateContractWorkspace(contract.campaign_id, contract.campaigns?.partner_id)
  return { error: null }
}

// ── Remove contract assignment from a campaign ────────────────────────────

export async function removeContractAssignment(raw: unknown): Promise<{ error: string | null }> {
  const parsed = z.object({ contractId: z.string().uuid() }).safeParse(raw)
  if (!parsed.success) return { error: 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const supabase = createSupabaseAdminClient()
  const contract = await getContractForMutation(supabase, parsed.data.contractId)
  if (!contract) return { error: 'Contract not found' }

  const financial = await hasContractFinancialRecords(supabase, contract.id)
  if (financial.error) return { error: financial.error }
  if (financial.hasRecords) {
    return { error: 'Cannot remove assignment after financial records exist; terminate it instead' }
  }

  await supabase
    .from('photos')
    .delete()
    .eq('subject_type', 'contract')
    .eq('subject_id', contract.id)

  const { error } = await supabase.from('contracts').delete().eq('id', contract.id)
  if (error) return { error: error.message }

  const { count } = await supabase
    .from('contracts')
    .select('id', { count: 'exact', head: true })
    .eq('campaign_id', contract.campaign_id)
  if ((count ?? 0) === 0) {
    await supabase
      .from('campaigns')
      .update({ status: 'approved' })
      .eq('id', contract.campaign_id)
      .eq('status', 'awaiting_install')
  }

  await revalidateContractWorkspace(contract.campaign_id, contract.campaigns?.partner_id)
  return { error: null }
}

// ── Advance contract status ───────────────────────────────────────────────

const STATUS_TRANSITIONS: Record<string, ContractStatus> = {
  matched: 'awaiting_install',
  awaiting_install: 'installed',
  installed: 'running',
  running: 'completed',
}

export async function advanceContractStatus(raw: unknown): Promise<{ error: string | null }> {
  const parsed = z.object({ contractId: z.string().uuid() }).safeParse(raw)
  if (!parsed.success) return { error: 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const supabase = createSupabaseAdminClient()

  const { data: contract } = await supabase
    .from('contracts')
    .select('id, status, campaign_id')
    .eq('id', parsed.data.contractId)
    .single()

  if (!contract) return { error: 'Contract not found' }
  const next = STATUS_TRANSITIONS[contract.status]
  if (!next) return { error: `Cannot advance from ${contract.status}` }

  // Use separate updates to keep TypeScript happy with the strict schema types
  const { error } =
    next === 'installed'
      ? await supabase
          .from('contracts')
          .update({ status: next, installed_at: new Date().toISOString() })
          .eq('id', contract.id)
      : await supabase.from('contracts').update({ status: next }).eq('id', contract.id)
  if (error) return { error: error.message }

  // When first contract goes running, mark campaign as active
  if (next === 'running') {
    await supabase
      .from('campaigns')
      .update({ status: 'active' })
      .eq('id', contract.campaign_id)
      .eq('status', 'awaiting_install')
  }

  await revalidateContractWorkspace(contract.campaign_id)
  return { error: null }
}

export async function terminateContract(raw: unknown): Promise<{ error: string | null }> {
  const parsed = z
    .object({ contractId: z.string().uuid(), reason: z.string().max(200).optional() })
    .safeParse(raw)
  if (!parsed.success) return { error: 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const supabase = createSupabaseAdminClient()
  const { data: contract } = await supabase
    .from('contracts')
    .select('campaign_id')
    .eq('id', parsed.data.contractId)
    .maybeSingle()

  const { error } = await supabase
    .from('contracts')
    .update({ status: 'terminated' })
    .eq('id', parsed.data.contractId)
  if (error) return { error: error.message }

  if (contract?.campaign_id) await revalidateContractWorkspace(contract.campaign_id)
  else revalidatePath('/admin/contracts')
  return { error: null }
}
