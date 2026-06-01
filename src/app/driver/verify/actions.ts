'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/db'

type PhotoKind = Database['public']['Enums']['photo_kind']

// Vietnamese mobile: 03x/05x/07x/08x/09x followed by 8 digits
const VN_PHONE_RE = /^(0[35789])\d{8}$/

const ProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(VN_PHONE_RE, 'Enter a valid Vietnamese mobile number (e.g. 0912345678)'),
  bodyType: z.string().refine((v) => ['sedan', 'suv', 'hatchback', 'mpv', 'pickup'].includes(v), {
    message: 'Select a vehicle type',
  }),
})

const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MB

export async function submitKyc(formData: FormData): Promise<{ error: string | null }> {
  // Auth
  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Validate text fields
  const parsed = ProfileSchema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    bodyType: formData.get('bodyType'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { fullName, phone, bodyType } = parsed.data

  // Extract + validate files
  const cccdFront = formData.get('cccdFront') as File | null
  const cccdBack = formData.get('cccdBack') as File | null
  const selfie = formData.get('selfie') as File | null

  if (!cccdFront?.size || !cccdBack?.size || !selfie?.size) {
    return { error: 'All three photos are required' }
  }
  for (const f of [cccdFront, cccdBack, selfie]) {
    if (f.size > MAX_PHOTO_BYTES) return { error: `${f.name}: photo must be under 5 MB` }
  }

  const supabase = createSupabaseAdminClient()
  const uid = user.id
  const ts = Date.now()

  const PHOTOS: Array<{ file: File; kind: PhotoKind; path: string }> = [
    { file: cccdFront, kind: 'kyc_cccd_front', path: `${uid}/kyc/cccd-front-${ts}` },
    { file: cccdBack, kind: 'kyc_cccd_back', path: `${uid}/kyc/cccd-back-${ts}` },
    { file: selfie, kind: 'kyc_selfie', path: `${uid}/kyc/selfie-${ts}` },
  ]

  // Upload to Supabase Storage (upsert so re-submissions overwrite)
  for (const { file, path } of PHOTOS) {
    const buf = await file.arrayBuffer()
    const { error } = await supabase.storage
      .from('driver-kyc')
      .upload(path, buf, { contentType: file.type || 'image/jpeg', upsert: true })
    if (error) return { error: `Photo upload failed: ${error.message}` }
  }

  // Insert photos rows (delete stale ones first so re-submissions stay clean)
  await supabase
    .from('photos')
    .delete()
    .eq('subject_id', uid)
    .in('kind', ['kyc_cccd_front', 'kyc_cccd_back', 'kyc_selfie'])

  const { error: photoErr } = await supabase.from('photos').insert(
    PHOTOS.map(({ kind, path }) => ({
      subject_id: uid,
      subject_type: 'driver',
      kind,
      storage_path: path,
      status: 'pending' as const,
    })),
  )
  if (photoErr) return { error: photoErr.message }

  // Update profile name + phone
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ full_name: fullName, phone_e164: phone })
    .eq('id', uid)
  if (profileErr) return { error: profileErr.message }

  // Update driver body_type
  const { error: driverErr } = await supabase
    .from('drivers')
    .update({ body_type: bodyType })
    .eq('id', uid)
  if (driverErr) return { error: driverErr.message }

  revalidatePath('/driver/verify')
  return { error: null }
}
