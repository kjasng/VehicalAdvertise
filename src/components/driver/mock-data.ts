/**
 * Mock data for driver panel pages.
 * Realistic Vietnamese names + Hanoi locations + VND amounts.
 */

export type DriverInvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue'

export interface DriverInvoiceRow {
  id: string
  weekLabel: string
  kmDriven: number
  amountVnd: number
  status: DriverInvoiceStatus
  issuedAt: string
  /** Day-by-day breakdown */
  days: { date: string; km: number }[]
}

export interface DailyKmPoint {
  day: string
  km: number
}

export interface TodayStats {
  kmToday: number
  earningsVnd: number
  campaignName: string
  campaignLabel: string
}

export interface VerificationPrompt {
  id: string
  promptedAt: string
  status: 'pending' | 'passed' | 'failed'
}

// ── Today's stats ─────────────────────────────────────────────────────────────
export const MOCK_TODAY_STATS: TodayStats = {
  kmToday: 48,
  earningsVnd: 192_000,
  campaignName: 'Grab Summer 2026',
  campaignLabel: 'GR-SUM-26',
}

// ── Last 7 days km chart ───────────────────────────────────────────────────────
export const MOCK_DAILY_KM: DailyKmPoint[] = [
  { day: 'T2', km: 52 },
  { day: 'T3', km: 44 },
  { day: 'T4', km: 61 },
  { day: 'T5', km: 38 },
  { day: 'T6', km: 70 },
  { day: 'T7', km: 55 },
  { day: 'CN', km: 48 },
]

// ── Verification prompts ───────────────────────────────────────────────────────
export const MOCK_VERIFICATION_PROMPTS: VerificationPrompt[] = [
  { id: 'vp-001', promptedAt: '2026-05-26 09:14', status: 'passed' },
  { id: 'vp-002', promptedAt: '2026-05-25 14:32', status: 'passed' },
  { id: 'vp-003', promptedAt: '2026-05-24 11:05', status: 'failed' },
]

// ── Weekly invoices ────────────────────────────────────────────────────────────
export const MOCK_DRIVER_WEEKLY_INVOICES: DriverInvoiceRow[] = [
  {
    id: 'drv-inv-001',
    weekLabel: '2026-W21',
    kmDriven: 312,
    amountVnd: 1_248_000,
    status: 'paid',
    issuedAt: '2026-05-24',
    days: [
      { date: '19/05', km: 48 },
      { date: '20/05', km: 52 },
      { date: '21/05', km: 44 },
      { date: '22/05', km: 61 },
      { date: '23/05', km: 38 },
      { date: '24/05', km: 70 },
      { date: '25/05', km: 55 + 44 },
    ],
  },
  {
    id: 'drv-inv-002',
    weekLabel: '2026-W20',
    kmDriven: 288,
    amountVnd: 1_152_000,
    status: 'paid',
    issuedAt: '2026-05-17',
    days: [
      { date: '12/05', km: 41 },
      { date: '13/05', km: 55 },
      { date: '14/05', km: 39 },
      { date: '15/05', km: 48 },
      { date: '16/05', km: 42 },
      { date: '17/05', km: 63 },
      { date: '18/05', km: 60 },
    ],
  },
  {
    id: 'drv-inv-003',
    weekLabel: '2026-W19',
    kmDriven: 256,
    amountVnd: 1_024_000,
    status: 'paid',
    issuedAt: '2026-05-10',
    days: [
      { date: '05/05', km: 38 },
      { date: '06/05', km: 42 },
      { date: '07/05', km: 35 },
      { date: '08/05', km: 44 },
      { date: '09/05', km: 36 },
      { date: '10/05', km: 31 },
      { date: '11/05', km: 30 },
    ],
  },
  {
    id: 'drv-inv-004',
    weekLabel: '2026-W18',
    kmDriven: 197,
    amountVnd: 788_000,
    status: 'overdue',
    issuedAt: '2026-05-03',
    days: [
      { date: '28/04', km: 31 },
      { date: '29/04', km: 28 },
      { date: '30/04', km: 0 },
      { date: '01/05', km: 0 },
      { date: '02/05', km: 45 },
      { date: '03/05', km: 50 },
      { date: '04/05', km: 43 },
    ],
  },
]
