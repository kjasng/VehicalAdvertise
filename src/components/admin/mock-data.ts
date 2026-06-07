/**
 * Mock data for admin panel pages.
 * Single source of truth for all demo rows — no DB calls.
 * Realistic Vietnamese names + Hanoi locations + VND amounts.
 */

export type KycStatus = 'pending' | 'approved' | 'rejected'
export type CreativeStatus = 'pending' | 'approved' | 'rejected'
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue'
export type UserRole = 'admin' | 'driver' | 'partner' | 'garage'
export type DispositionType = 'auto' | 'manual'

// ── Drivers KYC ──────────────────────────────────────────────────────────────
export interface KycRow {
  id: string
  name: string
  phone: string
  cccdNumber: string
  submittedAt: string
  status: KycStatus
  district: string
  cccdFrontUrl: string
  cccdBackUrl: string
  selfieUrl: string
}

export const MOCK_KYC_ROWS: KycRow[] = [
  {
    id: 'kyc-001',
    name: 'Nguyễn Văn An',
    phone: '0912 345 678',
    cccdNumber: '001 084 012 345',
    submittedAt: '2026-05-25 08:14',
    status: 'pending',
    district: 'Hoàn Kiếm',
    cccdFrontUrl: 'https://placehold.co/320x200/1a1a1a/fff?text=CCCD+Front',
    cccdBackUrl: 'https://placehold.co/320x200/1a1a1a/fff?text=CCCD+Back',
    selfieUrl: 'https://placehold.co/200x200/ff5c00/fff?text=Selfie',
  },
  {
    id: 'kyc-002',
    name: 'Trần Thị Bích',
    phone: '0987 654 321',
    cccdNumber: '001 084 023 456',
    submittedAt: '2026-05-25 09:02',
    status: 'pending',
    district: 'Đống Đa',
    cccdFrontUrl: 'https://placehold.co/320x200/1a1a1a/fff?text=CCCD+Front',
    cccdBackUrl: 'https://placehold.co/320x200/1a1a1a/fff?text=CCCD+Back',
    selfieUrl: 'https://placehold.co/200x200/ff5c00/fff?text=Selfie',
  },
  {
    id: 'kyc-003',
    name: 'Lê Hoàng Nam',
    phone: '0932 111 222',
    cccdNumber: '001 084 034 567',
    submittedAt: '2026-05-25 09:45',
    status: 'pending',
    district: 'Cầu Giấy',
    cccdFrontUrl: 'https://placehold.co/320x200/1a1a1a/fff?text=CCCD+Front',
    cccdBackUrl: 'https://placehold.co/320x200/1a1a1a/fff?text=CCCD+Back',
    selfieUrl: 'https://placehold.co/200x200/ff5c00/fff?text=Selfie',
  },
  {
    id: 'kyc-004',
    name: 'Phạm Minh Tuấn',
    phone: '0961 333 444',
    cccdNumber: '001 084 045 678',
    submittedAt: '2026-05-25 10:20',
    status: 'pending',
    district: 'Thanh Xuân',
    cccdFrontUrl: 'https://placehold.co/320x200/1a1a1a/fff?text=CCCD+Front',
    cccdBackUrl: 'https://placehold.co/320x200/1a1a1a/fff?text=CCCD+Back',
    selfieUrl: 'https://placehold.co/200x200/ff5c00/fff?text=Selfie',
  },
  {
    id: 'kyc-005',
    name: 'Vũ Thị Lan',
    phone: '0945 555 666',
    cccdNumber: '001 084 056 789',
    submittedAt: '2026-05-25 11:05',
    status: 'pending',
    district: 'Hai Bà Trưng',
    cccdFrontUrl: 'https://placehold.co/320x200/1a1a1a/fff?text=CCCD+Front',
    cccdBackUrl: 'https://placehold.co/320x200/1a1a1a/fff?text=CCCD+Back',
    selfieUrl: 'https://placehold.co/200x200/ff5c00/fff?text=Selfie',
  },
  {
    id: 'kyc-006',
    name: 'Hoàng Đức Long',
    phone: '0978 777 888',
    cccdNumber: '001 084 067 890',
    submittedAt: '2026-05-25 11:52',
    status: 'pending',
    district: 'Tây Hồ',
    cccdFrontUrl: 'https://placehold.co/320x200/1a1a1a/fff?text=CCCD+Front',
    cccdBackUrl: 'https://placehold.co/320x200/1a1a1a/fff?text=CCCD+Back',
    selfieUrl: 'https://placehold.co/200x200/ff5c00/fff?text=Selfie',
  },
]

