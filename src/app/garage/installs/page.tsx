'use client'

/**
 * Garage Installs — install order workqueue with detail drawer.
 * Client component for interactive filter + drawer state.
 */
import { useState } from 'react'

import { PageHeader } from '@/components/shared/page-header'
import { InstallCard } from '@/components/garage/install-card'
import { InstallDetailDrawer } from '@/components/garage/install-detail-drawer'
import { MOCK_INSTALL_ORDERS } from '@/components/garage/mock-data'
import type { InstallOrder, InstallStatus } from '@/components/garage/mock-data'
import { cn } from '@/lib/utils'

type FilterKey = 'all' | 'pending' | 'active' | 'done'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'active', label: 'Đang thực hiện' },
  { key: 'done', label: 'Hoàn thành' },
]

const FILTER_STATUSES: Record<FilterKey, InstallStatus[]> = {
  all: ['matched', 'awaiting_install', 'installed', 'disputed', 'terminated'],
  pending: ['matched'],
  active: ['awaiting_install', 'disputed'],
  done: ['installed', 'terminated'],
}

export default function GarageInstallsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [selectedOrder, setSelectedOrder] = useState<InstallOrder | null>(null)

  const filtered = MOCK_INSTALL_ORDERS.filter((o) =>
    FILTER_STATUSES[activeFilter].includes(o.status),
  )

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader kicker="WORKQUEUE" title="INSTALL ORDERS" />

        {/* Filter buttons */}
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

        {/* Order grid */}
        {filtered.length === 0 ? (
          <p className="text-[14px] text-[#666666]">Không có đơn hàng phù hợp.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((order) => (
              <InstallCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
            ))}
          </div>
        )}
      </div>

      <InstallDetailDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  )
}
