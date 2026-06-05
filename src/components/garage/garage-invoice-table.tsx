'use client'

/**
 * GarageInvoiceTable — paid withdrawals rendered as invoices.
 * Each paid payout becomes a printable invoice row.
 */
import Link from 'next/link'
import { Printer } from 'lucide-react'

import { formatVnd } from '@/lib/garage/format'
import type { GarageWithdrawalRow } from '@/lib/garage/types'

export function GarageInvoiceTable({ invoices }: { invoices: GarageWithdrawalRow[] }) {
  if (invoices.length === 0) {
    return <p className="px-5 py-6 text-[14px] text-[#666666]">Chưa có hoá đơn trong kỳ đã chọn.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-[#cbccc9] text-[11px] font-bold tracking-[1px] text-[#666666] uppercase">
            <th className="px-5 py-3">Số hoá đơn</th>
            <th className="px-5 py-3">Ngày thanh toán</th>
            <th className="px-5 py-3 text-right">Số tiền</th>
            <th className="px-5 py-3 text-right">Hoá đơn</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f0ee]">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-[#f7f8fa]">
              <td className="px-5 py-3 font-semibold text-[#1a1a1a]">{invoice.withdrawalNumber}</td>
              <td className="px-5 py-3 text-[#666666]">
                {(invoice.paidAt ?? invoice.requestedAt).slice(0, 10)}
              </td>
              <td className="font-heading px-5 py-3 text-right text-[16px] text-[#1a1a1a]">
                {formatVnd(invoice.amountVnd)}
              </td>
              <td className="px-5 py-3 text-right">
                <Link
                  href={`/garage/payout/${invoice.id}/print`}
                  className="inline-flex h-8 items-center gap-1 rounded border border-[#cbccc9] px-2 text-[11px] font-bold tracking-[1px] text-[#1a1a1a] uppercase hover:bg-[#f0f0ee]"
                >
                  <Printer className="size-3.5" aria-hidden="true" />
                  In
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
