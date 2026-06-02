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

  revalidatePath('/admin/contracts')
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

  revalidatePath('/admin/contracts')
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

  revalidatePath('/admin/contracts')
  return { error: null }
}
