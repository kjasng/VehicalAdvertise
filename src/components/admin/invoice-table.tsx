'use client'

/**
 * InvoiceTable — filterable invoice data table.
 * Combines InvoiceFilters + DataTable with client-side filter state.
 */
import { useState } from 'react'

import { DataTable } from './data-table'
import { InvoiceFilters } from './invoice-filters'
import type { InvoiceFilterValues } from './invoice-filters'
import type { InvoiceRow } from './mock-data'

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-[#f0f0ee] text-[#666666]',
  issued: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-600',
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
    if (filters.status && r.status !== filters.status) return false
    if (filters.dateFrom && r.issuedAt < filters.dateFrom) return false
    if (filters.dateTo && r.issuedAt > filters.dateTo) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (
        !r.recipientName.toLowerCase().includes(q) &&
        !r.cohort.toLowerCase().includes(q) &&
        !r.id.toLowerCase().includes(q)
      )
        return false
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
    { key: 'cohort' as const, header: 'Cohort', sortValue: (r: InvoiceRow) => r.cohort },
    {
      key: 'amountVnd' as const,
      header: 'Amount (VND)',
      sortValue: (r: InvoiceRow) => r.amountVnd,
      cell: (r: InvoiceRow) => (
        <span className="font-mono text-[13px]">{r.amountVnd.toLocaleString('vi-VN')}</span>
      ),
    },
    { key: 'issuedAt' as const, header: 'Issued', sortValue: (r: InvoiceRow) => r.issuedAt },
    {
      key: 'status' as const,
      header: 'Status',
      sortValue: (r: InvoiceRow) => r.status,
      cell: (r: InvoiceRow) => (
        <span
          className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${STATUS_STYLES[r.status] ?? ''}`}
        >
          {r.status}
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
        rowKey={(r) => r.id}
        emptyMessage="No invoices match the current filters."
      />
    </div>
  )
}
