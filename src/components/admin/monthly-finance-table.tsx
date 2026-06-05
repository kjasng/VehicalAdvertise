'use client'

import { useState } from 'react'

import type { FinanceMetricKey, MonthlyFinancePoint } from '@/lib/admin/queries-reports'

const METRICS: { key: FinanceMetricKey; label: string }[] = [
  { key: 'driverPaidVnd', label: 'Paid to drivers' },
  { key: 'partnerReceivedVnd', label: 'Received from partners' },
  { key: 'garagePaidVnd', label: 'Paid to garages' },
  { key: 'netProfitVnd', label: 'Net profit' },
]

export function MonthlyFinanceTable({ rows }: { rows: MonthlyFinancePoint[] }) {
  const [visible, setVisible] = useState<Record<FinanceMetricKey, boolean>>({
    driverPaidVnd: true,
    partnerReceivedVnd: true,
    garagePaidVnd: true,
    netProfitVnd: true,
  })

  const selected = METRICS.filter((metric) => visible[metric.key])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {METRICS.map((metric) => (
          <label
            key={metric.key}
            className="flex items-center gap-2 rounded border border-[#cbccc9] bg-white px-3 py-2 text-[12px] font-bold text-[#1a1a1a]"
          >
            <input
              type="checkbox"
              checked={visible[metric.key]}
              onChange={(event) =>
                setVisible((current) => ({ ...current, [metric.key]: event.target.checked }))
              }
            />
            {metric.label}
          </label>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-[#f7f8fa]">
            <tr>
              <th className="border-b border-[#cbccc9] px-4 py-3 text-left text-[12px] font-extrabold tracking-[1.5px] text-[#1a1a1a] uppercase">
                Month
              </th>
              {selected.map((metric) => (
                <th
                  key={metric.key}
                  className="border-b border-[#cbccc9] px-4 py-3 text-left text-[12px] font-extrabold tracking-[1.5px] text-[#1a1a1a] uppercase"
                >
                  {metric.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.month}
                className={`border-b border-[#cbccc9] last:border-0 ${index % 2 === 1 ? 'bg-[#f7f8fa]' : ''}`}
              >
                <td className="px-4 py-3 font-mono text-[12px] font-bold">{row.month}</td>
                {selected.map((metric) => (
                  <td key={metric.key} className="px-4 py-3 font-mono text-[12px]">
                    {row[metric.key].toLocaleString('vi-VN')} ₫
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
