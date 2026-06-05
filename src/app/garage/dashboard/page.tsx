import Link from 'next/link'
import { redirect } from 'next/navigation'

import { InstallCard } from '@/components/garage/install-card'
import { EmptyState } from '@/components/shared/empty-state'
import { KpiCard } from '@/components/shared/kpi-card'
import { PageHeader } from '@/components/shared/page-header'
import { formatVnd } from '@/lib/garage/format'
import { getGarageProfile } from '@/lib/garage/queries-context'
import { getGarageInstallJobs } from '@/lib/garage/queries-installs'

export const metadata = { title: 'Garage · Dashboard' }

export default async function GarageDashboardPage() {
  const [profile, jobs] = await Promise.all([getGarageProfile(), getGarageInstallJobs()])
  if (!profile) redirect('/login')

  if (!profile.approved) {
    return (
      <div className="space-y-6">
        <PageHeader kicker="OVERVIEW" title="DASHBOARD" />
        <EmptyState
          kicker="pending"
          title="Waiting Approval"
          helper="Admin cần duyệt garage trước khi bạn nhận job lắp decal và setup payout."
        />
      </div>
    )
  }

  const waitingInstall = jobs.filter((job) => job.status === 'waiting_install').length
  const waitingReview = jobs.filter((job) => job.status === 'waiting_review').length
  const approved = jobs.filter((job) => job.status === 'approved').length
  const actionable = jobs.filter(
    (job) => job.status === 'waiting_install' || job.status === 'rejected',
  )

  return (
    <div className="flex flex-col gap-8">
      <PageHeader kicker="OVERVIEW" title="DASHBOARD" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Link href="/garage/installs?status=pending" className="block hover:opacity-90">
          <KpiCard label="Chờ lắp" value={waitingInstall} />
        </Link>
        <Link href="/garage/installs?status=review" className="block hover:opacity-90">
          <KpiCard label="Chờ admin duyệt" value={waitingReview} />
        </Link>
        <Link href="/garage/installs?status=done" className="block hover:opacity-90">
          <KpiCard label="Đã approve" value={approved} />
        </Link>
        <KpiCard label="Balance" value={formatVnd(profile.balanceVnd)} />
      </div>

      <section aria-labelledby="today-heading">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2
            id="today-heading"
            className="text-[12px] font-extrabold tracking-[1.5px] text-[#666666] uppercase"
          >
            Job cần xử lý
          </h2>
          <Link href="/garage/installs" className="text-[12px] font-bold text-[#ff5c00]">
            Xem tất cả
          </Link>
        </div>

        {actionable.length === 0 ? (
          <p className="text-[14px] text-[#666666]">Không có job lắp decal cần xử lý.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actionable.slice(0, 6).map((order) => (
              <InstallCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
