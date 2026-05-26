/**
 * Shared status label + pill-class config for install order status values.
 * Split from install-detail-drawer to keep files under 200 lines.
 */
import type { InstallStatus } from './mock-data'

export const INSTALL_STATUS_LABEL: Record<InstallStatus, string> = {
  matched: 'Đã khớp',
  awaiting_install: 'Chờ lắp đặt',
  installed: 'Đã lắp đặt',
  disputed: 'Tranh chấp',
  terminated: 'Kết thúc',
}

export const INSTALL_STATUS_PILL: Record<InstallStatus, string> = {
  matched: 'bg-blue-100 text-blue-700',
  awaiting_install: 'bg-amber-100 text-amber-700',
  installed: 'bg-green-100 text-green-700',
  disputed: 'bg-red-100 text-red-600',
  terminated: 'bg-[#f0f0ee] text-[#666666]',
}
