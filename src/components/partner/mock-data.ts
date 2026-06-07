/**
 * Mock data for partner panel pages.
 * Realistic Vietnamese partner campaigns, Hanoi context, VND amounts.
 */

export type CampaignStatus = 'draft' | 'submitted' | 'approved' | 'active' | 'paused'

// ── Campaigns ──────────────────────────────────────────────────────────────────
export interface CampaignRow {
  id: string
  name: string
  status: CampaignStatus
  targetKm: number
  consumedKm: number
  budgetVnd: number
  spentVnd: number
  startDate: string
  endDate: string
  districts: string[]
}

export const MOCK_CAMPAIGNS: CampaignRow[] = [
  {
    id: 'camp-001',
    name: 'Grab Summer Promo 2026',
    status: 'active',
    targetKm: 50_000,
    consumedKm: 31_200,
    budgetVnd: 42_000_000,
    spentVnd: 26_208_000,
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    districts: ['Hoàn Kiếm', 'Đống Đa', 'Ba Đình'],
  },
  {
    id: 'camp-002',
    name: 'Shopee Flash Sale Tháng 5',
    status: 'active',
    targetKm: 30_000,
    consumedKm: 28_900,
    budgetVnd: 35_500_000,
    spentVnd: 34_197_000,
    startDate: '2026-05-10',
    endDate: '2026-05-31',
    districts: ['Cầu Giấy', 'Thanh Xuân'],
  },
  {
    id: 'camp-003',
    name: 'VinMart Q2 Brand Awareness',
    status: 'approved',
    targetKm: 20_000,
    consumedKm: 0,
    budgetVnd: 28_000_000,
    spentVnd: 0,
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    districts: ['Long Biên', 'Gia Lâm'],
  },
  {
    id: 'camp-004',
    name: 'MoMo Cashback Q2',
    status: 'paused',
    targetKm: 15_000,
    consumedKm: 9_300,
    budgetVnd: 19_750_000,
    spentVnd: 12_255_000,
    startDate: '2026-04-15',
    endDate: '2026-05-31',
    districts: ['Hai Bà Trưng', 'Hoàng Mai'],
  },
  {
    id: 'camp-005',
    name: 'Be App Launch Hà Nội',
    status: 'submitted',
    targetKm: 10_000,
    consumedKm: 0,
    budgetVnd: 12_000_000,
    spentVnd: 0,
    startDate: '2026-06-15',
    endDate: '2026-07-15',
    districts: ['Tây Hồ', 'Cầu Giấy'],
  },
  {
    id: 'camp-006',
    name: 'Techcombank Card Drive',
    status: 'draft',
    targetKm: 25_000,
    consumedKm: 0,
    budgetVnd: 30_000_000,
    spentVnd: 0,
    startDate: '',
    endDate: '',
    districts: [],
  },
]

// Ledger + wallet data lives in mock-ledger-data.ts
export type { LedgerDirection, PartnerLedgerRow } from './mock-ledger-data'
export { MOCK_PARTNER_LEDGER, MOCK_WALLET } from './mock-ledger-data'
