import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

import { batchSignUrls } from './photo-query-utils'

export type InstallProofPhoto = {
  id: string
  submittedAt: string
  signedPhotoUrl: string | null
  status: 'pending' | 'approved' | 'rejected'
  angle: string
}

export type InstallProofRow = {
  contractId: string
  driverName: string
  garageName: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  photos: InstallProofPhoto[]
}

export async function getInstallProofs(): Promise<InstallProofRow[]> {
  const supabase = createSupabaseAdminClient()
  const { data: photos, error } = await supabase
    .from('photos')
    .select('id, subject_id, subject_type, storage_path, status, created_at')
    .eq('kind', 'install_proof')
    .eq('subject_type', 'contract')
    .order('created_at', { ascending: false })
    .limit(800)

  if (error) {
    console.error('[getInstallProofs] photos query error:', error.message)
    return []
  }
  if (!photos?.length) return []

  const photosByContract = groupInstallProofPhotos(photos)
  const latestPhotos = Array.from(photosByContract.values()).flatMap((rows) => rows.slice(0, 4))
  const contracts = await getContractLookup([...photosByContract.keys()])
  const signedByPath = await batchSignUrls(
    supabase,
    latestPhotos.map((photo) => photo.storage_path),
  )

  return Array.from(photosByContract.entries()).map(([contractId, contractPhotos]) => {
    const latest = contractPhotos.slice(0, 4)
    const contract = contracts[contractId]
    return {
      contractId,
      driverName: contract?.driverName ?? 'Unknown',
      garageName: contract?.garageName ?? 'No garage',
      submittedAt: latest[0]?.created_at ?? '',
      status: deriveInstallProofStatus(latest),
      photos: latest.map((photo) => ({
        id: photo.id,
        submittedAt: photo.created_at,
        signedPhotoUrl: signedByPath[photo.storage_path] ?? null,
        status: photo.status as InstallProofPhoto['status'],
        angle: angleFromPath(photo.storage_path),
      })),
    }
  })
}

async function getContractLookup(contractIds: string[]) {
  const supabase = createSupabaseAdminClient()
  const { data: contracts } = await supabase
    .from('contracts')
    .select('id, driver_id, install_garage_id')
    .in('id', contractIds)

  const driverIds = [...new Set((contracts ?? []).map((contract) => contract.driver_id))]
  const garageIds = [
    ...new Set(
      (contracts ?? [])
        .map((contract) => contract.install_garage_id)
        .filter((id): id is string => id !== null),
    ),
  ]
  const [{ data: drivers }, { data: garages }] = await Promise.all([
    driverIds.length
      ? supabase.from('profiles').select('id, full_name').in('id', driverIds)
      : Promise.resolve({ data: [] }),
    garageIds.length
      ? supabase.from('garages').select('id, shop_name').in('id', garageIds)
      : Promise.resolve({ data: [] }),
  ])

  const driverName = Object.fromEntries(
    (drivers ?? []).map((driver) => [driver.id, driver.full_name]),
  )
  const garageName = Object.fromEntries(
    (garages ?? []).map((garage) => [garage.id, garage.shop_name]),
  )
  return Object.fromEntries(
    (contracts ?? []).map((contract) => [
      contract.id,
      {
        driverName: driverName[contract.driver_id],
        garageName: contract.install_garage_id ? garageName[contract.install_garage_id] : null,
      },
    ]),
  )
}

function groupInstallProofPhotos<T extends { subject_id: string }>(photos: T[]) {
  const grouped = new Map<string, T[]>()
  for (const photo of photos) {
    grouped.set(photo.subject_id, [...(grouped.get(photo.subject_id) ?? []), photo])
  }
  return grouped
}

function deriveInstallProofStatus(photos: { status: string }[]): InstallProofRow['status'] {
  if (photos.some((photo) => photo.status === 'pending')) return 'pending'
  if (photos.some((photo) => photo.status === 'rejected')) return 'rejected'
  return 'approved'
}

function angleFromPath(path: string) {
  const filename = path.split('/').pop() ?? ''
  if (filename.includes('-front.')) return 'Front'
  if (filename.includes('-rear.')) return 'Rear'
  if (filename.includes('-left.')) return 'Left'
  if (filename.includes('-right.')) return 'Right'
  return 'Photo'
}
