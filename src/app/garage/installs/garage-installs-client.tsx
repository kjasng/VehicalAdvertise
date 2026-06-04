'use client'

import { useState } from 'react'

import { InstallCard } from '@/components/garage/install-card'
import { InstallDetailDrawer } from '@/components/garage/install-detail-drawer'
import type { GarageInstallJob, GarageInstallStatus } from '@/lib/garage/types'
import { cn } from '@/lib/utils'

type FilterKey = 'all' | 'pending' | 'review' | 'done'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ lắp' },
  { key: 'review', label: 'Chờ duyệt' },
  { key: 'done', label: 'Hoàn thành' },
]

const FILTER_STATUSES: Record<FilterKey, GarageInstallStatus[]> = {
  all: ['waiting_install', 'waiting_review', 'approved', 'rejected', 'closed'],
  pending: ['waiting_install', 'rejected'],
  review: ['waiting_review'],
  done: ['approved', 'closed'],
}

export function GarageInstallsClient({ jobs }: { jobs: GarageInstallJob[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [selectedOrder, setSelectedOrder] = useState<GarageInstallJob | null>(null)
  const filtered = jobs.filter((job) => FILTER_STATUSES[activeFilter].includes(job.status))

  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc đơn hàng">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveFilter(key)}
            aria-pressed={activeFilter === key}
            className={cn(
              'rounded-md px-4 py-2 text-[13px] font-bold tracking-[0.5px] transition-colors duration-150',
              'focus-visible:ring-2 focus-visible:ring-[#ff5c00] focus-visible:ring-offset-2 focus-visible:outline-none',
              activeFilter === key
                ? 'bg-[#ff5c00] text-white'
                : 'border border-[#cbccc9] bg-white text-[#1a1a1a] hover:bg-[#f7f8fa]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[14px] text-[#666666]">Không có đơn hàng phù hợp.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((order) => (
            <InstallCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
          ))}
        </div>
      )}

      <InstallDetailDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  )
}
