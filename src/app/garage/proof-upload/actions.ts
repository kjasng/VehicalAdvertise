'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const BUCKET = 'driver-kyc'
const MAX_FILE_SIZE = 6 * 1024 * 1024
const ANGLES = ['front', 'rear', 'left', 'right', 'closeup'] as const

const ContractSchema = z.object({
  contractId: z.string().uuid(),
  note: z.string().trim().max(500).optional(),
})

export async function submitGarageInstallProof(
  formData: FormData,
): Promise<{ error: string | null }> {
  const parsed = ContractSchema.safeParse({
    contractId: formData.get('contractId'),
    note: formData.get('note') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'garage') return { error: 'Forbidden' }

  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const files = ANGLES.map((angle) => [angle, readFile(formData, angle)] as const)
  const missing = files.filter(([, file]) => !file).map(([angle]) => angle)
  if (missing.length > 0) return { error: 'Upload đủ 5 ảnh xác nhận lắp decal.' }

  const invalid = files.find(([, file]) => file && !isValidImage(file))
  if (invalid) return { error: 'Ảnh phải là file image và nhỏ hơn 6MB.' }

  const supabase = createSupabaseAdminClient()
  const { data: garage } = await supabase
    .from('garages')
    .select('approved')
    .eq('id', user.id)
    .maybeSingle()
  if (!garage?.approved) return { error: 'Garage chưa được admin approve.' }

  const { data: contract } = await supabase
    .from('contracts')
    .select('id, install_garage_id, status')
    .eq('id', parsed.data.contractId)
    .maybeSingle()
  if (!contract || contract.install_garage_id !== user.id)
    return { error: 'Install job not found.' }
  if (['running', 'completed', 'terminated'].includes(contract.status)) {
    return { error: 'Install job này đã đóng hoặc đã được approve.' }
  }

  await supabase
    .from('photos')
    .delete()
    .eq('subject_id', contract.id)
    .eq('subject_type', 'contract')
    .eq('kind', 'install_proof')
    .eq('status', 'pending')

  const rows = []
  for (const [angle, file] of files) {
    if (!file) continue
    const path = buildStoragePath(user.id, contract.id, angle, file)
    const body = Buffer.from(await file.arrayBuffer())
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, body, {
      contentType: file.type,
      upsert: true,
    })
    if (uploadError) return { error: uploadError.message }
    rows.push({
      subject_id: contract.id,
      subject_type: 'contract',
      kind: 'install_proof' as const,
      storage_path: path,
      client_ts: new Date().toISOString(),
    })
  }

  const { error: photoError } = await supabase.from('photos').insert(rows)
  if (photoError) return { error: photoError.message }

  const { error: contractError } = await supabase
    .from('contracts')
    .update({
      status: 'installed',
      installed_at: new Date().toISOString(),
      install_note: parsed.data.note || null,
    })
    .eq('id', contract.id)
  if (contractError) return { error: contractError.message }

  revalidatePath('/garage/dashboard')
  revalidatePath('/garage/installs')
  revalidatePath('/garage/proof-upload')
  revalidatePath('/admin/install-proofs')
  revalidatePath('/admin/contracts')
  return { error: null }
}

function readFile(formData: FormData, key: string): File | null {
  const value = formData.get(key)
  return value instanceof File && value.size > 0 ? value : null
}

function isValidImage(file: File): boolean {
  return file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE
}

function buildStoragePath(garageId: string, contractId: string, angle: string, file: File) {
  const ext = extensionFor(file)
  return `${garageId}/install-proofs/${contractId}/${Date.now()}-${angle}.${ext}`
}

function extensionFor(file: File) {
  const fallback = file.type.split('/')[1] || 'jpg'
  return (
    file.name
      .split('.')
      .pop()
      ?.replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase() || fallback
  )
}
