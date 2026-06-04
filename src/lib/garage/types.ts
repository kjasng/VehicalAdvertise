import type { Database } from '@/types/db'

export type GarageProfile = {
  id: string
  shopName: string
  address: string
  contactName: string
  phone: string
  serviceArea: string
  googleMapsUrl: string
  workingHours: string
  approved: boolean
  balanceVnd: number
  bankAccountName: string
  bankAccountNumber: string
  bankName: string
  bankBranch: string
  bankBin: string
  bankVerified: boolean
}

export type GarageInstallStatus =
  | 'waiting_install'
  | 'waiting_review'
  | 'approved'
  | 'rejected'
  | 'closed'

export type GarageInstallJob = {
  id: string
  campaignName: string
  creativeUrl: string | null
  driverName: string
  driverPhone: string | null
  vehiclePlate: string
  vehicleModel: string
  vehicleFuel: string
  contractStatus: Database['public']['Enums']['contract_status']
  status: GarageInstallStatus
  createdAt: string
  garageSelectedAt: string | null
  installedAt: string | null
  note: string | null
  proofTotal: number
  proofPending: number
  proofApproved: number
  proofRejected: number
  latestRejectReason: string | null
}

export type GarageEarningRow = {
  id: string
  amountVnd: number
  createdAt: string
  contractId: string
  campaignName: string
  vehiclePlate: string
}

export type GarageWithdrawalRow = {
  id: string
  withdrawalNumber: string
  amountVnd: number
  status: Database['public']['Enums']['payout_status']
  requestedAt: string
  paidAt: string | null
  failureReason: string | null
}

export type GaragePayoutData = {
  profile: GarageProfile
  minimumWithdrawalVnd: number
  lifetimeEarningsVnd: number
  withdrawalsTotalVnd: number
  earnings: GarageEarningRow[]
  withdrawals: GarageWithdrawalRow[]
}
