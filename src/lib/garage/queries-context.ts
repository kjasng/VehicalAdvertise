import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

import type { GarageProfile } from './types'

export async function getCurrentGarageId(): Promise<string | null> {
  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  return user?.id ?? null
}

export async function getGarageProfile(): Promise<GarageProfile | null> {
  const garageId = await getCurrentGarageId()
  if (!garageId) return null

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('garages')
    .select(
      'id, shop_name, address, contact_name, phone, service_area, google_maps_url, working_hours, approved, balance_vnd, bank_account_name, bank_account_number, bank_name, bank_branch, bank_bin, bank_verified_at',
    )
    .eq('id', garageId)
    .maybeSingle()

  if (error) {
    console.error('[getGarageProfile] query error:', error.message)
    return null
  }
  if (!data) return null

  return {
    id: data.id,
    shopName: data.shop_name,
    address: data.address,
    contactName: data.contact_name ?? '',
    phone: data.phone ?? '',
    serviceArea: data.service_area ?? '',
    googleMapsUrl: data.google_maps_url ?? '',
    workingHours: data.working_hours ?? '',
    approved: data.approved,
    balanceVnd: data.balance_vnd,
    bankAccountName: data.bank_account_name ?? '',
    bankAccountNumber: data.bank_account_number ?? '',
    bankName: data.bank_name ?? '',
    bankBranch: data.bank_branch ?? '',
    bankBin: data.bank_bin ?? '',
    bankVerified: Boolean(data.bank_verified_at),
  }
}

export function hasGaragePayoutSettings(profile: GarageProfile): boolean {
  return Boolean(profile.bankAccountName && profile.bankAccountNumber && profile.bankName)
}
