'use client'

import { useMemo, useState, useTransition } from 'react'

import Link from 'next/link'

import { ChevronDown, ChevronRight, ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/shared/empty-state'
import { SectionShell } from '@/components/shared/section-shell'
import type {
  AvailableDriverRow,
  CampaignMatchRow,
  ContractRow,
} from '@/lib/admin/queries-contracts'

import {
  advanceContractStatus,
  createContract,
  removeContractAssignment,
  terminateContract,
  updateContractAssignment,
} from './actions'

// ── Status styles ──────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-[#f0f0ee] text-[#666666]',
  submitted: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-600',
  cancelled: 'bg-red-100 text-red-600',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  matched: 'bg-yellow-100 text-yellow-700',
  awaiting_install: 'bg-orange-100 text-orange-700',
  installed: 'bg-blue-100 text-blue-700',
  running: 'bg-green-100 text-green-700',
  completed: 'bg-[#f0f0ee] text-[#666666]',
  terminated: 'bg-red-100 text-red-600',
  disputed: 'bg-red-100 text-red-600',
}

const NEXT_LABEL: Record<string, string> = {
  matched: 'Mark Awaiting Install',
  awaiting_install: 'Mark Installed',
  installed: 'Mark Running',
  running: 'Mark Completed',
}

type ContractPartyFilter = 'all' | 'partner_admin' | 'driver_admin' | 'garage_admin'
type FilteredCampaignRow = { campaign: CampaignMatchRow; contracts: ContractRow[] }

const PARTY_OPTIONS: { value: ContractPartyFilter; label: string }[] = [
  { value: 'all', label: 'All campaign assignments' },
  { value: 'partner_admin', label: 'Partner - Admin/Agency' },
  { value: 'garage_admin', label: 'Garage - Admin/Agency' },
  { value: 'driver_admin', label: 'Driver - Admin/Agency' },
]

function matchesText(parts: Array<string | number | null | undefined>, query: string) {
  if (!query) return true
  return parts.filter(Boolean).join(' ').toLowerCase().includes(query)
}

// ── Driver Assignment Modal ────────────────────────────────────────────────

