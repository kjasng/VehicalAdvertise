/**
 * Audit Log — chronological record of all admin actions.
 * Server component: filters via URL params (?action=, ?from=, ?to=, ?limit=).
 * No client state needed — GET form submission drives filtering.
 */
import { Filter } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { AUDIT_ACTIONS, getAuditLog } from '@/lib/admin/queries-audit-log'

export const metadata = { title: 'Admin · Audit Log' }

const ACTION_BADGE: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  blocked: 'bg-red-100 text-red-600',
  created: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
}

function actionStyle(action: string): string {
  for (const [key, cls] of Object.entries(ACTION_BADGE)) {
    if (action.includes(key)) return cls
  }
  return 'bg-[#f0f0ee] text-[#666666]'
}

interface PageProps {
  searchParams: Promise<{ action?: string; from?: string; to?: string; limit?: string }>
}

export default async function AuditLogPage({ searchParams }: PageProps) {
  const { action, from, to, limit: limitStr } = await searchParams
  const limit = Math.min(Math.max(Number(limitStr) || 100, 10), 500)

  const rows = await getAuditLog({
    action: action || undefined,
    from: from || undefined,
    to: to || undefined,
    limit,
  })

  const showMore = rows.length === limit

  return (
    <div className="space-y-6">
      <PageHeader kicker="System" title="Audit Log" />

      {/* Filter form — pure GET, no JS required */}
      <form method="get" action="/admin/audit-log" className="flex flex-wrap items-end gap-3">
        {/* Action filter */}
        <div className="space-y-1">
          <label
            htmlFor="action-filter"
            className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase"
          >
            Action
          </label>
          <select
            id="action-filter"
            name="action"
            defaultValue={action ?? ''}
            className="focus:ring-primary rounded border border-[#cbccc9] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
          >
            <option value="">All actions</option>
            {AUDIT_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="space-y-1">
          <label
            htmlFor="from-filter"
            className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase"
          >
            From
          </label>
          <input
            id="from-filter"
            type="date"
            name="from"
            defaultValue={from ?? ''}
            className="focus:ring-primary rounded border border-[#cbccc9] px-3 py-2 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="to-filter"
            className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase"
          >
            To
          </label>
          <input
            id="to-filter"
            type="date"
            name="to"
            defaultValue={to ?? ''}
            className="focus:ring-primary rounded border border-[#cbccc9] px-3 py-2 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 rounded border border-[#1a1a1a] bg-[#1a1a1a] px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-[#333]"
        >
          <Filter className="size-3.5" aria-hidden="true" />
          Filter
        </button>

        {(action || from || to) && (
          <a
            href="/admin/audit-log"
            className="rounded border border-[#cbccc9] px-4 py-2 text-[12px] font-medium text-[#666666] transition-colors hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
          >
            Clear
          </a>
        )}
      </form>

      {/* Log table */}
      <SectionShell title={`Entries (${rows.length}${showMore ? '+' : ''})`}>
        {rows.length === 0 ? (
          <EmptyState
            kicker="empty"
            title="No Entries"
            helper="Audit log entries will appear here as admin actions are taken."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-[#f7f8fa]">
                  <tr>
                    {['Timestamp', 'Actor', 'Action', 'Entity', 'Diff'].map((h) => (
                      <th
                        key={h}
                        className="border-b border-[#cbccc9] px-4 py-3 text-left text-[12px] font-extrabold tracking-[1.5px] text-[#1a1a1a] uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`border-b border-[#cbccc9] last:border-0 ${i % 2 === 1 ? 'bg-[#f7f8fa]' : ''}`}
                    >
                      <td className="px-4 py-3 font-mono text-[12px] whitespace-nowrap text-[#666666]">
                        {row.ts.slice(0, 16).replace('T', ' ')}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#1a1a1a]">{row.actorName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${actionStyle(row.action)}`}
                        >
                          {row.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#666666]">
                        <span className="font-medium text-[#1a1a1a]">{row.entityType}</span>
                        {row.entityId && (
                          <span className="ml-1 font-mono text-[11px] text-[#999]">
                            {row.entityId.slice(0, 8)}…
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.diff && Object.keys(row.diff).length > 0 ? (
                          <details className="max-w-[260px]">
                            <summary className="cursor-pointer text-[11px] font-bold tracking-[1px] text-[#666666] uppercase hover:text-[#1a1a1a]">
                              View diff
                            </summary>
                            <pre className="mt-1 overflow-auto rounded bg-[#f7f8fa] p-2 text-[11px] leading-[1.4] text-[#1a1a1a]">
                              {JSON.stringify(row.diff, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-[#999]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load more — bumps ?limit= to fetch more rows */}
            {showMore && (
              <div className="mt-4 flex justify-center border-t border-[#cbccc9] pt-4">
                <a
                  href={`/admin/audit-log?${new URLSearchParams({ ...(action ? { action } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}), limit: String(limit + 100) }).toString()}`}
                  className="rounded border border-[#cbccc9] px-5 py-2 text-[12px] font-bold text-[#666666] transition-colors hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
                >
                  Load more
                </a>
              </div>
            )}
          </>
        )}
      </SectionShell>
    </div>
  )
}
