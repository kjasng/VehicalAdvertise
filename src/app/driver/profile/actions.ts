'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const VN_PHONE_RE = /^(0[35789])\d{8}$/

const UpdateDriverProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(VN_PHONE_RE, 'Số điện thoại không hợp lệ'),
  bankAccountName: z.string().trim().min(2).max(120),
  bankAccountNumber: z.string().trim().min(5).max(40),
  bankName: z.string().trim().min(2).max(120),
  vehicleId: z.string().uuid().nullable(),
  vehiclePlate: z.string().trim().min(5, 'Biển số không hợp lệ').max(20),
})

export async function updateDriverProfile(raw: unknown): Promise<{ error: string | null }> {
  const parsed = UpdateDriverProfileSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'driver') return { error: 'Forbidden' }

  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.fullName,
      phone_e164: parsed.data.phone,
    })
    .eq('id', user.id)
    .eq('role', 'driver')

  if (profileError) {
    if (profileError.code === '23505') return { error: 'Số điện thoại đã được sử dụng' }
    return { error: profileError.message }
  }

  const { error: driverError } = await supabase
    .from('drivers')
    .update({
      bank_account_name: parsed.data.bankAccountName,
      bank_account_number: parsed.data.bankAccountNumber,
      bank_name: parsed.data.bankName,
    })
    .eq('id', user.id)
  if (driverError) return { error: driverError.message }

  const plate = parsed.data.vehiclePlate.toUpperCase()
  if (parsed.data.vehicleId) {
    const { error: vehicleError } = await supabase
      .from('vehicles')
      .update({ plate })
      .eq('id', parsed.data.vehicleId)
      .eq('driver_id', user.id)
    if (vehicleError) return { error: vehicleError.message }
  } else {
    // First-time driver: no vehicle row yet, create one so they become assignable.
    const { error: vehicleError } = await supabase
      .from('vehicles')
      .insert({ driver_id: user.id, plate })
    if (vehicleError) {
      if (vehicleError.code === '23505') return { error: 'Biển số đã tồn tại' }
      return { error: vehicleError.message }
    }
  }

  revalidatePath('/driver/profile')
  revalidatePath('/driver/invoice')
  return { error: null }
}
