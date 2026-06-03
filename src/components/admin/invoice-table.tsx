'use client'

/**
 * InvoiceTable — filterable invoice data table.
 * Uses real InvoiceRow from the admin query library.
 */
import { useState } from 'react'

import Link from 'next/link'
import { Printer } from 'lucide-react'

import type { InvoiceRow } from '@/lib/admin/queries-invoices'

import { DataTable } from './data-table'
import { InvoiceFilters } from './invoice-filters'
import type { InvoiceFilterValues } from './invoice-filters'

const KIND_STYLES: Record<string, string> = {
  driver_accrual: 'bg-blue-100 text-blue-700',
  driver_payout: 'bg-green-100 text-green-700',
  driver_withdrawal: 'bg-green-100 text-green-700',
  partner_topup: 'bg-purple-100 text-purple-700',
  partner_charge: 'bg-orange-100 text-orange-700',
  platform_fee: 'bg-[#f0f0ee] text-[#666666]',
  garage_install_payout: 'bg-green-100 text-green-700',
  adjustment: 'bg-yellow-100 text-yellow-700',
  refund: 'bg-red-100 text-red-600',
}

const STATUS_STYLES: Record<string, string> = {
  requested: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  paid: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

interface InvoiceTableProps {
  rows: InvoiceRow[]
}

export function InvoiceTable({ rows }: InvoiceTableProps) {
  const [filters, setFilters] = useState<InvoiceFilterValues>({
    dateFrom: '',
    dateTo: '',
    search: '',
  })

  const filtered = rows.filter((r) => {
    const createdDate = r.createdAt.slice(0, 10)
    if (filters.dateFrom && createdDate < filters.dateFrom) return false
    if (filters.dateTo && createdDate > filters.dateTo) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const haystack = [String(r.id), r.invoiceNumber ?? '', r.recipientName, r.note ?? '']
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  const columns = [
    {
      key: 'id' as const,
      header: 'ID',
      cell: (r: InvoiceRow) => (
        <span className="font-mono text-[12px] text-[#666666]">{r.invoiceNumber ?? r.id}</span>
      ),
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
      cell: (r: InvoiceRow) => (
        <span className="font-mono text-[12px] text-[#666666]">{r.createdAt.slice(0, 10)}</span>
      ),
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
    {
      key: 'status' as const,
      header: 'Status',
      sortValue: (r: InvoiceRow) => r.status ?? '',
      cell: (r: InvoiceRow) =>
        r.status ? (
          <span
            className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${STATUS_STYLES[r.status] ?? 'bg-[#f0f0ee] text-[#666666]'}`}
          >
            {r.status}
          </span>
        ) : (
          <span className="text-[#999]">—</span>
        ),
    },
    {
      key: 'note' as const,
      header: 'Note',
      cell: (r: InvoiceRow) => (
        <span className="max-w-[320px] text-[12px] text-[#666666]">{r.note ?? '—'}</span>
      ),
    },
    {
      key: 'printHref' as const,
      header: 'Print',
      cell: (r: InvoiceRow) =>
        r.printHref ? (
          <Link
            href={r.printHref}
            className="inline-flex h-8 items-center gap-1 rounded border border-[#cbccc9] px-2 text-[11px] font-bold tracking-[1px] text-[#1a1a1a] uppercase hover:bg-[#f7f8fa]"
          >
            <Printer className="size-3.5" aria-hidden="true" />
            Print
          </Link>
        ) : (
          <span className="text-[#999]">—</span>
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
