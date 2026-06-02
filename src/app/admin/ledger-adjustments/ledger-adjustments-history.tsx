import { EmptyState } from '@/components/shared/empty-state'
import type { LedgerAdjustmentRow } from '@/lib/admin/queries-ledger-adjustments'

interface Props {
  history: LedgerAdjustmentRow[]
}

const KIND_STYLE: Record<string, string> = {
  adjustment: 'bg-blue-100 text-blue-700',
  refund: 'bg-purple-100 text-purple-700',
}

export function LedgerAdjustmentsHistory({ history }: Props) {
  if (history.length === 0) {
    return <EmptyState kicker="empty" title="Chưa có" helper="Chưa có điều chỉnh sổ cái nào." />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead className="bg-[#f7f8fa]">
          <tr>
            {['Thời gian', 'Loại', 'Đối tượng', 'Số tiền (VND)', 'Lý do'].map((header) => (
              <th
                key={header}
                className="border-b border-[#cbccc9] px-4 py-3 text-left text-[12px] font-extrabold tracking-[1.5px] text-[#1a1a1a] uppercase"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {history.map((row, index) => (
            <tr
              key={row.id}
              className={`border-b border-[#cbccc9] last:border-0 ${index % 2 === 1 ? 'bg-[#f7f8fa]' : ''}`}
            >
              <td className="px-4 py-3 font-mono text-[12px] whitespace-nowrap text-[#666666]">
                {row.ts.slice(0, 16).replace('T', ' ')}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${KIND_STYLE[row.kind] ?? ''}`}
                >
                  {row.kind}
                </span>
              </td>
              <td className="px-4 py-3 text-[#1a1a1a]">
                <span className="font-medium">{row.targetName}</span>
                <span className="ml-1 text-[11px] text-[#999]">({row.targetType})</span>
              </td>
              <td
                className={`px-4 py-3 font-mono text-[13px] font-bold ${row.amountVnd < 0 ? 'text-red-600' : 'text-green-700'}`}
              >
                {row.amountVnd > 0 ? '+' : ''}
                {row.amountVnd.toLocaleString('vi-VN')} ₫
              </td>
              <td className="px-4 py-3 text-[12px] text-[#666666]">{row.note ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
