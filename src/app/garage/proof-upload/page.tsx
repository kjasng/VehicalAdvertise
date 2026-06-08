import { redirect } from 'next/navigation'

import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { getGarageProfile } from '@/lib/garage/queries-context'
import { getGarageInstallJobs } from '@/lib/garage/queries-installs'

import { ProofUploadPicker } from './proof-upload-picker'

export const metadata = { title: 'Garage · Proof Upload' }

type PageProps = {
  searchParams?: Promise<{ contract?: string }>
}

export default async function GarageProofUploadPage({ searchParams }: PageProps) {
  const params = await searchParams
  const [profile, jobs] = await Promise.all([getGarageProfile(), getGarageInstallJobs()])
  if (!profile) redirect('/login')

  const eligibleJobs = jobs.filter(
    (job) => job.status === 'waiting_install' || job.status === 'rejected',
  )
  const initialContractId = eligibleJobs.some((job) => job.id === params?.contract)
    ? (params?.contract ?? '')
    : ''

  return (
    <div className="flex flex-col gap-8">
      <PageHeader kicker="PROOF" title="UPLOAD INSTALL PHOTOS" />

      {eligibleJobs.length === 0 ? (
        <EmptyState
          kicker="empty"
          title="No Upload Jobs"
          helper="Không có job nào cần upload ảnh lắp decal."
        />
      ) : (
        <ProofUploadPicker jobs={eligibleJobs} initialContractId={initialContractId} />
      )}
    </div>
  )
}
