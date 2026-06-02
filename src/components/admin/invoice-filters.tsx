'use client'

/**
 * InvoiceFilters — shared filter row for the 3 invoice pages.
 * Client state lifted via callback. Native inputs for KISS.
 */
export interface InvoiceFilterValues {
  dateFrom: string
  dateTo: string
  search: string
}

interface InvoiceFiltersProps {
  values: InvoiceFilterValues
  onChange: (values: InvoiceFilterValues) => void
}

export function InvoiceFilters({ values, onChange }: InvoiceFiltersProps) {
  function set<K extends keyof InvoiceFilterValues>(key: K, val: InvoiceFilterValues[K]) {
    onChange({ ...values, [key]: val })
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Date from */}
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          From
        </span>
        <input
          type="date"
          value={values.dateFrom}
          onChange={(e) => set('dateFrom', e.target.value)}
          className="focus:ring-primary rounded border border-[#cbccc9] px-3 py-2 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
        />
      </label>

      {/* Date to */}
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">To</span>
        <input
          type="date"
          value={values.dateTo}
          onChange={(e) => set('dateTo', e.target.value)}
          className="focus:ring-primary rounded border border-[#cbccc9] px-3 py-2 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
        />
      </label>

      {/* Search */}
      <label className="flex min-w-[180px] flex-1 flex-col gap-1">
        <span className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          Search
        </span>
        <input
          type="search"
          placeholder="Name, cohort, ID…"
          value={values.search}
          onChange={(e) => set('search', e.target.value)}
          className="focus:ring-primary rounded border border-[#cbccc9] px-3 py-2 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
        />
      </label>
    </div>
  )
}
