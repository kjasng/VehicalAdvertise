'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/db'

type ContractStatus = Database['public']['Enums']['contract_status']
type VehicleFuel = Database['public']['Enums']['vehicle_fuel']

async function getActorId(): Promise<string | null> {
  const sc = await createSupabaseServerClient()
  const { data } = await sc.auth.getUser()
  return data.user?.id ?? null
}

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

// ── Create or register vehicle for a driver (auto-approved) ───────────────

export async function createVehicle(
  raw: unknown,
): Promise<{ error: string | null; vehicleId?: string }> {
  const parsed = z
    .object({
      driverId: z.string().uuid(),
      plate: z.string().min(5, 'Biển số xe tối thiểu 5 ký tự').max(20).toUpperCase(),
      fuel: z.enum(['petrol', 'diesel', 'electric', 'hybrid']),
      brand: z.string().max(50).optional(),
      model: z.string().max(50).optional(),
    })
    .safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { driverId, plate, fuel, brand, model } = parsed.data

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .insert({
      driver_id: driverId,
      plate,
      fuel: fuel as VehicleFuel,
      brand: brand ?? null,
      model: model ?? null,
      approved: true,
      approved_by: actorId,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action: 'vehicle_registered',
    entity_type: 'vehicles',
    entity_id: vehicle.id,
    diff: { driver_id: driverId, plate, fuel },
  })

  revalidatePath('/admin/contracts')
  return { error: null, vehicleId: vehicle.id }
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

  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()

  const { data: contract, error } = await supabase
    .from('contracts')
    .insert({
      campaign_id: campaignId,
      driver_id: driverId,
      vehicle_id: vehicleId,
      install_garage_id: garageId ?? null,
      status: 'matched',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Move campaign to awaiting_install if it was approved
  await supabase
    .from('campaigns')
    .update({ status: 'awaiting_install' })
    .eq('id', campaignId)
    .eq('status', 'approved')

  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action: 'contract_created',
    entity_type: 'contracts',
    entity_id: contract.id,
    diff: { campaign_id: campaignId, driver_id: driverId, vehicle_id: vehicleId },
  })

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

  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }

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

  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .select('id, driver_id, approved')
    .eq('id', parsed.data.vehicleId)
    .eq('driver_id', parsed.data.driverId)
    .maybeSingle()
  if (vehicleError) return { error: vehicleError.message }
  if (!vehicle) return { error: 'Selected vehicle does not belong to this driver' }
  if (!vehicle.approved) return { error: 'Selected vehicle is not approved' }

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

  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action: 'contract_assignment_updated',
    entity_type: 'contracts',
    entity_id: contract.id,
    diff: {
      from: { driver_id: contract.driver_id, vehicle_id: contract.vehicle_id },
      to: { driver_id: parsed.data.driverId, vehicle_id: parsed.data.vehicleId },
    },
  })

  await revalidateContractWorkspace(contract.campaign_id, contract.campaigns?.partner_id)
  return { error: null }
}

// ── Remove contract assignment from a campaign ────────────────────────────

export async function removeContractAssignment(raw: unknown): Promise<{ error: string | null }> {
  const parsed = z.object({ contractId: z.string().uuid() }).safeParse(raw)
  if (!parsed.success) return { error: 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()
  const contract = await getContractForMutation(supabase, parsed.data.contractId)
  if (!contract) return { error: 'Contract not found' }

  const financial = await hasContractFinancialRecords(supabase, contract.id)
  if (financial.error) return { error: financial.error }
  if (financial.hasRecords) {
    return { error: 'Cannot remove assignment after financial records exist; terminate it instead' }
  }

  await supabase.from('qr_scans').delete().eq('contract_id', contract.id)
  await supabase.from('gps_logs').delete().eq('contract_id', contract.id)
  await supabase.from('contract_daily_stats').delete().eq('contract_id', contract.id)
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

  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action: 'contract_assignment_removed',
    entity_type: 'contracts',
    entity_id: contract.id,
    diff: { campaign_id: contract.campaign_id, driver_id: contract.driver_id },
  })

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

  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }

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

  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action: 'contract_status_advanced',
    entity_type: 'contracts',
    entity_id: contract.id,
    diff: { from: contract.status, to: next },
  })

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

  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }

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

  await supabase.from('audit_log').insert({
    actor_id: actorId,
    action: 'contract_terminated',
    entity_type: 'contracts',
    entity_id: parsed.data.contractId,
    diff: { reason: parsed.data.reason ?? null },
  })

  if (contract?.campaign_id) await revalidateContractWorkspace(contract.campaign_id)
  else revalidatePath('/admin/contracts')
  return { error: null }
}
