'use client'

/**
 * DataTable — generic pencil-styled table.
 * Sticky header, zebra rows, click-to-sort on any column.
 */
import { useState } from 'react'

import { ChevronUp, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface ColumnDef<T> {
  key: keyof T | string
  header: string
  /** Custom cell renderer. Receives the row. */
  cell?: (row: T) => React.ReactNode
  /** Allow sorting on this column. Provide a comparator value extractor. */
  sortValue?: (row: T) => string | number
  className?: string
}

interface DataTableProps<T> {
  rows: T[]
  columns: ColumnDef<T>[]
  /** Called when a row is clicked */
  rowAction?: (row: T) => void
  rowKey: (row: T) => string
  emptyMessage?: string
}

type SortDir = 'asc' | 'desc'

export function DataTable<T>({
  rows,
  columns,
  rowAction,
  rowKey,
  emptyMessage = 'No records found.',
}: DataTableProps<T>) {
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(colKey: string) {
    if (sortCol === colKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(colKey)
      setSortDir('asc')
    }
  }

  const sorted = [...rows].sort((a, b) => {
    if (!sortCol) return 0
    const col = columns.find((c) => String(c.key) === sortCol)
    if (!col?.sortValue) return 0
    const av = col.sortValue(a)
    const bv = col.sortValue(b)
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="overflow-x-auto rounded-md border border-[#cbccc9]">
      <table className="w-full border-collapse text-[13px]">
        {/* Sticky header */}
        <thead className="sticky top-0 z-10 bg-[#f7f8fa]">
          <tr>
            {columns.map((col) => {
              const key = String(col.key)
              const isSorted = sortCol === key
              const sortable = !!col.sortValue

              return (
                <th
                  key={key}
                  scope="col"
                  onClick={sortable ? () => handleSort(key) : undefined}
                  className={cn(
                    'border-b border-[#cbccc9] px-4 py-3 text-left text-[12px] font-extrabold tracking-[1.5px] text-[#666666] uppercase select-none',
                    sortable && 'cursor-pointer hover:bg-[#edeeed]',
                    col.className,
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortable &&
                      isSorted &&
                      (sortDir === 'asc' ? (
                        <ChevronUp className="size-3" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="size-3" aria-hidden="true" />
                      ))}
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-[13px] text-[#666666]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row, idx) => (
              <tr
                key={rowKey(row)}
                onClick={rowAction ? () => rowAction(row) : undefined}
                className={cn(
                  'border-b border-[#cbccc9] transition-colors last:border-0',
                  idx % 2 === 1 && 'bg-[#f7f8fa]',
                  rowAction && 'hover:bg-primary/5 cursor-pointer',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn('px-4 py-3 text-[#1a1a1a]', col.className)}
                  >
                    {col.cell
                      ? col.cell(row)
                      : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
