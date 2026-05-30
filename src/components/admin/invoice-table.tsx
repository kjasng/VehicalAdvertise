'use client'

/**
 * InvoiceTable — filterable invoice data table.
 * Uses real InvoiceRow from the admin query library.
 */
import { useState } from 'react'

import type { InvoiceRow } from '@/lib/admin/queries-invoices'

import { DataTable } from './data-table'
import { InvoiceFilters } from './invoice-filters'
import type { InvoiceFilterValues } from './invoice-filters'

const KIND_STYLES: Record<string, string> = {
  driver_accrual: 'bg-blue-100 text-blue-700',
  driver_payout: 'bg-green-100 text-green-700',
  partner_topup: 'bg-purple-100 text-purple-700',
  partner_charge: 'bg-orange-100 text-orange-700',
  platform_fee: 'bg-[#f0f0ee] text-[#666666]',
  adjustment: 'bg-yellow-100 text-yellow-700',
  refund: 'bg-red-100 text-red-600',
}

interface InvoiceTableProps {
  rows: InvoiceRow[]
}

export function InvoiceTable({ rows }: InvoiceTableProps) {
  const [filters, setFilters] = useState<InvoiceFilterValues>({
    dateFrom: '',
    dateTo: '',
    status: '',
    search: '',
  })

  const filtered = rows.filter((r) => {
    // status filter maps to kind for real data
    if (filters.status && r.kind !== filters.status) return false
    if (filters.dateFrom && r.createdAt < filters.dateFrom) return false
    if (filters.dateTo && r.createdAt > filters.dateTo) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!r.recipientName.toLowerCase().includes(q) && !String(r.id).includes(q)) return false
    }
    return true
  })

  const columns = [
    {
      key: 'id' as const,
      header: 'ID',
      cell: (r: InvoiceRow) => <span className="font-mono text-[12px] text-[#666666]">{r.id}</span>,
    },
    {
      key: 'recipientName' as const,
      header: 'Recipient',
      sortValue: (r: InvoiceRow) => r.recipientName,
      cell: (r: InvoiceRow) => (
        <span className="font-medium text-[#1a1a1a]">{r.recipientName}</span>
      ),
    },
    {
      key: 'amountVnd' as const,
      header: 'Amount (VND)',
      sortValue: (r: InvoiceRow) => r.amountVnd,
      cell: (r: InvoiceRow) => (
        <span className="font-mono text-[13px]">{r.amountVnd.toLocaleString('vi-VN')}</span>
      ),
    },
    {
      key: 'createdAt' as const,
      header: 'Date',
      sortValue: (r: InvoiceRow) => r.createdAt,
    },
    {
      key: 'kind' as const,
      header: 'Kind',
      sortValue: (r: InvoiceRow) => r.kind,
      cell: (r: InvoiceRow) => (
        <span
          className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${KIND_STYLES[r.kind] ?? 'bg-[#f0f0ee] text-[#666666]'}`}
        >
          {r.kind.replace(/_/g, ' ')}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <InvoiceFilters values={filters} onChange={setFilters} />
      <DataTable
        rows={filtered}
        columns={columns}
        rowKey={(r) => String(r.id)}
        emptyMessage="No invoices match the current filters."
      />
    </div>
  )
}
