'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const SelectGarageSchema = z.object({
  contractId: z.string().uuid(),
  garageId: z.string().uuid(),
})

export async function selectDriverInstallGarage(raw: unknown): Promise<{ error: string | null }> {
  const parsed = SelectGarageSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'driver') return { error: 'Forbidden' }

  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()
  const [contractRes, garageRes] = await Promise.all([
    supabase
      .from('contracts')
      .select('id, driver_id, status, install_garage_id')
      .eq('id', parsed.data.contractId)
      .maybeSingle(),
    supabase.from('garages').select('id, approved').eq('id', parsed.data.garageId).maybeSingle(),
  ])

  const contract = contractRes.data
  if (!contract || contract.driver_id !== user.id) return { error: 'Contract not found.' }
  if (contract.install_garage_id) return { error: 'Garage đã được chọn cho contract này.' }
  if (!['matched', 'awaiting_install'].includes(contract.status)) {
    return { error: 'Contract không còn ở trạng thái chọn garage.' }
  }
  if (!garageRes.data?.approved) return { error: 'Garage không khả dụng.' }

  const { error } = await supabase
    .from('contracts')
    .update({
      install_garage_id: parsed.data.garageId,
      garage_selected_at: new Date().toISOString(),
      status: 'awaiting_install',
    })
    .eq('id', contract.id)
  if (error) return { error: error.message }

  revalidatePath('/driver/garage')
  revalidatePath('/driver/profile')
  revalidatePath('/garage/dashboard')
  revalidatePath('/garage/installs')
  revalidatePath('/admin/contracts')
  return { error: null }
}