function DriverAssignmentModal({
  campaign,
  contract,
  drivers,
  contractIds,
  onClose,
}: {
  campaign?: CampaignMatchRow
  contract?: ContractRow
  drivers: AvailableDriverRow[]
  contractIds: Set<string> // driver IDs already in this campaign
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [driverId, setDriverId] = useState(contract?.driverId ?? '')
  const [vehicleId, setVehicleId] = useState(contract?.vehicleId ?? '')

  const selected = drivers.find((d) => d.id === driverId)
  const approvedVehicles =
    selected?.vehicles.filter((v) => v.approved || v.id === contract?.vehicleId) ?? []
  const modalTitle = contract ? 'Edit Driver' : 'Match Driver'
  const modalSubtitle = contract?.campaignName || campaign?.name || ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!driverId) {
      toast.error('Chọn driver')
      return
    }
    startTransition(async () => {
      if (!vehicleId) {
        toast.error('Chọn xe')
        return
      }

      const cr = contract
        ? await updateContractAssignment({
            contractId: contract.id,
            driverId,
            vehicleId,
          })
        : await createContract({
            campaignId: campaign?.id,
            driverId,
            vehicleId,
          })
      if (cr.error) toast.error(cr.error)
      else {
        toast.success(contract ? 'Campaign assignment updated' : 'Campaign assignment created')
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
        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-[#cbccc9] px-5 py-4">
          <div>
            <h2 className="text-[15px] font-bold text-[#1a1a1a]">{modalTitle}</h2>
            <p className="text-[12px] text-[#666666]">{modalSubtitle}</p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-[#999] hover:bg-[#f0f0ee]">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          {/* Driver select */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Driver *
            </label>
            <select
              value={driverId}
              onChange={(e) => {
                const nextDriverId = e.target.value
                setDriverId(nextDriverId)
                setVehicleId(nextDriverId === contract?.driverId ? contract.vehicleId : '')
              }}
              className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] bg-white px-3 text-[13px] focus:ring-2 focus:outline-none"
            >
              <option value="">-- Chọn driver --</option>
              {drivers
                .filter((d) => d.id === contract?.driverId || !contractIds.has(d.id))
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} {d.phone ? `(${d.phone})` : ''}
                  </option>
                ))}
            </select>
          </div>

          {selected && (
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                Xe *
              </label>
              {approvedVehicles.length > 0 ? (
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] bg-white px-3 text-[13px] focus:ring-2 focus:outline-none"
                >
                  <option value="">-- Chọn xe --</option>
                  {approvedVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="rounded border border-yellow-200 bg-yellow-50 px-3 py-2 text-[12px] text-yellow-800">
                  Driver chưa có xe approved. Driver cần cập nhật xe trong hồ sơ cá nhân trước khi
                  assign vào campaign.
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 border-t border-[#cbccc9] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded border border-[#cbccc9] py-2 text-[13px] font-medium text-[#666666] hover:bg-[#f7f8fa]"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={pending || !driverId || !vehicleId}
              className="flex-1 rounded bg-[#1a1a1a] py-2 text-[13px] font-bold text-white hover:bg-[#333] disabled:opacity-50"
            >
              {pending ? 'Đang lưu…' : contract ? 'Lưu assignment' : 'Tạo assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Assignment table ──────────────────────────────────────────────────────

export function CampaignAssignmentsTable({
  contracts,
  drivers,
}: {
  contracts: ContractRow[]
  drivers: AvailableDriverRow[]
}) {
  const [pending, startTransition] = useTransition()
  const [editing, setEditing] = useState<ContractRow | null>(null)
  const contractedDriverIds = useMemo(() => new Set(contracts.map((c) => c.driverId)), [contracts])

  function advance(contractId: string) {
    startTransition(async () => {
      const r = await advanceContractStatus({ contractId })
      if (r.error) toast.error(r.error)
      else toast.success('Status updated')
    })
  }

  function terminate(contractId: string) {
    startTransition(async () => {
      const r = await terminateContract({ contractId })
      if (r.error) toast.error(r.error)
      else toast.success('Campaign assignment terminated')
    })
  }

  function remove(contract: ContractRow) {
    if (!window.confirm(`Remove ${contract.driverName} from this campaign?`)) return
    startTransition(async () => {
      const r = await removeContractAssignment({ contractId: contract.id })
      if (r.error) toast.error(r.error)
      else toast.success('Driver removed from campaign')
    })
  }

  return (
    <>
      <table className="w-full text-[13px]">
        <thead className="bg-[#f7f8fa]">
          <tr>
            {['Driver', 'Biển số', 'Garage', 'Status', ''].map((h) => (
              <th
                key={h}
                className="px-4 py-2 text-left text-[11px] font-extrabold tracking-[1.5px] text-[#1a1a1a] uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contracts.map((c) => {
            const canEdit = !['running', 'completed', 'terminated'].includes(c.status)
            return (
              <tr key={c.id} className="border-t border-[#f0f0ee]">
                <td className="px-4 py-2 font-medium text-[#1a1a1a]">{c.driverName}</td>
                <td className="px-4 py-2 font-mono text-[#666666]">{c.vehiclePlate}</td>
                <td className="px-4 py-2 text-[#666666]">{c.garageName ?? '—'}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase ${STATUS_STYLE[c.status] ?? ''}`}
                  >
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      disabled={pending || !canEdit}
                      onClick={() => setEditing(c)}
                      className="inline-flex items-center gap-1 rounded border border-[#cbccc9] px-2 py-1 text-[11px] font-medium text-[#1a1a1a] hover:bg-[#f0f0ee] disabled:opacity-50"
                    >
                      <Pencil className="size-3" /> Edit
                    </button>
                    {NEXT_LABEL[c.status] && (
                      <button
                        disabled={pending}
                        onClick={() => advance(c.id)}
                        className="rounded border border-[#cbccc9] px-2 py-1 text-[11px] font-medium text-[#1a1a1a] hover:bg-[#f0f0ee] disabled:opacity-50"
                      >
                        {NEXT_LABEL[c.status]}
                      </button>
                    )}
                    {!['completed', 'terminated'].includes(c.status) && (
                      <button
                        disabled={pending}
                        onClick={() => terminate(c.id)}
                        className="rounded border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Terminate
                      </button>
                    )}
                    <button
                      disabled={pending}
                      onClick={() => remove(c)}
                      className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="size-3" /> Remove
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {editing && (
        <DriverAssignmentModal
          contract={editing}
          drivers={drivers}
          contractIds={contractedDriverIds}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}

// ── Campaign card with contract list ──────────────────────────────────────

function CampaignCard({
  campaign,
  contracts,
  drivers,
}: {
  campaign: CampaignMatchRow
  contracts: ContractRow[]
  drivers: AvailableDriverRow[]
}) {
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)

  const contractedDriverIds = useMemo(() => new Set(contracts.map((c) => c.driverId)), [contracts])
  const canAddDriver = ['approved', 'awaiting_install', 'active'].includes(campaign.status)

  return (
    <div className="rounded-lg border border-[#cbccc9] bg-white">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center gap-3 px-4 py-3"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-[#666666]" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-[#666666]" />
        )}
        <div className="min-w-0 flex-1">
          <Link
            href={`/admin/contracts/${campaign.id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex max-w-full items-center gap-1 text-[14px] font-bold text-[#1a1a1a] hover:underline"
          >
            <span className="truncate">{campaign.name}</span>
            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
          </Link>
          <p className="text-[12px] text-[#666666]">{campaign.contractCount} drivers</p>
        </div>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-bold uppercase ${STATUS_STYLE[campaign.status] ?? 'bg-[#f0f0ee] text-[#666]'}`}
        >
          {campaign.status.replace(/_/g, ' ')}
        </span>
        {canAddDriver && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setAdding(true)
            }}
            className="flex shrink-0 items-center gap-1 rounded border border-[#cbccc9] px-2.5 py-1.5 text-[12px] font-medium text-[#1a1a1a] hover:bg-[#f0f0ee]"
          >
            <Plus className="size-3.5" /> Add Driver
          </button>
        )}
      </div>

      {/* Contracts list */}
      {open && (
        <div className="border-t border-[#cbccc9]">
          {contracts.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-[#999]">No drivers matched yet.</p>
          ) : (
            <CampaignAssignmentsTable contracts={contracts} drivers={drivers} />
          )}
        </div>
      )}

      {adding && (
        <DriverAssignmentModal
          campaign={campaign}
          drivers={drivers}
          contractIds={contractedDriverIds}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  )
}

// ── Main client ────────────────────────────────────────────────────────────

export function ContractsClient({
  campaigns,
  contractsByCampaign,
  drivers,
}: {
  campaigns: CampaignMatchRow[]
  contractsByCampaign: Record<string, ContractRow[]>
  drivers: AvailableDriverRow[]
}) {
  const [party, setParty] = useState<ContractPartyFilter>('all')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const normalizedSearch = search.trim().toLowerCase()

  const statusOptions = useMemo(() => {
    const statuses = new Set<string>()
    for (const campaign of campaigns) statuses.add(campaign.status)
    for (const contracts of Object.values(contractsByCampaign)) {
      for (const contract of contracts) statuses.add(contract.status)
    }
    return Array.from(statuses).sort()
  }, [campaigns, contractsByCampaign])

  const filteredCampaigns = useMemo(() => {
    return campaigns
      .map((campaign) => {
        const contracts = contractsByCampaign[campaign.id] ?? []
        const campaignMatchesStatus = !status || campaign.status === status
        const campaignMatchesSearch = matchesText(
          [
            campaign.name,
            campaign.partnerName,
            campaign.status,
            campaign.ratePerKmVnd,
            campaign.dailyCapKm,
          ],
          normalizedSearch,
        )
        const matchingContracts = contracts.filter((contract) => {
          const matchesParty =
            party === 'all' ||
            party === 'driver_admin' ||
            (party === 'garage_admin' && Boolean(contract.garageName))
          const matchesStatus = !status || contract.status === status
          const matchesSearch = matchesText(
            [
              contract.campaignName,
              contract.driverName,
              contract.vehiclePlate,
              contract.garageName,
              contract.status,
            ],
            normalizedSearch,
          )
          return matchesParty && matchesStatus && matchesSearch
        })

        if (party === 'partner_admin') {
          if (!campaignMatchesStatus || !campaignMatchesSearch) return null
          return { campaign, contracts }
        }

        const campaignMatches = campaignMatchesStatus && campaignMatchesSearch
        if (party === 'all' && campaignMatches) return { campaign, contracts }
        if (matchingContracts.length > 0) return { campaign, contracts: matchingContracts }
        return null
      })
      .filter((row): row is FilteredCampaignRow => Boolean(row))
  }, [campaigns, contractsByCampaign, normalizedSearch, party, status])

  const groupedPartners = useMemo(() => {
    const groups = new Map<
      string,
      { partnerId: string; partnerName: string; rows: FilteredCampaignRow[] }
    >()

    for (const row of filteredCampaigns) {
      const current = groups.get(row.campaign.partnerId) ?? {
        partnerId: row.campaign.partnerId,
        partnerName: row.campaign.partnerName,
        rows: [],
      }
      current.rows.push(row)
      groups.set(row.campaign.partnerId, current)
    }

    return Array.from(groups.values())
  }, [filteredCampaigns])

  if (campaigns.length === 0)
    return <EmptyState kicker="empty" title="No Campaigns" helper="No campaigns found." />

  return (
    <SectionShell title={`Campaigns (${filteredCampaigns.length}/${campaigns.length})`}>
      <div className="mb-4 grid gap-3 md:grid-cols-[180px_180px_minmax(220px,1fr)]">
        <div>
          <label className="mb-1 block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
            Assignment type
          </label>
          <select
            value={party}
            onChange={(e) => setParty(e.target.value as ContractPartyFilter)}
            className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] bg-white px-3 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
          >
            {PARTY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] bg-white px-3 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
          >
            <option value="">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
            Search
          </label>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Partner, campaign, driver, plate, garage..."
            className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <EmptyState
          kicker="empty"
          title="No Matching Campaigns"
          helper="Try another assignment type, status, or search keyword."
        />
      ) : (
        <div className="space-y-6">
          {groupedPartners.map((group) => {
            const visibleRows = group.rows.slice(0, 2)
            const hiddenCount = group.rows.length - visibleRows.length

            return (
              <section key={group.partnerId} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#cbccc9] pb-2">
                  <Link
                    href={`/admin/${group.partnerId}/contracts`}
                    className="inline-flex items-center gap-1 text-[14px] font-extrabold tracking-[1px] text-[#1a1a1a] uppercase hover:underline"
                  >
                    {group.partnerName}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </Link>
                  <span className="text-[12px] font-bold tracking-[1px] text-[#666666] uppercase">
                    {group.rows.length} campaigns
                  </span>
                </div>

                <div className="space-y-3">
                  {visibleRows.map(({ campaign, contracts }) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      contracts={contracts}
                      drivers={drivers}
                    />
                  ))}
                </div>

                {hiddenCount > 0 && (
                  <p className="text-[12px] text-[#666666]">
                    Còn {hiddenCount.toLocaleString('vi-VN')} campaign khác. Click partner name để
                    xem tất cả.
                  </p>
                )}
              </section>
            )
          })}
        </div>
      )}
    </SectionShell>
  )
}
