import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

import { getCurrentGarageId } from './queries-context'
import type { GarageInstallJob, GarageInstallStatus } from './types'

type ContractRow = {
  id: string
  campaign_id: string
  driver_id: string
  vehicle_id: string
  status: GarageInstallJob['contractStatus']
  created_at: string
  garage_selected_at: string | null
  installed_at: string | null
  install_note: string | null
  earning_start_date: string | null
}

type ProofRow = {
  subject_id: string
  status: 'pending' | 'approved' | 'rejected'
  reject_reason: string | null
  created_at: string
}

export async function getGarageInstallJobs(): Promise<GarageInstallJob[]> {
  const garageId = await getCurrentGarageId()
  if (!garageId) return []

  const supabase = createSupabaseAdminClient()
  const { data: contracts, error } = await supabase
    .from('contracts')
    .select(
      'id, campaign_id, driver_id, vehicle_id, status, created_at, garage_selected_at, installed_at, install_note, earning_start_date',
    )
    .eq('install_garage_id', garageId)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('[getGarageInstallJobs] contracts error:', error.message)
    return []
  }
  if (!contracts?.length) return []

  return hydrateJobs(contracts as ContractRow[])
}

async function hydrateJobs(contracts: ContractRow[]): Promise<GarageInstallJob[]> {
  const supabase = createSupabaseAdminClient()
  const campaignIds = [...new Set(contracts.map((row) => row.campaign_id))]
  const driverIds = [...new Set(contracts.map((row) => row.driver_id))]
  const vehicleIds = [...new Set(contracts.map((row) => row.vehicle_id))]
  const contractIds = contracts.map((row) => row.id)

  const [campaignsRes, profilesRes, vehiclesRes, photosRes] = await Promise.all([
    supabase
      .from('campaigns')
      .select('id, name, creative_url, creative_urls')
      .in('id', campaignIds),
    supabase.from('profiles').select('id, full_name, phone_e164').in('id', driverIds),
    supabase.from('vehicles').select('id, plate, fuel, brand, model').in('id', vehicleIds),
    supabase
      .from('photos')
      .select('subject_id, status, reject_reason, created_at')
      .eq('kind', 'install_proof')
      .in('subject_id', contractIds)
      .order('created_at', { ascending: false }),
  ])

  const campaignById = Object.fromEntries((campaignsRes.data ?? []).map((row) => [row.id, row]))
  const profileById = Object.fromEntries((profilesRes.data ?? []).map((row) => [row.id, row]))
  const vehicleById = Object.fromEntries((vehiclesRes.data ?? []).map((row) => [row.id, row]))
  const proofsByContract = groupProofs((photosRes.data ?? []) as ProofRow[])

  return contracts.map((contract) => {
    const proofs = proofsByContract[contract.id] ?? []
    const vehicle = vehicleById[contract.vehicle_id]
    const campaign = campaignById[contract.campaign_id]
    const profile = profileById[contract.driver_id]

    return {
      id: contract.id,
      campaignName: campaign?.name ?? 'Campaign',
      creativeUrl: firstCreativeUrl(campaign),
      driverName: profile?.full_name ?? 'Unknown driver',
      driverPhone: profile?.phone_e164 ?? null,
      vehiclePlate: vehicle?.plate ?? '—',
      vehicleModel:
        [vehicle?.brand, vehicle?.model].filter(Boolean).join(' ') || vehicle?.fuel || '—',
      vehicleFuel: vehicle?.fuel ?? '—',
      contractStatus: contract.status,
      status: deriveJobStatus(contract, proofs),
      createdAt: contract.created_at,
      garageSelectedAt: contract.garage_selected_at,
      installedAt: contract.installed_at,
      note: contract.install_note,
      proofTotal: proofs.length,
      proofPending: countProofs(proofs, 'pending'),
      proofApproved: countProofs(proofs, 'approved'),
      proofRejected: countProofs(proofs, 'rejected'),
      latestRejectReason: proofs.find((proof) => proof.reject_reason)?.reject_reason ?? null,
    }
  })
}

function groupProofs(proofs: ProofRow[]) {
  const grouped: Record<string, ProofRow[]> = {}
  for (const proof of proofs) {
    grouped[proof.subject_id] = grouped[proof.subject_id] ?? []
    grouped[proof.subject_id].push(proof)
  }
  return grouped
}

function firstCreativeUrl(
  campaign: { creative_url: string | null; creative_urls?: string[] | null } | undefined,
) {
  return campaign?.creative_url ?? campaign?.creative_urls?.[0] ?? null
}

function countProofs(proofs: ProofRow[], status: ProofRow['status']) {
  return proofs.filter((proof) => proof.status === status).length
}

function deriveJobStatus(contract: ContractRow, proofs: ProofRow[]): GarageInstallStatus {
  if (contract.status === 'running' || contract.earning_start_date) return 'approved'
  if (['completed', 'terminated', 'disputed'].includes(contract.status)) return 'closed'
  if (countProofs(proofs, 'pending') > 0 || contract.status === 'installed') return 'waiting_review'
  if (countProofs(proofs, 'rejected') > 0) return 'rejected'
  return 'waiting_install'
}