// ── Creatives Review ──────────────────────────────────────────────────────────
export interface CreativeRow {
  id: string
  campaignName: string
  partner: string
  submittedAt: string
  status: CreativeStatus
  imageUrl: string
  widthPx: number
  heightPx: number
  dpi: number
  fileSizeKb: number
  areaM2: number
}

export const MOCK_CREATIVE_ROWS: CreativeRow[] = [
  {
    id: 'cr-001',
    campaignName: 'Grab Summer 2026',
    partner: 'Grab VN',
    submittedAt: '2026-05-24 14:00',
    status: 'pending',
    imageUrl: 'https://placehold.co/400x200/ff5c00/fff?text=Creative+1',
    widthPx: 1200,
    heightPx: 600,
    dpi: 300,
    fileSizeKb: 420,
    areaM2: 0.5,
  },
  {
    id: 'cr-002',
    campaignName: 'Shopee Flash Sale',
    partner: 'Shopee VN',
    submittedAt: '2026-05-24 16:30',
    status: 'pending',
    imageUrl: 'https://placehold.co/400x200/1a1a1a/fff?text=Creative+2',
    widthPx: 1200,
    heightPx: 600,
    dpi: 300,
    fileSizeKb: 380,
    areaM2: 0.5,
  },
  {
    id: 'cr-003',
    campaignName: 'VinMart Q2',
    partner: 'VinCommerce',
    submittedAt: '2026-05-25 08:00',
    status: 'pending',
    imageUrl: 'https://placehold.co/400x200/cbccc9/1a1a1a?text=Creative+3',
    widthPx: 1200,
    heightPx: 600,
    dpi: 300,
    fileSizeKb: 510,
    areaM2: 0.5,
  },
  {
    id: 'cr-004',
    campaignName: 'MoMo Cashback',
    partner: 'M_Service',
    submittedAt: '2026-05-25 09:15',
    status: 'pending',
    imageUrl: 'https://placehold.co/400x200/a64dff/fff?text=Creative+4',
    widthPx: 1200,
    heightPx: 600,
    dpi: 300,
    fileSizeKb: 290,
    areaM2: 0.5,
  },
]

// ── Install Proofs ────────────────────────────────────────────────────────────
export interface InstallProofRow {
  id: string
  driverName: string
  garage: string
  submittedAt: string
  photoUrl: string
  status: 'pending' | 'approved' | 'rejected'
}

export const MOCK_INSTALL_PROOF_ROWS: InstallProofRow[] = [
  {
    id: 'ip-001',
    driverName: 'Nguyễn Văn An',
    garage: 'Garage Hoàn Kiếm',
    submittedAt: '2026-05-25 07:30',
    photoUrl: 'https://placehold.co/300x200/1a1a1a/fff?text=Install+1',
    status: 'pending',
  },
  {
    id: 'ip-002',
    driverName: 'Trần Thị Bích',
    garage: 'Garage Đống Đa',
    submittedAt: '2026-05-25 08:10',
    photoUrl: 'https://placehold.co/300x200/1a1a1a/fff?text=Install+2',
    status: 'pending',
  },
  {
    id: 'ip-003',
    driverName: 'Lê Hoàng Nam',
    garage: 'Garage Cầu Giấy',
    submittedAt: '2026-05-25 08:55',
    photoUrl: 'https://placehold.co/300x200/1a1a1a/fff?text=Install+3',
    status: 'pending',
  },
  {
    id: 'ip-004',
    driverName: 'Phạm Minh Tuấn',
    garage: 'Garage Thanh Xuân',
    submittedAt: '2026-05-25 09:40',
    photoUrl: 'https://placehold.co/300x200/1a1a1a/fff?text=Install+4',
    status: 'pending',
  },
  {
    id: 'ip-005',
    driverName: 'Vũ Thị Lan',
    garage: 'Garage Hai Bà Trưng',
    submittedAt: '2026-05-25 10:20',
    photoUrl: 'https://placehold.co/300x200/1a1a1a/fff?text=Install+5',
    status: 'pending',
  },
  {
    id: 'ip-006',
    driverName: 'Hoàng Đức Long',
    garage: 'Garage Tây Hồ',
    submittedAt: '2026-05-25 11:00',
    photoUrl: 'https://placehold.co/300x200/1a1a1a/fff?text=Install+6',
    status: 'pending',
  },
]

export const MOCK_GARAGES = [
  'All garages',
  'Garage Hoàn Kiếm',
  'Garage Đống Đa',
  'Garage Cầu Giấy',
  'Garage Thanh Xuân',
  'Garage Hai Bà Trưng',
  'Garage Tây Hồ',
]

