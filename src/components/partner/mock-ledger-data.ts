/**
 * Partner mock ledger entries and wallet summary.
 * Extracted from mock-data.ts to keep each file under 200 lines.
 */

export type LedgerDirection = 'credit' | 'debit'

export interface PartnerLedgerRow {
  id: string
  ts: string
  description: string
  amountVnd: number
  direction: LedgerDirection
  balance: number
}

export const MOCK_PARTNER_LEDGER: PartnerLedgerRow[] = [
  {
    id: 'pl-001',
    ts: '2026-05-25 09:00',
    description: 'Campaign charge — Grab Summer W21',
    amountVnd: 4_800_000,
    direction: 'debit',
    balance: 12_400_000,
  },
  {
    id: 'pl-002',
    ts: '2026-05-24 15:30',
    description: 'Top-up via VietQR — ref TU-20240524-001',
    amountVnd: 10_000_000,
    direction: 'credit',
    balance: 17_200_000,
  },
  {
    id: 'pl-003',
    ts: '2026-05-23 11:00',
    description: 'Campaign charge — Shopee Flash W20',
    amountVnd: 5_600_000,
    direction: 'debit',
    balance: 7_200_000,
  },
  {
    id: 'pl-004',
    ts: '2026-05-18 10:00',
    description: 'Top-up via VietQR — ref TU-20240518-002',
    amountVnd: 20_000_000,
    direction: 'credit',
    balance: 12_800_000,
  },
  {
    id: 'pl-005',
    ts: '2026-05-15 08:45',
    description: 'Campaign charge — MoMo Cashback W19',
    amountVnd: 3_200_000,
    direction: 'debit',
    balance: -7_200_000,
  },
  {
    id: 'pl-006',
    ts: '2026-05-10 13:20',
    description: 'Top-up via VietQR — ref TU-20240510-003',
    amountVnd: 50_000_000,
    direction: 'credit',
    balance: 46_800_000,
  },
  {
    id: 'pl-007',
    ts: '2026-05-08 09:00',
    description: 'Campaign charge — Shopee Flash W18',
    amountVnd: 4_000_000,
    direction: 'debit',
    balance: -3_200_000,
  },
]

// ── Wallet summary ─────────────────────────────────────────────────────────────
export const MOCK_WALLET = {
  balanceVnd: 12_400_000,
  partnerUuid: 'partner-a1b2c3d4',
  bankAccount: '19036123456789',
  bankName: 'Techcombank',
  accountName: 'CONG TY VEHICAL ADVERTISE',
}
