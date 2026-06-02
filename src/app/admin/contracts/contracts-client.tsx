'use client'

import { useState, useTransition } from 'react'

import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/shared/empty-state'
import { SectionShell } from '@/components/shared/section-shell'
import type {
  AvailableDriverRow,
  CampaignMatchRow,
  ContractRow,
} from '@/lib/admin/queries-contracts'

import { advanceContractStatus, createContract, createVehicle, terminateContract } from './actions'

// ── Status styles ──────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
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

const FUEL_LABEL: Record<string, string> = {
  petrol: 'Xăng',
  diesel: 'Dầu',
  electric: 'Điện',
  hybrid: 'Hybrid',
}

// ── Add Driver Modal ───────────────────────────────────────────────────────

function AddDriverModal({
  campaign,
  drivers,
  contractIds,
  onClose,
}: {
  campaign: CampaignMatchRow
  drivers: AvailableDriverRow[]
  contractIds: Set<string> // driver IDs already in this campaign
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [driverId, setDriverId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [newPlate, setNewPlate] = useState('')
  const [newFuel, setNewFuel] = useState<'petrol' | 'diesel' | 'electric' | 'hybrid'>('petrol')
  const [newBrand, setNewBrand] = useState('')

  const selected = drivers.find((d) => d.id === driverId)
  const approvedVehicles = selected?.vehicles.filter((v) => v.approved) ?? []
  const useNewVehicle = vehicleId === '__new__' || approvedVehicles.length === 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!driverId) {
      toast.error('Chọn driver')
      return
    }
    startTransition(async () => {
      let finalVehicleId = vehicleId
      // Register new vehicle if needed
      if (useNewVehicle) {
        if (!newPlate.trim()) {
          toast.error('Nhập biển số xe')
          return
        }
        const vr = await createVehicle({
          driverId,
          plate: newPlate.trim().toUpperCase(),
          fuel: newFuel,
          brand: newBrand || undefined,
        })
        if (vr.error) {
          toast.error(vr.error)
          return
        }
        finalVehicleId = vr.vehicleId!
      }
      const cr = await createContract({
        campaignId: campaign.id,
        driverId,
        vehicleId: finalVehicleId,
      })
      if (cr.error) toast.error(cr.error)
      else {
        toast.success('Contract created')
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
            <h2 className="text-[15px] font-bold text-[#1a1a1a]">Match Driver</h2>
            <p className="text-[12px] text-[#666666]">{campaign.name}</p>
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
                setDriverId(e.target.value)
                setVehicleId('')
              }}
              className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] bg-white px-3 text-[13px] focus:ring-2 focus:outline-none"
            >
              <option value="">-- Chọn driver --</option>
              {drivers
                .filter((d) => !contractIds.has(d.id))
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} {d.phone ? `(${d.phone})` : ''}
                  </option>
                ))}
            </select>
          </div>

          {/* Vehicle select */}
          {selected && approvedVehicles.length > 0 && (
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                Xe *
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] bg-white px-3 text-[13px] focus:ring-2 focus:outline-none"
              >
                <option value="">-- Chọn xe --</option>
                {approvedVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate} ({FUEL_LABEL[v.fuel] ?? v.fuel})
                  </option>
                ))}
                <option value="__new__">+ Đăng ký xe mới</option>
              </select>
            </div>
          )}

          {/* New vehicle form */}
          {selected && (approvedVehicles.length === 0 || vehicleId === '__new__') && (
            <div className="space-y-3 rounded-lg border border-[#cbccc9] bg-[#f7f8fa] p-3">
              <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                Đăng ký xe mới
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#666666]">Biển số *</label>
                  <input
                    type="text"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                    placeholder="51A-12345"
                    required={approvedVehicles.length === 0}
                    className="focus:ring-primary mt-0.5 h-[36px] w-full rounded border border-[#cbccc9] px-2 font-mono text-[13px] focus:ring-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#666666]">Loại nhiên liệu</label>
                  <select
                    value={newFuel}
                    onChange={(e) => setNewFuel(e.target.value as typeof newFuel)}
                    className="focus:ring-primary mt-0.5 h-[36px] w-full rounded border border-[#cbccc9] bg-white px-2 text-[13px] focus:ring-2 focus:outline-none"
                  >
                    {Object.entries(FUEL_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-[#666666]">Hãng xe (tùy chọn)</label>
                <input
                  type="text"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="Toyota, Honda…"
                  className="focus:ring-primary mt-0.5 h-[36px] w-full rounded border border-[#cbccc9] px-2 text-[13px] focus:ring-2 focus:outline-none"
                />
              </div>
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
              disabled={pending || !driverId}
              className="flex-1 rounded bg-[#1a1a1a] py-2 text-[13px] font-bold text-white hover:bg-[#333] disabled:opacity-50"
            >
              {pending ? 'Đang tạo…' : 'Tạo Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
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
  const [pending, startTransition] = useTransition()

  const contractedDriverIds = new Set(contracts.map((c) => c.driverId))

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
      else toast.success('Contract terminated')
    })
  }

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
          <p className="truncate text-[14px] font-bold text-[#1a1a1a]">{campaign.name}</p>
          <p className="text-[12px] text-[#666666]">
            {campaign.partnerName} · {campaign.ratePerKmVnd.toLocaleString('vi-VN')} ₫/km ·{' '}
            {campaign.contractCount} drivers
          </p>
        </div>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-bold uppercase ${STATUS_STYLE[campaign.status] ?? 'bg-[#f0f0ee] text-[#666]'}`}
        >
          {campaign.status.replace(/_/g, ' ')}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setAdding(true)
          }}
          className="flex shrink-0 items-center gap-1 rounded border border-[#cbccc9] px-2.5 py-1.5 text-[12px] font-medium text-[#1a1a1a] hover:bg-[#f0f0ee]"
        >
          <Plus className="size-3.5" /> Add Driver
        </button>
      </div>

      {/* Contracts list */}
      {open && (
        <div className="border-t border-[#cbccc9]">
          {contracts.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-[#999]">No drivers matched yet.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="bg-[#f7f8fa]">
                <tr>
                  {['Driver', 'Biển số', 'Nhiên liệu', 'KM', 'Status', ''].map((h) => (
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
                {contracts.map((c) => (
                  <tr key={c.id} className="border-t border-[#f0f0ee]">
                    <td className="px-4 py-2 font-medium text-[#1a1a1a]">{c.driverName}</td>
                    <td className="px-4 py-2 font-mono text-[#666666]">{c.vehiclePlate}</td>
                    <td className="px-4 py-2 text-[#666666]">
                      {FUEL_LABEL[c.vehicleFuel] ?? c.vehicleFuel}
                    </td>
                    <td className="px-4 py-2 font-mono text-[#1a1a1a]">
                      {c.kmTotal.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase ${STATUS_STYLE[c.status] ?? ''}`}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {adding && (
        <AddDriverModal
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
  if (campaigns.length === 0)
    return (
      <EmptyState
        kicker="empty"
        title="No Campaigns"
        helper="No approved campaigns found for contract matching."
      />
    )

  return (
    <SectionShell title={`Campaigns (${campaigns.length})`}>
      <div className="space-y-3">
        {campaigns.map((c) => (
          <CampaignCard
            key={c.id}
            campaign={c}
            contracts={contractsByCampaign[c.id] ?? []}
            drivers={drivers}
          />
        ))}
      </div>
    </SectionShell>
  )
}