// ── Photo Verifications ───────────────────────────────────────────────────────
export interface PhotoVerificationRow {
  id: string
  driverName: string
  promptDate: string
  photoUrl: string
  disposition: DispositionType
  dispositionResult: 'pass' | 'fail' | 'pending'
}

export const MOCK_PHOTO_VERIFICATION_ROWS: PhotoVerificationRow[] = [
  {
    id: 'pv-001',
    driverName: 'Nguyễn Văn An',
    promptDate: '2026-05-25',
    photoUrl: 'https://placehold.co/80x80/1a1a1a/fff?text=PV',
    disposition: 'auto',
    dispositionResult: 'pass',
  },
  {
    id: 'pv-002',
    driverName: 'Trần Thị Bích',
    promptDate: '2026-05-25',
    photoUrl: 'https://placehold.co/80x80/1a1a1a/fff?text=PV',
    disposition: 'manual',
    dispositionResult: 'pending',
  },
  {
    id: 'pv-003',
    driverName: 'Lê Hoàng Nam',
    promptDate: '2026-05-25',
    photoUrl: 'https://placehold.co/80x80/1a1a1a/fff?text=PV',
    disposition: 'auto',
    dispositionResult: 'pass',
  },
  {
    id: 'pv-004',
    driverName: 'Phạm Minh Tuấn',
    promptDate: '2026-05-24',
    photoUrl: 'https://placehold.co/80x80/1a1a1a/fff?text=PV',
    disposition: 'manual',
    dispositionResult: 'fail',
  },
  {
    id: 'pv-005',
    driverName: 'Vũ Thị Lan',
    promptDate: '2026-05-24',
    photoUrl: 'https://placehold.co/80x80/1a1a1a/fff?text=PV',
    disposition: 'auto',
    dispositionResult: 'pass',
  },
]

// ── Invoices ──────────────────────────────────────────────────────────────────
export interface InvoiceRow {
  id: string
  recipientName: string
  cohort: string
  amountVnd: number
  status: InvoiceStatus
  issuedAt: string
}

export const MOCK_DRIVER_INVOICES: InvoiceRow[] = [
  {
    id: 'inv-d-001',
    recipientName: 'Nguyễn Văn An',
    cohort: '2026-W21',
    amountVnd: 1_250_000,
    status: 'paid',
    issuedAt: '2026-05-24',
  },
  {
    id: 'inv-d-002',
    recipientName: 'Trần Thị Bích',
    cohort: '2026-W21',
    amountVnd: 980_000,
    status: 'issued',
    issuedAt: '2026-05-24',
  },
  {
    id: 'inv-d-003',
    recipientName: 'Lê Hoàng Nam',
    cohort: '2026-W21',
    amountVnd: 1_500_000,
    status: 'paid',
    issuedAt: '2026-05-24',
  },
  {
    id: 'inv-d-004',
    recipientName: 'Phạm Minh Tuấn',
    cohort: '2026-W20',
    amountVnd: 760_000,
    status: 'overdue',
    issuedAt: '2026-05-17',
  },
  {
    id: 'inv-d-005',
    recipientName: 'Vũ Thị Lan',
    cohort: '2026-W20',
    amountVnd: 1_100_000,
    status: 'paid',
    issuedAt: '2026-05-17',
  },
]

export const MOCK_PARTNER_INVOICES: InvoiceRow[] = [
  {
    id: 'inv-p-001',
    recipientName: 'Grab VN',
    cohort: '2026-05',
    amountVnd: 42_000_000,
    status: 'issued',
    issuedAt: '2026-05-01',
  },
  {
    id: 'inv-p-002',
    recipientName: 'Shopee VN',
    cohort: '2026-05',
    amountVnd: 35_500_000,
    status: 'paid',
    issuedAt: '2026-05-01',
  },
  {
    id: 'inv-p-003',
    recipientName: 'VinCommerce',
    cohort: '2026-04',
    amountVnd: 28_000_000,
    status: 'paid',
    issuedAt: '2026-04-01',
  },
  {
    id: 'inv-p-004',
    recipientName: 'M_Service',
    cohort: '2026-04',
    amountVnd: 19_750_000,
    status: 'overdue',
    issuedAt: '2026-04-01',
  },
]

