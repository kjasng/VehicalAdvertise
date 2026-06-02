'use client'

import { useState } from 'react'

import { Plus } from 'lucide-react'

import { SectionShell } from '@/components/shared/section-shell'
import type { LedgerAdjustmentRow, LedgerTarget } from '@/lib/admin/queries-ledger-adjustments'

import { LedgerAdjustmentModal } from './ledger-adjustment-modal'
import { LedgerAdjustmentsHistory } from './ledger-adjustments-history'

interface Props {
  history: LedgerAdjustmentRow[]
  targets: LedgerTarget[]
}

export function LedgerAdjustmentsClient({ history, targets }: Props) {
  const [creating, setCreating] = useState(false)

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setCreating(true)}
          className="focus-visible:ring-primary flex cursor-pointer items-center gap-1.5 rounded bg-[#1a1a1a] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#333] focus-visible:ring-2 focus-visible:outline-none"
        >
          <Plus className="size-3.5" aria-hidden="true" /> Điều chỉnh mới
        </button>
      </div>

      <SectionShell title={`Lịch sử điều chỉnh (${history.length})`}>
        <LedgerAdjustmentsHistory history={history} />
      </SectionShell>

      {creating && <LedgerAdjustmentModal targets={targets} onClose={() => setCreating(false)} />}
    </>
  )
}
