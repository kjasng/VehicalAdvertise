/**
 * Shared status label + pill-class config for install order status values.
 * Split from install-detail-drawer to keep files under 200 lines.
 */
import type { GarageInstallStatus } from '@/lib/garage/types'

export const INSTALL_STATUS_LABEL: Record<GarageInstallStatus, string> = {
  waiting_install: 'Chờ lắp đặt',
  waiting_review: 'Chờ admin duyệt',
  approved: 'Đã duyệt',
  rejected: 'Cần upload lại',
  closed: 'Đã đóng',
}

export const INSTALL_STATUS_PILL: Record<GarageInstallStatus, string> = {
  waiting_install: 'bg-amber-100 text-amber-700',
  waiting_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  closed: 'bg-[#f0f0ee] text-[#666666]',
}
