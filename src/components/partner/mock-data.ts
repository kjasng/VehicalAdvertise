/**
 * Mock data for partner panel pages.
 * Realistic Vietnamese partner campaigns, Hanoi context, VND amounts.
 */

export type CampaignStatus = 'draft' | 'submitted' | 'approved' | 'active' | 'paused'
export type CreativeStatus = 'pending' | 'approved' | 'rejected'

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

// ── Creatives ──────────────────────────────────────────────────────────────────
export interface CreativeAsset {
  id: string
  name: string
  imageUrl: string
  widthPx: number
  heightPx: number
  dpi: number
  fileSizeKb: number
  status: CreativeStatus
  uploadedAt: string
}

export const MOCK_CREATIVES: CreativeAsset[] = [
  {
    id: 'asset-001',
    name: 'grab-summer-hero.jpg',
    imageUrl: 'https://placehold.co/400x200/ff5c00/fff?text=Grab+Summer',
    widthPx: 1200,
    heightPx: 600,
    dpi: 300,
    fileSizeKb: 420,
    status: 'approved',
    uploadedAt: '2026-04-28 10:00',
  },
  {
    id: 'asset-002',
    name: 'shopee-flash-banner.jpg',
    imageUrl: 'https://placehold.co/400x200/ee4d2d/fff?text=Shopee+Flash',
    widthPx: 1200,
    heightPx: 600,
    dpi: 300,
    fileSizeKb: 380,
    status: 'approved',
    uploadedAt: '2026-05-08 14:30',
  },
  {
    id: 'asset-003',
    name: 'vinmart-q2-brand.png',
    imageUrl: 'https://placehold.co/400x200/00843d/fff?text=VinMart+Q2',
    widthPx: 1200,
    heightPx: 600,
    dpi: 300,
    fileSizeKb: 510,
    status: 'pending',
    uploadedAt: '2026-05-20 09:15',
  },
  {
    id: 'asset-004',
    name: 'momo-cashback-creative.jpg',
    imageUrl: 'https://placehold.co/400x200/a64dff/fff?text=MoMo+Cashback',
    widthPx: 1000,
    heightPx: 500,
    dpi: 200,
    fileSizeKb: 290,
    status: 'rejected',
    uploadedAt: '2026-04-10 16:00',
  },
]

// Ledger + wallet data lives in mock-ledger-data.ts
export type { LedgerDirection, PartnerLedgerRow } from './mock-ledger-data'
export { MOCK_PARTNER_LEDGER, MOCK_WALLET } from './mock-ledger-data'
