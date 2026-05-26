/**
 * Mock data for garage role panel pages.
 * Vietnamese garage names + Hanoi districts for realism.
 */

export type InstallStatus = 'matched' | 'awaiting_install' | 'installed' | 'disputed' | 'terminated'

export interface InstallOrder {
  id: string
  timeSlot: string
  vehiclePlate: string
  vehicleModel: string
  vehicleColor: string
  campaignName: string
  status: InstallStatus
  district: string
  garageName: string
  customerName: string
  customerPhone: string
  creativeSize: string
  creativePosition: string
  scheduledDate: string
}

export type PayoutStatus = 'pending' | 'paid'

export interface PayoutEntry {
  id: string
  weekLabel: string
  totalVnd: number
  status: PayoutStatus
  transactionId: string | null
  installCount: number
}

export const MOCK_INSTALL_ORDERS: InstallOrder[] = [
  {
    id: 'IO-001',
    timeSlot: '08:00 – 09:30',
    vehiclePlate: '30A-12345',
    vehicleModel: 'Toyota Vios',
    vehicleColor: 'Trắng bạc',
    campaignName: 'Highlands Coffee Q1 2026',
    status: 'awaiting_install',
    district: 'Hoàn Kiếm',
    garageName: 'Garage Minh Tuấn',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0912 345 678',
    creativeSize: '60×40 cm',
    creativePosition: 'Cánh cửa trái',
    scheduledDate: '2026-05-26',
  },
  {
    id: 'IO-002',
    timeSlot: '10:00 – 11:30',
    vehiclePlate: '29B-67890',
    vehicleModel: 'Honda City',
    vehicleColor: 'Đen tuyền',
    campaignName: 'Vinamilk Summer 2026',
    status: 'matched',
    district: 'Đống Đa',
    garageName: 'Garage Minh Tuấn',
    customerName: 'Trần Thị Bích',
    customerPhone: '0987 654 321',
    creativeSize: '50×35 cm',
    creativePosition: 'Cốp sau',
    scheduledDate: '2026-05-26',
  },
  {
    id: 'IO-003',
    timeSlot: '13:30 – 15:00',
    vehiclePlate: '30K-11223',
    vehicleModel: 'Mazda 3',
    vehicleColor: 'Xanh dương',
    campaignName: 'FPT Telecom Broadband',
    status: 'installed',
    district: 'Hai Bà Trưng',
    garageName: 'Garage Minh Tuấn',
    customerName: 'Lê Quốc Hùng',
    customerPhone: '0903 111 222',
    creativeSize: '70×50 cm',
    creativePosition: 'Mui xe',
    scheduledDate: '2026-05-25',
  },
  {
    id: 'IO-004',
    timeSlot: '09:00 – 10:30',
    vehiclePlate: '30G-44556',
    vehicleModel: 'Kia Morning',
    vehicleColor: 'Đỏ cherry',
    campaignName: 'Shopee Flash Sale 5.5',
    status: 'disputed',
    district: 'Cầu Giấy',
    garageName: 'Garage Minh Tuấn',
    customerName: 'Phạm Thị Lan',
    customerPhone: '0978 333 444',
    creativeSize: '55×38 cm',
    creativePosition: 'Cánh cửa phải',
    scheduledDate: '2026-05-24',
  },
  {
    id: 'IO-005',
    timeSlot: '14:00 – 15:30',
    vehiclePlate: '29C-99887',
    vehicleModel: 'Hyundai Accent',
    vehicleColor: 'Trắng ngọc trai',
    campaignName: 'Grab Food Campaign',
    status: 'terminated',
    district: 'Thanh Xuân',
    garageName: 'Garage Minh Tuấn',
    customerName: 'Hoàng Minh Khoa',
    customerPhone: '0965 777 888',
    creativeSize: '60×45 cm',
    creativePosition: 'Cánh cửa trái',
    scheduledDate: '2026-05-23',
  },
  {
    id: 'IO-006',
    timeSlot: '15:30 – 17:00',
    vehiclePlate: '30H-55443',
    vehicleModel: 'VinFast Fadil',
    vehicleColor: 'Xanh lá',
    campaignName: 'Tiki Tech Week',
    status: 'awaiting_install',
    district: 'Long Biên',
    garageName: 'Garage Minh Tuấn',
    customerName: 'Vũ Thị Mai',
    customerPhone: '0944 222 333',
    creativeSize: '50×35 cm',
    creativePosition: 'Cốp sau',
    scheduledDate: '2026-05-26',
  },
]

/** Today's appointments subset */
export const MOCK_TODAY_ORDERS = MOCK_INSTALL_ORDERS.filter((o) => o.scheduledDate === '2026-05-26')

export const MOCK_PAYOUT_ENTRIES: PayoutEntry[] = [
  {
    id: 'PAY-001',
    weekLabel: 'Tuần 19 – 25/05/2026',
    totalVnd: 3_600_000,
    status: 'pending',
    transactionId: null,
    installCount: 3,
  },
  {
    id: 'PAY-002',
    weekLabel: 'Tuần 12 – 18/05/2026',
    totalVnd: 4_800_000,
    status: 'paid',
    transactionId: 'TXN-20260518-8842',
    installCount: 4,
  },
  {
    id: 'PAY-003',
    weekLabel: 'Tuần 05 – 11/05/2026',
    totalVnd: 2_400_000,
    status: 'paid',
    transactionId: 'TXN-20260511-7731',
    installCount: 2,
  },
  {
    id: 'PAY-004',
    weekLabel: 'Tuần 28/04 – 04/05/2026',
    totalVnd: 6_000_000,
    status: 'paid',
    transactionId: 'TXN-20260504-6620',
    installCount: 5,
  },
  {
    id: 'PAY-005',
    weekLabel: 'Tuần 21 – 27/04/2026',
    totalVnd: 3_600_000,
    status: 'paid',
    transactionId: 'TXN-20260427-5509',
    installCount: 3,
  },
]

export const LIFETIME_EARNINGS_VND = MOCK_PAYOUT_ENTRIES.reduce((sum, e) => sum + e.totalVnd, 0)

export const PENDING_EARNINGS_VND = MOCK_PAYOUT_ENTRIES.filter(
  (e) => e.status === 'pending',
).reduce((sum, e) => sum + e.totalVnd, 0)
