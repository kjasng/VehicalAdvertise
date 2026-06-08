import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type DriverProfileData = {
  userId: string
  fullName: string
  email: string | null
  phone: string
  bankAccountName: string
  bankAccountNumber: string
  bankName: string
  vehicleId: string | null
  vehiclePlate: string
}

export async function getDriverProfileData(): Promise<DriverProfileData | null> {
  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return null

  const supabase = createSupabaseAdminClient()
  const [profileRes, driverRes, vehicleRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, phone_e164')
      .eq('id', user.id)
      .eq('role', 'driver')
      .maybeSingle(),
    supabase
      .from('drivers')
      .select('id, bank_account_name, bank_account_number, bank_name')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('vehicles')
      .select('id, plate')
      .eq('driver_id', user.id)
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  if (!profileRes.data || !driverRes.data) return null
  const driver = driverRes.data
  const vehicle = vehicleRes.data

  return {
    userId: user.id,
    fullName: profileRes.data.full_name,
    email: profileRes.data.email,
    phone: profileRes.data.phone_e164 ?? '',
    bankAccountName: driver.bank_account_name ?? '',
    bankAccountNumber: driver.bank_account_number ?? '',
    bankName: driver.bank_name ?? '',
    vehicleId: vehicle?.id ?? null,
    vehiclePlate: vehicle?.plate ?? '',
  }
}
