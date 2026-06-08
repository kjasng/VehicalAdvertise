import Link from 'next/link'
import { redirect } from 'next/navigation'

import { DriverProfileForm } from '@/components/driver/driver-profile-form'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getDriverGarageSelectionData } from '@/lib/driver/queries-garage-selection'
import { getDriverProfileData } from '@/lib/driver/queries-profile'

export const metadata = { title: 'Driver · Profile' }

export default async function DriverProfilePage() {
  const profile = await getDriverProfileData()
  if (!profile) redirect('/login')

  // Garage-selection notice — onboarding gate before earning. Relocated here
  // after the driver dashboard was removed.
  const garageData = await getDriverGarageSelectionData()
  const installContract = garageData?.contract ?? null

  return (
    <div className="space-y-6">
      <PageHeader kicker="ACCOUNT" title="Profile" />

      {installContract && !installContract.selectedGarage && (
        <SectionShell
          title="Chọn garage lắp decal"
          action={
            <Link
              href="/driver/garage"
              className="rounded bg-[#ff5c00] px-3 py-2 text-[12px] font-bold text-white hover:bg-[#e05200]"
            >
              Chọn garage
            </Link>
          }
        >
          <p className="text-[13px] text-[#666666]">
            Bạn đã được gắn campaign {installContract.campaignName}. Chọn garage gần bạn để lắp
            decal trước khi bắt đầu earning.
          </p>
        </SectionShell>
      )}

      {installContract?.selectedGarage && installContract.status !== 'running' && (
        <SectionShell
          title="Garage đã chọn"
          action={
            <Link
              href="/driver/garage"
              className="rounded border border-[#cbccc9] px-3 py-2 text-[12px] font-bold text-[#1a1a1a] hover:bg-[#f7f8fa]"
            >
              Xem hướng dẫn
            </Link>
          }
        >
          <p className="text-[13px] text-[#666666]">
            {installContract.selectedGarage.shopName} sẽ lắp decal cho xe{' '}
            <span className="font-mono text-[#1a1a1a]">{installContract.vehiclePlate}</span>. Sau
            khi garage upload ảnh và admin approve, bạn mới bắt đầu earning.
          </p>
        </SectionShell>
      )}

      <DriverProfileForm profile={profile} />
    </div>
  )
}
