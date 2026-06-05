'use client'

import { useState, useTransition } from 'react'

import { ChevronDown, ChevronUp, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { EmptyState } from '@/components/shared/empty-state'
import { SectionShell } from '@/components/shared/section-shell'
import type { PartnerBalanceRow } from '@/lib/admin/queries-partner-balances'

import { topUpPartnerBalance } from './actions'

interface Props {
  rows: PartnerBalanceRow[]
}

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-600',
}

function TopUpModal({ partner, onClose }: { partner: PartnerBalanceRow; onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amountVnd = parseInt(amount.replace(/\D/g, ''), 10)
    if (!amountVnd || amountVnd <= 0) {
      toast.error('Nhập số tiền hợp lệ')
      return
    }
    startTransition(async () => {
      const r = await topUpPartnerBalance({
        partnerId: partner.id,
        amountVnd,
        note: note || undefined,
      })
      if (r.error) toast.error(r.error)
      else {
        toast.success(`Đã nạp ${amountVnd.toLocaleString('vi-VN')} ₫ cho ${partner.companyName}`)
        onClose()
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-b border-[#cbccc9] px-5 py-4">
          <h2 className="text-[15px] font-bold text-[#1a1a1a]">Nạp tiền — {partner.companyName}</h2>
          <p className="mt-0.5 text-[12px] text-[#666666]">
            Số dư hiện tại: <strong>{partner.balanceVnd.toLocaleString('vi-VN')} ₫</strong>
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 px-5 py-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                Số tiền (VND) *
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1,000,000"
                autoFocus
                required
                className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] px-3 font-mono text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                Ghi chú
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Chuyển khoản ngày 02/06"
                className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] focus:ring-2 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 border-t border-[#cbccc9] px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded border border-[#cbccc9] py-2 text-[13px] font-medium text-[#666666] hover:bg-[#f7f8fa]"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded bg-green-600 py-2 text-[13px] font-bold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {pending ? 'Đang xử lý…' : 'Xác nhận nạp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function PartnerBalancesClient({ rows }: Props) {
  const [topping, setTopping] = useState<PartnerBalanceRow | null>(null)
  const [expandedPartnerIds, setExpandedPartnerIds] = useState<Set<string>>(new Set())

  function toggleExpanded(partnerId: string) {
    setExpandedPartnerIds((current) => {
      const next = new Set(current)
      if (next.has(partnerId)) next.delete(partnerId)
      else next.add(partnerId)
      return next
    })
  }

  if (rows.length === 0)
    return <EmptyState kicker="empty" title="No Partners" helper="No partner accounts found." />

  return (
    <>
      <SectionShell title={`Partners (${rows.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#f7f8fa]">
              <tr>
                {[
                  'Công ty',
                  'Người liên hệ',
                  'Email',
                  'Trạng thái',
                  'Campaigns',
                  'Số dư (VND)',
                  '',
                ].map((h) => (
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
              {rows.map((p, i) => {
                const expanded = expandedPartnerIds.has(p.id)
                const visibleCampaigns = expanded ? p.campaigns : p.campaigns.slice(0, 2)

                return (
                  <tr
                    key={p.id}
                    className={`border-b border-[#cbccc9] last:border-0 ${i % 2 === 1 ? 'bg-[#f7f8fa]' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-[#1a1a1a]">{p.companyName}</td>
                    <td className="px-4 py-3 text-[#666666]">{p.contactName}</td>
                    <td className="px-4 py-3 text-[#666666]">{p.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${STATUS_STYLES[p.status] ?? 'bg-[#f0f0ee] text-[#666666]'}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {visibleCampaigns.length === 0 ? (
                          <span className="text-[12px] text-[#999]">—</span>
                        ) : (
                          visibleCampaigns.map((campaign) => (
                            <p key={campaign.id} className="text-[12px] text-[#1a1a1a]">
                              {campaign.name}
                              <span className="ml-1 text-[#999]">
                                ({campaign.status.replace(/_/g, ' ')})
                              </span>
                            </p>
                          ))
                        )}
                        {p.campaignCount > 2 && (
                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => toggleExpanded(p.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold tracking-[1px] text-[#1a1a1a] uppercase hover:text-[#ff5c00]"
                            >
                              {expanded ? (
                                <ChevronUp className="size-3" aria-hidden="true" />
                              ) : (
                                <ChevronDown className="size-3" aria-hidden="true" />
                              )}
                              {expanded ? 'Collapse' : `Expand (${p.campaignCount})`}
                            </button>
                            <Link
                              href={`/admin/${p.id}/contracts`}
                              className="text-[11px] font-bold tracking-[1px] text-[#ff5c00] uppercase"
                            >
                              Partner page
                            </Link>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] font-bold text-[#1a1a1a]">
                      {p.balanceVnd.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setTopping(p)}
                        className="flex items-center gap-1.5 rounded border border-green-200 px-3 py-1.5 text-[12px] font-medium text-green-700 transition-colors hover:bg-green-50"
                      >
                        <PlusCircle className="size-3.5" aria-hidden="true" /> Nạp tiền
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SectionShell>

      {topping && <TopUpModal partner={topping} onClose={() => setTopping(null)} />}
    </>
  )
}