export const MOCK_GARAGE_INVOICES: InvoiceRow[] = [
  {
    id: 'inv-g-001',
    recipientName: 'Garage Hoàn Kiếm',
    cohort: '2026-W21',
    amountVnd: 5_200_000,
    status: 'paid',
    issuedAt: '2026-05-24',
  },
  {
    id: 'inv-g-002',
    recipientName: 'Garage Đống Đa',
    cohort: '2026-W21',
    amountVnd: 4_800_000,
    status: 'issued',
    issuedAt: '2026-05-24',
  },
  {
    id: 'inv-g-003',
    recipientName: 'Garage Cầu Giấy',
    cohort: '2026-W20',
    amountVnd: 6_100_000,
    status: 'paid',
    issuedAt: '2026-05-17',
  },
  {
    id: 'inv-g-004',
    recipientName: 'Garage Thanh Xuân',
    cohort: '2026-W20',
    amountVnd: 3_900_000,
    status: 'overdue',
    issuedAt: '2026-05-17',
  },
]

// ── Users ─────────────────────────────────────────────────────────────────────
export interface UserRow {
  id: string
  email: string
  name: string
  role: UserRole
  joinedAt: string
  suspended: boolean
}

export const MOCK_USERS: UserRow[] = [
  {
    id: 'usr-001',
    email: 'admin@vehicaladvertise.vn',
    name: 'Admin System',
    role: 'admin',
    joinedAt: '2026-01-01',
    suspended: false,
  },
  {
    id: 'usr-002',
    email: 'an.nguyen@gmail.com',
    name: 'Nguyễn Văn An',
    role: 'driver',
    joinedAt: '2026-03-15',
    suspended: false,
  },
  {
    id: 'usr-003',
    email: 'bich.tran@gmail.com',
    name: 'Trần Thị Bích',
    role: 'driver',
    joinedAt: '2026-03-20',
    suspended: false,
  },
  {
    id: 'usr-004',
    email: 'grab@vn.grab.com',
    name: 'Grab VN Partner',
    role: 'partner',
    joinedAt: '2026-02-10',
    suspended: false,
  },
  {
    id: 'usr-005',
    email: 'hk.garage@gmail.com',
    name: 'Garage Hoàn Kiếm',
    role: 'garage',
    joinedAt: '2026-02-28',
    suspended: false,
  },
  {
    id: 'usr-006',
    email: 'long.hoang@gmail.com',
    name: 'Hoàng Đức Long',
    role: 'driver',
    joinedAt: '2026-04-01',
    suspended: true,
  },
  {
    id: 'usr-007',
    email: 'shopee@sea.com',
    name: 'Shopee VN Partner',
    role: 'partner',
    joinedAt: '2026-03-05',
    suspended: false,
  },
]

// ── Dashboard ledger entries ───────────────────────────────────────────────────
export interface LedgerRow {
  id: string
  description: string
  amountVnd: number
  direction: 'credit' | 'debit'
  ts: string
}

export const MOCK_LEDGER_ROWS: LedgerRow[] = [
  {
    id: 'l-001',
    description: 'Driver payout — Nguyễn Văn An W21',
    amountVnd: 1_250_000,
    direction: 'debit',
    ts: '2026-05-25 09:00',
  },
  {
    id: 'l-002',
    description: 'Partner charge — Grab VN May',
    amountVnd: 42_000_000,
    direction: 'credit',
    ts: '2026-05-25 08:45',
  },
  {
    id: 'l-003',
    description: 'Driver payout — Lê Hoàng Nam W21',
    amountVnd: 1_500_000,
    direction: 'debit',
    ts: '2026-05-25 08:30',
  },
  {
    id: 'l-004',
    description: 'Garage fee — Hoàn Kiếm W21',
    amountVnd: 5_200_000,
    direction: 'debit',
    ts: '2026-05-25 08:15',
  },
  {
    id: 'l-005',
    description: 'Partner charge — Shopee VN May',
    amountVnd: 35_500_000,
    direction: 'credit',
    ts: '2026-05-24 17:00',
  },
]

// ── Reports weekly km chart ────────────────────────────────────────────────────
export interface WeeklyKmPoint {
  week: string
  km: number
}

export const MOCK_WEEKLY_KM: WeeklyKmPoint[] = [
  { week: 'W10', km: 8_200 },
  { week: 'W11', km: 9_100 },
  { week: 'W12', km: 8_750 },
  { week: 'W13', km: 10_400 },
  { week: 'W14', km: 11_200 },
  { week: 'W15', km: 10_900 },
  { week: 'W16', km: 12_300 },
  { week: 'W17', km: 11_800 },
  { week: 'W18', km: 13_100 },
  { week: 'W19', km: 12_600 },
  { week: 'W20', km: 14_000 },
  { week: 'W21', km: 13_500 },
]
